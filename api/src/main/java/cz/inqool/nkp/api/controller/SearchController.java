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
import org.apache.hadoop.hbase.client.Get;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.Table;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SearchController {
    private static final Logger log = LoggerFactory.getLogger(HBaseController.class);
    public static final String STRIP_CHARS = ",<.>/?;:'\"[{]}\\|=+-_)(*&^%$#@!~`";

    @Autowired
    HBaseService hbase;

    @Value("${solr.base.host.query}")
    private String solrBaseHost;

    @Value("${solr.query.host.query}")
    private String solrQueryHost;

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

        Table main = hbase.table("main");
        ObjectMapper mapper = new ObjectMapper();
        List<Get> gets = new ArrayList<>();

        int groupSize = 10000;
        int idsSize = ids.length;
        for (int totalCount = 0; totalCount < idsSize;) {
            int i = 0;
            for (i = 0; i < groupSize; i++) {
                if (totalCount+i >= idsSize) {
                    break;
                }
                gets.add(new Get(ids[totalCount+i].getBytes()));
            }
            totalCount += i;

            for (Result result : main.get(gets)) {
                String topicsJson = new String(result.getValue(HBaseService.family, "topics".getBytes()));
                List<String> topics = null;
                if (!topicsJson.equals("")) {
                    topics = mapper.readValue(topicsJson, new TypeReference<List<String>>() {});
                }

                String headlinesJson = new String(result.getValue(HBaseService.family, "headlines".getBytes()));
                List<String> headlines = null;
                if (!headlinesJson.equals("")) {
                    headlines = mapper.readValue(headlinesJson, new TypeReference<List<String>>() {});
                }

                String linksJson = new String(result.getValue(HBaseService.family, "links".getBytes()));
                List<String> links = null;
                if (!linksJson.equals("")) {
                    links = mapper.readValue(linksJson, new TypeReference<List<String>>() {});
                }

                byte[] sentimentBytes = result.getValue(HBaseService.family, "sentiment".getBytes());
                Double sentiment = sentimentBytes.length == 0 ? null : Double.valueOf(new String(sentimentBytes));

                SolrQueryEntry entry = new SolrQueryEntry();
                entry.setId(Bytes.toString(result.getRow()))
                        .setLanguage(Bytes.toString(result.getValue(HBaseService.family, "language".getBytes())))
                        .setPlainText(Bytes.toString(result.getValue(HBaseService.family, "plain-text".getBytes())))
                        .setTitle(Bytes.toString(result.getValue(HBaseService.family, "title".getBytes())))
                        .setTopics(topics)
                        .setSentiment(sentiment)
                        .setHeadlines(headlines)
                        .setLinks(links)
                        .setUrl(Bytes.toString(result.getValue(HBaseService.family, "urlkey".getBytes())));
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
                        String plainText = entry.getValue().get("plainText").get(0);
                        String[] words = plainText.replace('\n', ' ').split("\\s+");
                        for (int i = 1; i < words.length; i++) {
                            if (words[i].startsWith("<em>")) {
                                String collocation = StringUtils.strip(words[i-1], STRIP_CHARS).toLowerCase(locale);
                                int start = Math.max(0, i-1-query.getContextSize());
                                int stop = Math.min(words.length, i+query.getContextSize());
                                String context = String.join(" ", Arrays.copyOfRange(words, start, stop));
                                String url = idToUrl.get(id);
                                if (!resultMap.containsKey(url)) {
                                    resultMap.put(url, new TreeMap<String, List<String>>());
                                }
                                Map<String, List<String>> resultForUrl = resultMap.get(url);
                                if (!resultForUrl.containsKey(collocation)) {
                                    resultForUrl.put(collocation, new ArrayList<String>());
                                }
                                resultForUrl.get(collocation).add(context);

                                while (i+1 < words.length && words[i+1].startsWith("<em>")) {
                                    i++;
                                }
                                i++;

                                if (i < words.length) {
                                    collocation = StringUtils.strip(words[i], STRIP_CHARS).toLowerCase(locale);
                                    start = Math.max(0, i-query.getContextSize());
                                    stop = Math.min(words.length, i+1+query.getContextSize());
                                    context = String.join(" ", Arrays.copyOfRange(words, start, stop));
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
