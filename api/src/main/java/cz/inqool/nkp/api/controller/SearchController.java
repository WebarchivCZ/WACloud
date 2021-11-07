package cz.inqool.nkp.api.controller;

import java.io.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.validation.Valid;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.inqool.nkp.api.dto.*;
import cz.inqool.nkp.api.model.FulltextSearch;
import cz.inqool.nkp.api.service.HBaseService;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.util.Bytes;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.beans.DocumentObjectBinder;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.impl.XMLResponseParser;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
public class SearchController {
    private static final Logger log = LoggerFactory.getLogger(HBaseController.class);
    public static final String STRIP_CHARS = ",<.>/?;:'\"[{]}\\|=+-_)(*&^%$#@!~`";
    private static final String STOP_WORDS_RESOURCE = "czech";

    @Autowired
    HBaseService hbase;

    @Value("${solr.base.host.query}")
    private String solrBaseHost;

    @Value("${solr.query.host.query}")
    private String solrQueryHost;

    private List<String> getStopWords() throws IOException {
        String json = WebClient.create(solrQueryHost.trim()+"/schema/analysis/stopwords/"+STOP_WORDS_RESOURCE)
                .get()
                .retrieve()
                .bodyToMono(String.class)
                .block();
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> result = mapper.readValue(json, new TypeReference<Map<String, Object>>(){});
        Map<String, Object> wordSet = (Map<String, Object>)result.get("wordSet");
        return (List<String>)wordSet.get("managedList");
    }

    private void addStopWords(List<String> stopWords) {
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

    private void clearStopWords() throws IOException {
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

    @PostMapping(value="/api/search", produces="application/zip")
    public byte[] search(@Valid @RequestBody RequestDTO request) throws SolrServerException, IOException {
        log.info("Search starts");
        String[] ids = request.getBase().getIds();
        if (ids == null || ids.length == 0) {
            HttpSolrClient solrBase = new HttpSolrClient.Builder(solrBaseHost.trim()).build();
            solrBase.setParser(new XMLResponseParser());

            SolrQuery query = new SolrQuery();
            query.set("q", request.getBase().getFilter().trim().isEmpty() ? "*:*" : request.getBase().getFilter());
            query.setRows(request.getBase().getEntries());
            query.setFields("id");
            ids = solrBase.query(query).getResults().stream().map(a -> a.getFieldValue("id")).toArray(String[]::new);
        }
        log.info("Ids fetched: " + Integer.toString(ids.length));

        HttpSolrClient solrQuery = new HttpSolrClient.Builder(solrQueryHost.trim()).build();
        solrQuery.deleteByQuery("*:*");
        solrQuery.commit();
        log.info("Index cleared");

        List<String> stopWords = Arrays.asList(request.getBase().getStopWords().clone());
        clearStopWords();
        addStopWords(stopWords);
        log.info("Stopwords changed");

        ObjectMapper mapper = new ObjectMapper();
        List<String> gets = new ArrayList<>();

        int groupSize = 10000;
        int idsSize = ids.length;
        for (int totalCount = 0; totalCount < idsSize;) {
            int i;
            for (i = 0; i < groupSize; i++) {
                if (totalCount+i >= idsSize) {
                    break;
                }
                gets.add(ids[totalCount+i]);
            }
            totalCount += i;

            for (Result result : hbase.get("main", gets)) {
                String topicsJson = hbase.getRowColumnAsString(result, "topics");
                List<String> topics = null;
                if (!topicsJson.equals("")) {
                    topics = mapper.readValue(topicsJson, new TypeReference<List<String>>() {});
                }

                String headlinesJson = hbase.getRowColumnAsString(result, "headlines");
                List<String> headlines = null;
                if (!headlinesJson.equals("")) {
                    headlines = mapper.readValue(headlinesJson, new TypeReference<List<String>>() {});
                }

                String linksJson = hbase.getRowColumnAsString(result, "links");
                List<String> links = null;
                if (!linksJson.equals("")) {
                    links = mapper.readValue(linksJson, new TypeReference<List<String>>() {});
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

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(byteArrayOutputStream);
        ZipOutputStream zipOutputStream = new ZipOutputStream(bufferedOutputStream);
        Locale locale = new Locale("cz");
        int queryIndex = 1;
        for (QueryRequest query : request.getQueries()) {
            log.info("Query request starts");
            Object result = null;
            if (query.getType() == FulltextSearch.Type.COLLOCATION) {
                //url -> word -> contexts
                Map<String, Map<String, List<String>>> resultMap = new TreeMap<>();
                for (String collocationNear : query.getTexts()) {
                    SolrQuery collocationQuery = new SolrQuery();
                    collocationQuery.setFields("id", "url")
                            .setHighlight(true)
                            .setHighlightFragsize(0)
                            .set("hl.maxAnalyzedChars", -1)
                            .set("hl.fl", "plainText")
                            .set("q", "plainText:\""+collocationNear.replace("\"", "\\\"")+"\"");
                    QueryResponse response = solrQuery.query(collocationQuery);
                    log.info("Highlight query fetched");
                    Map<String, String> idToUrl = new HashMap<>();
                    for (SolrDocument doc : response.getResults()) {
                        idToUrl.put((String)doc.getFieldValue("id"), (String)doc.getFieldValue("url"));
                    }
                    log.info("Ids to url transformed");

                    for (Map.Entry<String, Map<String, List<String>>> entry : response.getHighlighting().entrySet()) {
                        String id = entry.getKey();

                        String url = idToUrl.get(id);
                        if (!resultMap.containsKey(url)) {
                            resultMap.put(url, new TreeMap<String, List<String>>());
                        }
                        Map<String, List<String>> resultForUrl = resultMap.get(url);

                        String plainText = entry.getValue().get("plainText").get(0);
                        String[] words = plainText.replace('\n', ' ').split("\\s+");
                        for (int i = 1; i < words.length; i++) {
                            if (words[i].startsWith("<em>")) {
                                // Collocation before
                                int ni = i-1;
                                String collocation = null;
                                while (ni > 0 && (collocation == null || stopWords.contains(collocation))) {
                                    collocation = StringUtils.strip(words[ni], STRIP_CHARS).toLowerCase(locale);
                                    ni -= 1;
                                }
                                if (collocation != null && !stopWords.contains(collocation)) {
                                    int start = Math.max(0, i-1-query.getContextSize());
                                    int stop = Math.min(words.length, i+query.getContextSize());
                                    String context = String.join(" ", Arrays.copyOfRange(words, start, stop));
                                    if (!resultForUrl.containsKey(collocation)) {
                                        resultForUrl.put(collocation, new ArrayList<String>());
                                    }
                                    resultForUrl.get(collocation).add(context);
                                }

                                // Skip some words
                                while (i+1 < words.length && words[i+1].startsWith("<em>")) {
                                    i++;
                                }

                                // Collocation after
                                collocation = null;
                                while (i+1 < words.length && (collocation == null || stopWords.contains(collocation))) {
                                    collocation = StringUtils.strip(words[i+1], STRIP_CHARS).toLowerCase(locale);
                                    i += 1;
                                }
                                if (collocation != null && !stopWords.contains(collocation)) {
                                    int start = Math.max(0, i - query.getContextSize());
                                    int stop = Math.min(words.length, i + 1 + query.getContextSize());
                                    String context = String.join(" ", Arrays.copyOfRange(words, start, stop));
                                    if (!resultForUrl.containsKey(collocation)) {
                                        resultForUrl.put(collocation, new ArrayList<String>());
                                    }
                                    resultForUrl.get(collocation).add(context);
                                }
                            }
                        }
                    }
                }
                log.info("Context erased");
                result = resultMap;
            }

            if (query.getType() == FulltextSearch.Type.RAW) {
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
                collocationQuery.setRows(request.getBase().getEntries());
                QueryResponse response = solrQuery.query(collocationQuery);

                SolrDocumentList docList = response.getResults();
                DocumentObjectBinder binder = new DocumentObjectBinder();
                result = binder.getBeans(SolrQueryEntry.class, docList);
                log.info("Raw fulltext constructed");
            }
            String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(result);
            zipOutputStream.putNextEntry(new ZipEntry(Integer.toString(queryIndex) + "_" +query.getType().toString() + ".json"));
            zipOutputStream.write(json.getBytes());
            zipOutputStream.closeEntry();
            queryIndex++;
        }
        log.info("Results finished");

        zipOutputStream.finish();
        zipOutputStream.flush();
        IOUtils.closeQuietly(zipOutputStream);
        IOUtils.closeQuietly(bufferedOutputStream);
        IOUtils.closeQuietly(byteArrayOutputStream);
        return byteArrayOutputStream.toByteArray();
    }

    @PostMapping("/api/search/solr")
    public List<SolrQueryEntry> searchSolr(@Valid @RequestBody BaseRequest request) throws SolrServerException, IOException {
        HttpSolrClient solr = new HttpSolrClient.Builder(solrQueryHost.trim()).build();
        solr.setParser(new XMLResponseParser());

        SolrQuery query = new SolrQuery();
        query.set("q", request.getFilter());
        query.setRows(10);
        QueryResponse response = solr.query(query);

        SolrDocumentList docList = response.getResults();
        DocumentObjectBinder binder = new DocumentObjectBinder();
        return binder.getBeans(SolrQueryEntry.class, docList);
    }

    @PostMapping(value="/api/search/solr/zip", produces="application/zip")
    public byte[] searchToZip(@Valid @RequestBody BaseRequest request) throws SolrServerException, IOException {
        HttpSolrClient solr = new HttpSolrClient.Builder(solrQueryHost.trim()).build();
        solr.setParser(new XMLResponseParser());

        SolrQuery query = new SolrQuery();
        query.set("q", request.getFilter());
        query.setRows(Math.min(Math.max(request.getEntries().intValue(), 1), 100));
        QueryResponse response = solr.query(query);

        SolrDocumentList docList = response.getResults();
        DocumentObjectBinder binder = new DocumentObjectBinder();
        List<SolrQueryEntry> objects = binder.getBeans(SolrQueryEntry.class, docList);
        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(objects);

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(byteArrayOutputStream);
        ZipOutputStream zipOutputStream = new ZipOutputStream(bufferedOutputStream);

        zipOutputStream.putNextEntry(new ZipEntry("response.json"));
        zipOutputStream.write(json.getBytes());
        zipOutputStream.closeEntry();

        zipOutputStream.finish();
        zipOutputStream.flush();
        IOUtils.closeQuietly(zipOutputStream);
        IOUtils.closeQuietly(bufferedOutputStream);
        IOUtils.closeQuietly(byteArrayOutputStream);
        return byteArrayOutputStream.toByteArray();
    }
}
