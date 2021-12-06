package cz.inqool.nkp.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.inqool.nkp.api.dto.BaseRequest;
import cz.inqool.nkp.api.dto.QueryRequest;
import cz.inqool.nkp.api.dto.SolrQueryEntry;
import org.apache.commons.lang.StringUtils;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.util.Bytes;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.beans.DocumentObjectBinder;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.impl.XMLResponseParser;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;

@Service
public class SearchServiceImpl implements SearchService {
    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    public static final String STRIP_CHARS = ",<.>/?;:'\"[{]}\\|=+-_)(*&^%$#@!~`";
    private static final String STOP_WORDS_RESOURCE = "czech";

    private final HBaseService hbase;
    private final HttpSolrClient solrBase;
    private final HttpSolrClient solrQuery;
    private final String solrQueryHost;
    private final ObjectMapper mapper;

    public SearchServiceImpl(@Value("${solr.base.host.query}") String solrBaseHost, @Value("${solr.query.host.query}") String solrQueryHost, HBaseService hbase) {
        this.hbase = hbase;
        this.solrBase = new HttpSolrClient.Builder(solrBaseHost.trim()).build();
        this.solrBase.setParser(new XMLResponseParser());
        this.solrQuery = new HttpSolrClient.Builder(solrQueryHost.trim()).build();
        this.solrQueryHost = solrQueryHost;
        this.mapper = new ObjectMapper();
    }

    @Override
    public void index(BaseRequest query) {
        try {
            String[] ids = query.getIds();
            if (ids == null || ids.length == 0) {
                SolrQuery solrQuery = new SolrQuery();
                solrQuery.set("q", query.getFilter().trim().isEmpty() ? "*:*" : query.getFilter());
                solrQuery.setRows(query.getEntries());
                solrQuery.setSort("random_"+query.getRandomSeed(), SolrQuery.ORDER.asc);
                solrQuery.setFields("id");
                ids = solrBase.query(solrQuery).getResults().stream().map(a -> (String)a.getFieldValue("id")).toArray(String[]::new);
            }
            log.info("Ids fetched: " + ids.length);

            HttpSolrClient solrQuery = new HttpSolrClient.Builder(solrQueryHost.trim()).build();
            solrQuery.deleteByQuery("*:*");
            solrQuery.commit();
            log.info("Index cleared");

            List<String> stopWords = Arrays.asList(query.getStopWords().clone());
            clearStopWords();
            addStopWords(stopWords);
            log.info("Stopwords changed");

            List<String> gets = new ArrayList<>();

            int groupSize = 10000;
            int idsSize = ids.length;
            for (int totalCount = 0; totalCount < idsSize; ) {
                int i;
                for (i = 0; i < groupSize; i++) {
                    if (totalCount + i >= idsSize) {
                        break;
                    }
                    gets.add(ids[totalCount + i]);
                }
                totalCount += i;

                for (Result result : hbase.get("main", gets)) {
                    String topicsJson = hbase.getRowColumnAsString(result, "topics");
                    List<String> topics = null;
                    if (!topicsJson.equals("")) {
                        topics = mapper.readValue(topicsJson, new TypeReference<List<String>>() {
                        });
                    }

                    String headlinesJson = hbase.getRowColumnAsString(result, "headlines");
                    List<String> headlines = null;
                    if (!headlinesJson.equals("")) {
                        headlines = mapper.readValue(headlinesJson, new TypeReference<List<String>>() {
                        });
                    }

                    String linksJson = hbase.getRowColumnAsString(result, "links");
                    List<String> links = null;
                    if (!linksJson.equals("")) {
                        links = mapper.readValue(linksJson, new TypeReference<List<String>>() {
                        });
                    }

                    Double sentiment = hbase.getRowColumnAsDouble(result, "sentiment");

                    SolrQueryEntry entry = new SolrQueryEntry();
                    entry.setId(Bytes.toString(result.getRow()))
                            .setLanguage(hbase.getRowColumnAsString(result, "language"))
                            .setPlainText(hbase.getRowColumnAsString(result, "plain-text"))
                            .setTitle(hbase.getRowColumnAsString(result, "title"))
                            .setTopics(topics)
                            .setSentiment(sentiment)
                            .setHeadlines(headlines)
                            .setLinks(links)
                            .setUrl(hbase.getRowColumnAsString(result, "urlkey"));
                    solrQuery.addBean(entry);
                }

                solrQuery.commit();
                gets.clear();
                log.info("PUMP: imported {}", totalCount);
            }
            log.info("Objects fetched");
        }
        catch (Throwable ex) {
            log.error("Cannot index base query.", ex);
        }
    }

    @Override
    public byte[] query(QueryRequest query) {
        try {
            Object result = null;
            switch (query.getType()) {
                case COLLOCATION: result = queryCollocation(query); break;
                case RAW: result = queryRaw(query); break;
                default:
                    log.warn("Unknown type of query: "+ query.getType().toString());
            }
            String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(result);
            return json.getBytes();
        }
        catch (Throwable ex) {
            throw new RuntimeException("Error during processing query.", ex);
        }
    }

    private Map<String, Map<String, List<String>>> queryCollocation(QueryRequest query) {
        try {
            Locale locale = new Locale("cz");
            List<String> stopWords = getStopWords();
            //url -> word -> contexts
            Map<String, Map<String, List<String>>> resultMap = new TreeMap<>();
            for (String collocationNear : query.getTexts()) {
                SolrQuery collocationQuery = new SolrQuery();
                collocationQuery.setFields("id", "url")
                        .setHighlight(true)
                        .setHighlightFragsize(0)
                        .set("hl.maxAnalyzedChars", -1)
                        .set("hl.fl", "plainText")
                        .set("q", "plainText:\"" + collocationNear.replace("\"", "\\\"") + "\"");
                QueryResponse response = solrQuery.query(collocationQuery);
                log.info("Highlight query fetched");
                Map<String, String> idToUrl = new HashMap<>();
                for (SolrDocument doc : response.getResults()) {
                    idToUrl.put((String) doc.getFieldValue("id"), (String) doc.getFieldValue("url"));
                }
                log.info("Ids to url transformed");

                for (Map.Entry<String, Map<String, List<String>>> entry : response.getHighlighting().entrySet()) {
                    String id = entry.getKey();

                    String url = idToUrl.get(id);
                    if (!resultMap.containsKey(url)) {
                        resultMap.put(url, new TreeMap<>());
                    }
                    Map<String, List<String>> resultForUrl = resultMap.get(url);

                    String plainText = entry.getValue().get("plainText").get(0);
                    String[] words = plainText.replace('\n', ' ').split("\\s+");
                    for (int i = 1; i < words.length; i++) {
                        if (words[i].startsWith("<em>")) {
                            // Collocation before
                            int ni = i - 1;
                            String collocation = null;
                            while (ni > 0 && (collocation == null || stopWords.contains(collocation))) {
                                collocation = StringUtils.strip(words[ni], STRIP_CHARS).toLowerCase(locale);
                                ni -= 1;
                            }
                            if (collocation != null && !stopWords.contains(collocation)) {
                                int start = Math.max(0, i - 1 - query.getContextSize());
                                int stop = Math.min(words.length, i + query.getContextSize());
                                String context = String.join(" ", Arrays.copyOfRange(words, start, stop));
                                if (!resultForUrl.containsKey(collocation)) {
                                    resultForUrl.put(collocation, new ArrayList<>());
                                }
                                resultForUrl.get(collocation).add(context);
                            }

                            // Skip some words
                            while (i + 1 < words.length && words[i + 1].startsWith("<em>")) {
                                i++;
                            }

                            // Collocation after
                            collocation = null;
                            while (i + 1 < words.length && (collocation == null || stopWords.contains(collocation))) {
                                collocation = StringUtils.strip(words[i + 1], STRIP_CHARS).toLowerCase(locale);
                                i += 1;
                            }
                            if (collocation != null && !stopWords.contains(collocation)) {
                                int start = Math.max(0, i - query.getContextSize());
                                int stop = Math.min(words.length, i + 1 + query.getContextSize());
                                String context = String.join(" ", Arrays.copyOfRange(words, start, stop));
                                if (!resultForUrl.containsKey(collocation)) {
                                    resultForUrl.put(collocation, new ArrayList<>());
                                }
                                resultForUrl.get(collocation).add(context);
                            }
                        }
                    }
                }
            }
            return resultMap;
        }
        catch (Throwable ex) {
            throw new RuntimeException("Error during collocation query.", ex);
        }
    }

    private List<SolrQueryEntry> queryRaw(QueryRequest query) {
        try {
            StringBuilder queryString = new StringBuilder();
            for (String collocationNear : query.getTexts()) {
                if (queryString.length() > 0) {
                    queryString.append(" OR ");
                }
                queryString.append("plainText:\"").append(collocationNear.replace("\"", "\\\"")).append("\"");
            }
            if (queryString.length() == 0) {
                queryString.append("*:*");
            }
            SolrQuery collocationQuery = new SolrQuery();
            collocationQuery.set("q", queryString.toString());
            collocationQuery.setRows(query.getLimit());
            QueryResponse response = solrQuery.query(collocationQuery);

            SolrDocumentList docList = response.getResults();
            DocumentObjectBinder binder = new DocumentObjectBinder();
            return binder.getBeans(SolrQueryEntry.class, docList);
        }
        catch (Throwable ex) {
            throw new RuntimeException("Error during raw query.", ex);
        }
    }

    @Override
    public List<String> getStopWords() {
        String json = WebClient.create(solrQueryHost.trim()+"/schema/analysis/stopwords/"+STOP_WORDS_RESOURCE)
                .get()
                .retrieve()
                .bodyToMono(String.class)
                .block();
        try {
            Map<String, Object> result = mapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
            Map<String, Object> wordSet = (Map<String, Object>) result.get("wordSet");
            return (List<String>) wordSet.get("managedList");
        }
        catch (Throwable ex) {
            log.error("Cannot get stopwords.", ex);
            return new ArrayList<>();
        }
    }

    @Override
    public void addStopWords(List<String> stopWords) {
        Map<String, Object> body = new HashMap<>();
        Map<String, Boolean> initArgs = new HashMap<>();
        initArgs.put("ignoreCase", true);
        body.put("initArgs", initArgs);
        body.put("managedList", stopWords);

        WebClient.create(solrQueryHost.trim()+"/schema/analysis/stopwords/"+STOP_WORDS_RESOURCE)
                .put()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(body), body.getClass())
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    @Override
    public void clearStopWords() {
        List<String> words = getStopWords();
        WebClient.RequestHeadersUriSpec<?> request = WebClient
                .create(solrQueryHost.trim() + "/schema/analysis/stopwords/" + STOP_WORDS_RESOURCE + "/")
                .delete();
        for (String word : words) {
            request.uri(word)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        }
    }

    @Override
    public void changeStopWords(List<String> stopWords) {
        clearStopWords();
        addStopWords(stopWords);
    }
}
