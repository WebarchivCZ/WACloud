package cz.inqool.nkp.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import cz.inqool.nkp.api.dto.HBaseConfig;

import java.io.IOException;
import java.util.Map;
import java.util.Map.Entry;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.MasterNotRunningException;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.ZooKeeperConnectionException;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.util.Bytes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class HBaseController {
    private static final Logger log = LoggerFactory.getLogger(HBaseController.class);
    
    private static byte[] family = "cf1".getBytes();
    private static byte[] qualifier = Bytes.toBytes("value");

    @Value("${hbase.zookeeper.quorum}")
    private String hbaseHost;

    @Value("${zookeeper.znode.parent}")
    private String zookeeperNode;
    
    private Configuration getConfig() throws MasterNotRunningException, ZooKeeperConnectionException, IOException {
        Configuration config = HBaseConfiguration.create();
        config.set("hbase.zookeeper.quorum", hbaseHost);
        config.set("zookeeper.znode.parent", zookeeperNode);
        log.info("HBase host: " + config.get("hbase.zookeeper.quorum")+config.get("zookeeper.znode.parent"));
        HBaseAdmin.available(config);
        return config;
    }
	
    private static String getRowValue(Table table, String row) throws IOException {
        // TODO Fix if no values exist
        Result r = table.get(new Get(Bytes.toBytes(row)));
        return Bytes.toString(r.getValue(family, qualifier));
    }

    @GetMapping("/api/hbase/index")
    public void getHBaseIndex() throws IOException {
        Configuration config = getConfig();
        try (Connection connection = ConnectionFactory.createConnection(config)) {
            Table table = connection.getTable(TableName.valueOf("harvest"));
            
            Scan scan = new Scan();
            scan.addColumn(family, qualifier);
            
            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    log.info("Found row: " + result);
                }
            }
        }
    }
	
    @GetMapping("/api/hbase/config")
    public HBaseConfig getHBaseConfig() throws IOException {
        Configuration config = getConfig();
        try (Connection connection = ConnectionFactory.createConnection(config)) {
            Table table = connection.getTable(TableName.valueOf("config"));

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Long> topics = mapper.readValue(getRowValue(table, "topics"), new TypeReference<Map<String, Long>>() {});
            Map<String, Long> types = mapper.readValue(getRowValue(table, "webtypes"), new TypeReference<Map<String, Long>>() {});

            return new HBaseConfig(topics, types);
        }
    }
}