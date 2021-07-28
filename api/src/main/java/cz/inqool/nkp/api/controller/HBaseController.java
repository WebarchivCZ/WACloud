package cz.inqool.nkp.api.controller;

import cz.inqool.nkp.api.dto.Harvest;
import cz.inqool.nkp.api.dto.SolrBaseEntry;
import cz.inqool.nkp.api.service.HBaseService;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.util.Bytes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class HBaseController {
    private static final Logger log = LoggerFactory.getLogger(HBaseController.class);

    @Value("${solr.base.host.query}")
    private String solrBaseHost;

    @Autowired
    HBaseService hbase;

    @GetMapping("/api/harvest/{id}")
    public Harvest getHarvest(@PathVariable String id) throws IOException {
        Map<String, byte[]> row = hbase.getAll(hbase.table("harvest"), id);
        Date date = null;
        try {
            String dateStr = Bytes.toString(row.get("date"));
            date = new SimpleDateFormat("yyyyMMdd").parse(dateStr);
        } catch (ParseException e) {
            log.error(e.toString());
        }
        String type = Bytes.toString(row.get("type"));
        return new Harvest(id, date, type);
    }

    @GetMapping("/api/harvest")
    public List<Harvest> getHarvests() throws IOException {
        List<Harvest> harvests = new ArrayList<>();
        try (ResultScanner scanner = hbase.scan("harvest")) {
            for (Result result : scanner) {
                String row = new String(result.getRow());
                Date date = null;
                try {
                    String dateStr = new String(result.getValue(HBaseService.family, "date".getBytes()));
                    date = new SimpleDateFormat("yyyyMMdd").parse(dateStr);
                } catch (ParseException e) {
                    log.error(e.toString());
                }
                String type = new String(result.getValue(HBaseService.family, "type".getBytes()));
                harvests.add(new Harvest(row, date, type));
            }
        }
        return harvests;
    }
	
    @GetMapping("/api/topic")
    public Set<String> getTopics() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return new TreeSet<>(mapper.readValue(hbase.get(hbase.table("config"), "topics", "value"), new TypeReference<Map<String, Long>>() {}).keySet());
    }

    @GetMapping("/api/webtype")
    public Set<String> getWebTypes() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return new TreeSet<>(mapper.readValue(hbase.get(hbase.table("config"), "webtypes", "value"), new TypeReference<Map<String, Long>>() {}).keySet());
    }

    @PostMapping("/api/clear")
    public void clearData() throws IOException, SolrServerException {
        HttpSolrClient solrBase = new HttpSolrClient.Builder(solrBaseHost.trim()).build();
        solrBase.deleteByQuery("*:*");
        solrBase.commit();
        log.info("Data cleared");
    }

    @PostMapping("/api/pump")
    public int pumpData(String harvestId) throws IOException, SolrServerException {
        HttpSolrClient solrBase = new HttpSolrClient.Builder(solrBaseHost.trim()).build();
        Harvest harvest = getHarvest(harvestId);

        int totalCount = 0;
        int count = 0;
        String[] columns = new String[]{"urlkey", "topics", "sentiment", "harvest-id", "web-page-type"};
        Map<String, byte[]> filters = new HashMap<String, byte[]>(){{
            put("harvest-id", harvestId.getBytes());
        }};
        ObjectMapper mapper = new ObjectMapper();
        try (ResultScanner scanner = hbase.scan("main", columns, filters)) {
            for (Result result : scanner) {
                String id = Bytes.toString(result.getRow());
                String url = Bytes.toString(result.getValue(HBaseService.family, "urlkey".getBytes()));
                String webType = Bytes.toString(result.getValue(HBaseService.family, "web-page-type".getBytes()));

                String topicsJson = Bytes.toString(result.getValue(HBaseService.family, "topics".getBytes()));
                List<String> topics = null;
                if (!topicsJson.equals("")) {
                    topics = mapper.readValue(topicsJson, new TypeReference<List<String>>() {});
                }

                byte[] sentimentBytes = result.getValue(HBaseService.family, "sentiment".getBytes());
                Double sentiment = sentimentBytes.length == 0 ? null : Double.valueOf(new String(sentimentBytes));

                SolrBaseEntry entry = new SolrBaseEntry();
                entry.setId(id)
                        .setSentiment(sentiment)
                        .setTopics(topics)
                        .setUrl(url)
                        .setDate(harvest.getDate())
                        .setHarvestType(harvest.getType())
                        .setWebType(webType);
                solrBase.addBean(entry);

                count += 1;
                totalCount += 1;
                if (count % 10000 == 0) {
                    solrBase.commit();
                    count = 0;
                    log.info("PUMP: imported {}", totalCount);
                }
            }
        }
        log.info("PUMP: imported {}", totalCount);
        return totalCount;
    }
}