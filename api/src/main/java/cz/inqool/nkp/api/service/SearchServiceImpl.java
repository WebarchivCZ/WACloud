package cz.inqool.nkp.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.inqool.nkp.api.dto.*;
import cz.inqool.nkp.api.model.AnalyticQuery;
import cz.inqool.nkp.api.model.Harvest;
import cz.inqool.nkp.api.model.Search;
import cz.inqool.nkp.api.repository.AnalyticQueryRepository;
import cz.inqool.nkp.api.repository.HarvestRepository;
import cz.inqool.nkp.api.repository.SearchRepository;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.util.Bytes;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.beans.DocumentObjectBinder;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.impl.XMLResponseParser;
import org.apache.solr.client.solrj.request.QueryRequest;
import org.apache.solr.client.solrj.response.PivotField;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.util.NamedList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.PersistenceContext;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchServiceImpl implements SearchService {
    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    public static final String DEFAULT_RANDOM_SEED = "NKP";
    public static final String STRIP_CHARS = ",<.>/?;:'\"[{]}\\|=+-_)(*&^%$#@!~`";
    private static final String STOP_WORDS_RESOURCE = "czech";

    private final HBaseService hbase;
    private final SearchRepository searchRepository;
    private final HarvestRepository harvestRepository;
    private final AnalyticQueryRepository analyticQueryRepository;
    private final HttpSolrClient solrBase;
    private final HttpSolrClient solrQuery;
    private final String solrQueryHost;
    private final ObjectMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    public SearchServiceImpl(@Value("${solr.base.host.query}") String solrBaseHost, @Value("${solr.query.host.query}") String solrQueryHost, HBaseService hbase, SearchRepository searchRepository, AnalyticQueryRepository analyticQueryRepository, HarvestRepository harvestRepository) {
        this.hbase = hbase;
        this.solrBase = new HttpSolrClient.Builder(solrBaseHost.trim()).build();
        this.searchRepository = searchRepository;
        this.harvestRepository = harvestRepository;
        this.analyticQueryRepository = analyticQueryRepository;
        this.solrBase.setParser(new XMLResponseParser());
        this.solrQuery = new HttpSolrClient.Builder(solrQueryHost.trim()).build();
        this.solrQueryHost = solrQueryHost;
        this.mapper = new ObjectMapper();
    }

    private SolrQuery prepareQueryForIndex(Search query) {
        String seed = query.getRandomSeed();
        if (seed == null || seed.equals("")) {
            seed = DEFAULT_RANDOM_SEED;
        }

        SolrQuery solrQuery = new SolrQuery();
        List<String> queriesArray = new ArrayList<>();
        queriesArray.add(query.getFilter().trim());
        if (query.getHarvests() != null && !query.getHarvests().isEmpty()) {
            queriesArray.add("harvestId: ("+
                    query.getHarvests().stream().map(h -> "\""+h+"\"")
                            .collect(Collectors.joining(" OR "))+
                    ")"
            );
        }
        queriesArray = queriesArray.stream().filter(a -> a != null && a.length() > 0).collect(Collectors.toList());
        if (queriesArray.size() > 1) {
            queriesArray = queriesArray.stream().map(u -> "("+u+")").collect(Collectors.toList());
        }
        String localQuery = String.join(" AND ", queriesArray);
        log.info("QUERY: "+localQuery);

        solrQuery.set("q", localQuery.isEmpty() ? "*:*" : localQuery);
        solrQuery.setRows(query.getEntries());
        solrQuery.setSort("random_"+seed, SolrQuery.ORDER.asc);
        solrQuery.setFields("id");
        return solrQuery;
    }

    @Override
    public long estimate(Search query) {
        List<String> ids = query.getIds();
        if (ids != null && !ids.isEmpty()) {
            return ids.size();
        }
        SolrQuery solrQuery = prepareQueryForIndex(query);
        solrQuery.setRows(0);
        try {
            long found = solrBase.query(solrQuery).getResults().getNumFound();
            return Math.min(found, query.getEntries());
        }
        catch (Throwable ex) {
            log.error("Cannot estimate base query.", ex);
            return 0;
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void index(Search s) {
        Search query = searchRepository.findById(s.getId()).get();
        if (query.getState().equals(Search.State.STOPPED)) {
            throw new RuntimeException("This job was stopped.");
        }
        try {
            List<String> ids = query.getIds();
            if (ids == null || ids.isEmpty()) {
                SolrQuery solrQuery = prepareQueryForIndex(query);
                ids = solrBase.query(solrQuery).getResults().stream().map(a -> (String)a.getFieldValue("id")).collect(Collectors.toList());
            }
            log.info("Ids fetched: " + ids.size());

            HttpSolrClient solrQuery = new HttpSolrClient.Builder(solrQueryHost.trim()).build();
            solrQuery.deleteByQuery("*:*");
            solrQuery.commit();
            log.info("Index cleared");

            clearStopWords();
            addStopWords(query.getStopWords());
            log.info("Stopwords changed");

            Map<String, LocalDate> harvestToDate = harvestRepository.findAll()
                    .stream()
                    .collect(Collectors.toMap(Harvest::getIdentification, Harvest::getDate));

            List<String> gets = new ArrayList<>();

            int groupSize = 1000;
            int idsSize = ids.size();
            for (int totalCount = 0; totalCount < idsSize; ) {
                int i;
                for (i = 0; i < groupSize; i++) {
                    if (totalCount + i >= idsSize) {
                        break;
                    }
                    gets.add(ids.get(totalCount + i));
                }
                totalCount += i;

                for (Result result : hbase.get("main", gets)) {
                    Result baseResult = result;
                    String refersTo = hbase.getRowColumnAsString(result, "refers-to");
                    if (!refersTo.isEmpty()) {
                        // TODO recursive search
                        // TODO how to merge results
                        String uuid = refersTo.substring(9);
                        log.info("Looking for refersTo "+uuid);
                        Result tempResult = hbase.getOne("main", uuid);
                        if (tempResult != null) {
                            baseResult = tempResult;
                        }
                    }

                    String topicsJson = hbase.getRowColumnAsString(baseResult, "topics");
                    List<String> topics = null;
                    if (!topicsJson.equals("")) {
                        topics = mapper.readValue(topicsJson, new TypeReference<List<String>>() {
                        });
                    }

                    String headlinesJson = hbase.getRowColumnAsString(baseResult, "headlines");
                    List<String> headlines = null;
                    if (!headlinesJson.equals("")) {
                        headlines = mapper.readValue(headlinesJson, new TypeReference<List<String>>() {
                        });
                    }

                    String linksJson = hbase.getRowColumnAsString(baseResult, "links");
                    List<String> links = new ArrayList<>();
                    if (!linksJson.equals("")) {
                        links = mapper.readValue(linksJson, new TypeReference<List<String>>() {
                        });
                    }

                    Double sentiment = hbase.getRowColumnAsDouble(baseResult, "sentiment");

                    // Parse url
                    String url = hbase.getRowColumnAsString(baseResult, "urlkey");
                    String domain = url.split("/",2)[0];
                    String[] domainParts = domain.split("\\.");
                    String domainTopLevel = domainParts[domainParts.length-1];
                    if (domainParts.length > 1) {
                        domainTopLevel = domainParts[domainParts.length-2] + "." + domainParts[domainParts.length-1];
                    }

                    List<String> linksDomain = links.stream().map(l ->
                            l.replace("http://","")
                                    .replace("https://","")
                                    .split("/",2)[0]
                    ).collect(Collectors.toList());

                    List<String> linksDomainTopLevel = links.stream().map(l -> {
                        String ldomain = l.replace("http://","")
                                        .replace("https://","")
                                        .split("/",2)[0];
                        String[] ldomainParts = ldomain.split("\\.");
                        String ldomainTopLevel = ldomainParts[ldomainParts.length-1];
                        if (ldomainParts.length > 1) {
                            ldomainTopLevel = ldomainParts[ldomainParts.length-2] + "." + ldomainParts[ldomainParts.length-1];
                        }
                        return ldomainTopLevel;
                    }).collect(Collectors.toList());

                    // Parse date
                    LocalDate date = harvestToDate.getOrDefault(hbase.getRowColumnAsString(baseResult, "harvest-id"), null);

                    SolrQueryEntry entry = new SolrQueryEntry();
                    entry.setId(Bytes.toString(baseResult.getRow()))
                            .setLanguage(hbase.getRowColumnAsString(baseResult, "language"))
                            .setPlainText(hbase.getRowColumnAsString(baseResult, "plain-text"))
                            .setTitle(hbase.getRowColumnAsString(baseResult, "title"))
                            .setTopics(topics)
                            .setSentiment(sentiment)
                            .setHeadlines(headlines)
                            .setLinks(links)
                            .setLinksDomain(linksDomain)
                            .setLinksDomainTopLevel(linksDomainTopLevel)
                            .setUrl(url)
                            .setUrlDomain(domain.startsWith("www.") ? domain.substring(4) : domain)
                            .setUrlDomainTopLevel(domainTopLevel);
                    if (date != null) {
                        entry.setYear(date.getYear());
                    }
                    solrQuery.addBean(entry);
                }

                solrQuery.commit();
                gets.clear();

                setIndexed(query, totalCount);
                log.info("PUMP: imported {}", totalCount);
            }
            log.info("Objects fetched");
        }
        catch (Throwable ex) {
            log.error("Cannot index base query.", ex);
        }
    }

    @Override
    public byte[] query(AnalyticQuery query) {
        try {
            Object result = null;
            switch (query.getType()) {
                case COLLOCATION: result = queryCollocation(query); break;
                case FREQUENCY: result = queryFrequency(query); break;
                case NETWORK: result = queryNetwork(query); break;
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

    private Map<String, Map<String, Integer>> queryFrequency(AnalyticQuery query) throws SolrServerException, IOException {
        StringBuilder queryString = new StringBuilder();
        for (String collocationNear : query.getExpressions()) {
            if (queryString.length() > 0) {
                queryString.append(" OR ");
            }
            queryString.append("plainText:\"").append(collocationNear.replace("\"", "\\\"")).append("\"");
        }
        if (queryString.length() == 0) {
            queryString.append("*:*");
        }
        Long numFound = null;
        int start = 0;
        Map<String, Map<String, Integer>> results = new HashMap<>();

        while (numFound == null || start < numFound) {
            SolrQuery collocationQuery = new SolrQuery();
            collocationQuery.setRequestHandler("/tvrh")
                    .setStart(start)
                    .setRows(10)
                    .setFields("id,url")
                    .set("q", queryString.toString())
                    .set("tv.tf", "true")
                    .set("tv.fl", "plainTextTerms");
            NamedList<Object> response = solrQuery.request(new QueryRequest(collocationQuery));
            NamedList<NamedList<Object>> termVectors = (NamedList<NamedList<Object>>)response.get("termVectors");
            SolrDocumentList docs = (SolrDocumentList)response.get("response");
            numFound = docs.getNumFound();
            start += docs.size();

            Map<String, String> idToUrl = new HashMap<>();
            docs.forEach(doc -> {
                idToUrl.put((String)doc.getFieldValue("id"), (String)doc.getFieldValue("url"));
            });
            List<String> stopWords = getStopWords();

            termVectors.forEach(doc -> {
                List<ImmutablePair<String, Integer>> counts = new ArrayList<>();

                NamedList<NamedList<Integer>> terms = (NamedList<NamedList<Integer>>)doc.getValue().get("plainTextTerms");
                if (terms != null) {
                    terms.forEach(term -> {
                        if (!stopWords.contains(term.getKey())) {
                            counts.add(new ImmutablePair<>(term.getKey(), term.getValue().get("tf")));
                        }
                    });
                    counts.sort(new Comparator<Map.Entry<String, Integer>>() {
                        @Override
                        public int compare(Map.Entry<String, Integer> e1, Map.Entry<String, Integer> e2) {
                            return e2.getValue().compareTo(e1.getValue());
                        }
                    });
                }
                LinkedHashMap<String, Integer> docCounts = new LinkedHashMap<>();
                counts.stream().limit(query.getLimit()).forEachOrdered(e -> docCounts.put(e.getKey(), e.getValue()));
                results.put(idToUrl.get(doc.getKey()), docCounts);
            });
        }


        return results;
    }

    private Map<String, Map<String, List<String>>> queryCollocation(AnalyticQuery query) {
        try {
            Locale locale = new Locale("cz");
            List<String> stopWords = getStopWords();
            //url -> word -> contexts
            Map<String, Map<String, List<String>>> resultMap = new TreeMap<>();
            for (String collocationNear : query.getExpressions()) {
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

    private List<SolrQueryEntry> queryRaw(AnalyticQuery query) {
        try {
            StringBuilder queryString = new StringBuilder();
            for (String collocationNear : query.getExpressions()) {
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

    private List<NetworkSearchYear> queryNetwork(AnalyticQuery query) {
        try {
            String urls = query.getExpressions().stream().map(v -> "url:/.*"+v+".*/").collect(Collectors.joining(" OR "));
            String links = query.getExpressionsOpposite().stream().map(v -> "links:/.*"+v+".*/").collect(Collectors.joining(" OR "));

            if (!urls.isEmpty()) {
                urls = "("+urls+")";
            }
            if (!links.isEmpty()) {
                links = "("+links+")";
            }

            String queryString = "";
            if (!urls.isEmpty() && !links.isEmpty()) {
                queryString = urls + " AND " + links;
            }
            else if (urls.isEmpty() && links.isEmpty()) {
                queryString = "*:*";
            }
            else {
                queryString = urls + links;
            }

            String pivot = "year,"+(query.isUseOnlyDomains() ? "urlDomain" : "url") + "," +(query.isUseOnlyDomainsOpposite() ? "linksDomain" : "links");

            SolrQuery collocationQuery = new SolrQuery();
            collocationQuery.set("q", queryString);
            collocationQuery.set("facet", "true");
            collocationQuery.set("facet.limit", -1);
            collocationQuery.set("facet.pivot", pivot);
            if (!query.getExpressionsOpposite().isEmpty()) {
                query.getExpressionsOpposite().forEach(l -> collocationQuery.add("f."+(query.isUseOnlyDomainsOpposite() ? "linksDomain" : "links")+".facet.contains", l));
            }
            collocationQuery.setRows(0);
            QueryResponse response = solrQuery.query(collocationQuery);

            List<NetworkSearchYear> result = new ArrayList<>();
            List<PivotField> years = response.getFacetPivot().get(pivot);
            if (years != null) {
                for (PivotField yearPivot : years) {

                    NetworkSearchYear year = new NetworkSearchYear();
                    year.setYear((Integer) yearPivot.getValue());

                    if (yearPivot.getPivot() != null) {
                        for (PivotField urlPivot : yearPivot.getPivot()) {

                            NetworkSearchNode node = new NetworkSearchNode();
                            node.setName((String) urlPivot.getValue());

                            if (urlPivot.getPivot() != null) {
                                for (PivotField linkPivot : urlPivot.getPivot()) {

                                    NetworkSearchLinkCount linkCount = new NetworkSearchLinkCount();
                                    linkCount.setName((String) linkPivot.getValue());
                                    linkCount.setCount(linkPivot.getCount());

                                    node.getLinks().add(linkCount);
                                }
                            }

                            year.getNodes().add(node);

                        }
                    }

                    result.add(year);
                }
            }

            return result;
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

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Search findFirstWaitingSearch() {
        List<Search> searches = searchRepository.findByState(Search.State.WAITING);
        if (searches.isEmpty()) {
            return null;
        }
        return searches.get(0);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void setIndexed(Search s, int totalCount) {
        Search search = searchRepository.findById(s.getId()).get();
        if (search.getState().equals(Search.State.STOPPED)) {
            search.setFinishedAt(new Date());
            searchRepository.saveAndFlush(search);
            throw new RuntimeException("This job was stopped.");
        }
        search.setIndexed(totalCount);
        searchRepository.saveAndFlush(search);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void startIndexing(Search s) {
        Search search = searchRepository.findById(s.getId()).get();
        if (search.getState().equals(Search.State.STOPPED)) {
            search.setFinishedAt(new Date());
            searchRepository.saveAndFlush(search);
            throw new RuntimeException("This job was stopped.");
        }
        search.setState(Search.State.INDEXING);
        search.setStartedAt(new Date());
        searchRepository.saveAndFlush(search);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void startProcessing(Search s) {
        Search search = searchRepository.findById(s.getId()).get();
        if (search.getState().equals(Search.State.STOPPED)) {
            search.setFinishedAt(new Date());
            searchRepository.saveAndFlush(search);
            throw new RuntimeException("This job was stopped.");
        }
        search.setState(Search.State.PROCESSING);
        searchRepository.saveAndFlush(search);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void startProcessingQuery(AnalyticQuery s) {
        AnalyticQuery analyticQuery = analyticQueryRepository.findById(s.getId()).get();
        Search search = analyticQuery.getSearch();
        if (search.getState().equals(Search.State.STOPPED)) {
            search.setFinishedAt(new Date());
            searchRepository.saveAndFlush(search);
            throw new RuntimeException("This job was stopped.");
        }
        analyticQuery.setState(AnalyticQuery.State.RUNNING);
        analyticQuery.setStartedAt(new Date());
        analyticQueryRepository.saveAndFlush(analyticQuery);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void finishProcessingQuery(AnalyticQuery s, byte[] data) {
        AnalyticQuery analyticQuery = analyticQueryRepository.findById(s.getId()).get();
        analyticQuery.setData(data);
        analyticQuery.setState(AnalyticQuery.State.FINISHED);
        analyticQuery.setFinishedAt(new Date());
        analyticQueryRepository.saveAndFlush(analyticQuery);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void finishProcessing(Search s, Search.State state) {
        Search search = searchRepository.findById(s.getId()).get();
        search.setState(state);
        search.setFinishedAt(new Date());
        searchRepository.saveAndFlush(search);
    }

    @Override
//    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processOneScheduledJob() {
        Search search = findFirstWaitingSearch();
        if (search == null) {
            return;
        }

        try {
            startIndexing(search);
            index(search);
            startProcessing(search);

            for (AnalyticQuery analyticQuery : search.getQueries()) {
                if (!analyticQuery.getState().equals(AnalyticQuery.State.WAITING)) {
                    continue;
                }
                startProcessingQuery(analyticQuery);
                // Process analytic query
                byte[] data = query(analyticQuery);
                finishProcessingQuery(analyticQuery, data);
            }

            finishProcessing(search, Search.State.DONE);
        }
        catch (Throwable ex) {
            log.error("Error during processing", ex);
            finishProcessing(search, Search.State.ERROR);
        }
    }
}
