package cz.inqool.nkp.api.controller;

import cz.inqool.nkp.api.dto.HBaseHarvest;
import cz.inqool.nkp.api.dto.SolrBaseEntry;
import cz.inqool.nkp.api.dto.SolrQueryEntry;
import org.apache.hadoop.hbase.CompareOperator;
import org.apache.hadoop.hbase.filter.SingleColumnValueFilter;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.util.Bytes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class HBaseController {
    private static final Logger log = LoggerFactory.getLogger(HBaseController.class);
    
    private static final byte[] family = "cf1".getBytes();

    @Value("${hbase.zookeeper.quorum}")
    private String hbaseHost;

    @Value("${zookeeper.znode.parent}")
    private String zookeeperNode;
    
    private Configuration getConfig() throws IOException {
        Configuration config = HBaseConfiguration.create();
        config.set("hbase.zookeeper.quorum", hbaseHost);
        config.set("zookeeper.znode.parent", zookeeperNode);
        HBaseAdmin.available(config);
        return config;
    }

    private static String getRowValue(Table table, String row) throws IOException {
        // TODO Fix if no values exist
        Result r = table.get(new Get(Bytes.toBytes(row)));
        return Bytes.toString(r.getValue(family, Bytes.toBytes("value")));
    }

    @GetMapping("/api/harvest")
    public List<HBaseHarvest> getHarvests() throws IOException {
        Configuration config = getConfig();
        List<HBaseHarvest> harvests = new ArrayList<>();
        try (Connection connection = ConnectionFactory.createConnection(config)) {
            Table table = connection.getTable(TableName.valueOf("harvest"));
            
            Scan scan = new Scan();
            scan.addFamily(family);
            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    String row = new String(result.getRow());
                    Date date = null;
                    try {
                        String dateStr = new String(result.getValue(family, "date".getBytes()));
                        date = new SimpleDateFormat("yyyyMMdd").parse(dateStr);
                    } catch (ParseException e) {
                        log.error(e.toString());
                    }
                    String type = new String(result.getValue(family, "type".getBytes()));
                    harvests.add(new HBaseHarvest(row, date, type));
                }
            }
        }
        return harvests;
    }
	
    @GetMapping("/api/topic")
    public Set<String> getTopics() throws IOException {
        Configuration config = getConfig();
        try (Connection connection = ConnectionFactory.createConnection(config)) {
            Table table = connection.getTable(TableName.valueOf("config"));

            ObjectMapper mapper = new ObjectMapper();
            return new TreeSet<>(mapper.readValue(getRowValue(table, "topics"), new TypeReference<Map<String, Long>>() {}).keySet());
        }
    }

    @GetMapping("/api/webtype")
    public Set<String> getWebTypes() throws IOException {
        Configuration config = getConfig();
        try (Connection connection = ConnectionFactory.createConnection(config)) {
            Table table = connection.getTable(TableName.valueOf("config"));

            ObjectMapper mapper = new ObjectMapper();
            return new TreeSet<>(mapper.readValue(getRowValue(table, "webtypes"), new TypeReference<Map<String, Long>>() {}).keySet());
        }
    }

    @PostMapping("/api/pump")
    public int pumpData(String harvestId) throws IOException, SolrServerException {
//        HttpSolrClient solr = new HttpSolrClient.Builder("http://solr:8983/solr/nkpbase").build();
        HttpSolrClient solrQuery = new HttpSolrClient.Builder("http://solr:8983/solr/nkpquery").build();

        int totalCount = 0;
        int count = 0;
        Configuration config = getConfig();
        try (Connection connection = ConnectionFactory.createConnection(config)) {
//            Table tableHarvest = connection.getTable(TableName.valueOf("harvest"));
//            Result r = tableHarvest.get(new Get(Bytes.toBytes(harvestId)));
//            String dateStr = new String(r.getValue(family, "date".getBytes()));
//            Date harvestDate = new SimpleDateFormat("yyyyMMdd").parse(dateStr);
//            String harvestType = new String(r.getValue(family, "type".getBytes()));

            Table table = connection.getTable(TableName.valueOf("main"));
            Scan scan = new Scan();
            scan.addFamily(family);
            scan.setFilter(new SingleColumnValueFilter(family, "harvest-id".getBytes(), CompareOperator.EQUAL, harvestId.getBytes()));
            scan.addColumn(family, "urlkey".getBytes());
            scan.addColumn(family, "topics".getBytes());
            scan.addColumn(family, "sentiment".getBytes());
            scan.addColumn(family, "headlines".getBytes());
            scan.addColumn(family, "links".getBytes());
            scan.addColumn(family, "language".getBytes());
            scan.addColumn(family, "plain-text".getBytes());
            scan.addColumn(family, "title".getBytes());
            ObjectMapper mapper = new ObjectMapper();
            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    String id = new String(result.getRow());
                    String url = new String(result.getValue(family, "urlkey".getBytes()));

                    String topicsJson = new String(result.getValue(family, "topics".getBytes()));
                    List<String> topics = null;
                    if (!topicsJson.equals("")) {
                        topics = mapper.readValue(topicsJson, new TypeReference<List<String>>() {});
                    }

                    String headlinesJson = new String(result.getValue(family, "headlines".getBytes()));
                    List<String> headlines = null;
                    if (!headlinesJson.equals("")) {
                        headlines = mapper.readValue(headlinesJson, new TypeReference<List<String>>() {});
                    }

                    String linksJson = new String(result.getValue(family, "links".getBytes()));
                    List<String> links = null;
                    if (!linksJson.equals("")) {
                        links = mapper.readValue(linksJson, new TypeReference<List<String>>() {});
                    }

                    byte[] sentimentBytes = result.getValue(family, "sentiment".getBytes());
                    Double sentiment = sentimentBytes.length == 0 ? null : Double.valueOf(new String(sentimentBytes));

                    SolrQueryEntry entry = new SolrQueryEntry();
                    entry.setId(id)
                            .setLanguage(new String(result.getValue(family, "language".getBytes())))
                            .setHeadlines(headlines)
                            .setLinks(links)
                            .setPlainText(new String(result.getValue(family, "plain-text".getBytes())))
                            .setSentiment(sentiment)
                            .setTitle(new String(result.getValue(family, "title".getBytes())))
                            .setTopics(topics)
                            .setUrl(url);
                    solrQuery.addBean(entry);

                    count += 1;
                    totalCount += 1;
                    if (count % 10000 == 0) {
                        solrQuery.commit();
                        count = 0;
                        log.info("PUMP: imported {}", totalCount);
                    }
                }
            }
        }
//        catch (ParseException ex) {
//            throw new RuntimeException("The harvest has an invalid date time.");
//        }
        log.info("PUMP: imported {}", totalCount);
        return totalCount;
    }
}