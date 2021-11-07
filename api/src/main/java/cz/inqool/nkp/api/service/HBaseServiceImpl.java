package cz.inqool.nkp.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.inqool.nkp.api.dto.Harvest;
import cz.inqool.nkp.api.exception.ResourceNotFoundException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.CompareOperator;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.filter.SingleColumnValueFilter;
import org.apache.hadoop.hbase.util.Bytes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HBaseServiceImpl implements HBaseService {
    private static final Logger log = LoggerFactory.getLogger(HBaseService.class);

    private final Connection connection;
    private final ObjectMapper mapper;

    public HBaseServiceImpl(@Value("${hbase.zookeeper.quorum}") String hbaseHost,
                            @Value("${zookeeper.znode.parent}") String zookeeperNode) throws IOException {
        Configuration config = HBaseConfiguration.create();
        config.set("hbase.zookeeper.quorum", hbaseHost);
        config.set("zookeeper.znode.parent", zookeeperNode);
        HBaseAdmin.available(config);
        connection = ConnectionFactory.createConnection(config);
        mapper = new ObjectMapper();
    }

    private String get(Table table, String row, String column) throws IOException {
        Result r = table.get(new Get(Bytes.toBytes(row)));
        if (r.isEmpty()) {
            throw new ResourceNotFoundException("HBase entry with id '"+row+"' in table '"+table.getName().getNameAsString()+"' does not exist.");
        }
        byte[] value = r.getValue(family, column.getBytes());
        if (value == null) {
            throw new ResourceNotFoundException("HBase entry with id '"+row+"' in table '"+table.getName().getNameAsString()+"' does not have column "+column+".");
        }
        return Bytes.toString(value);
    }

    private Map<String, byte[]> getAll(Table table, String row) {
        try {
            Result r = table.get(new Get(Bytes.toBytes(row)));
            if (r.isEmpty()) {
                throw new ResourceNotFoundException("HBase entry with id '" + row + "' in table '" + table.getName().getNameAsString() + "' does not exist.");
            }
            Map<String, byte[]> map = new HashMap<>();
            for (Map.Entry<byte[], byte[]> entry : r.getFamilyMap(family).entrySet()) {
                map.put(Bytes.toString(entry.getKey()), entry.getValue());
            }
            return map;
        }
        catch (IOException exception) {
            log.error("An error occurs while getting a row from HBase table `"+table.getName()+"`.", exception);
            throw new RuntimeException("An internal error occurs.");
        }
    }

    private Table table(String name) {
        try {
            return connection.getTable(TableName.valueOf(name));
        }
        catch (IOException exception) {
            log.error("An error occurs while getting HBase table `"+name+"`.", exception);
            throw new RuntimeException("An internal error occurs.");
        }
    }

    @Override
    public ResultScanner scan(String tableName) {
        return scan(tableName, new String[]{}, new HashMap<String, byte[]>(){});
    }

    @Override
    public ResultScanner scan(String tableName, String[] columns) {
        return scan(tableName, columns, new HashMap<String, byte[]>(){});
    }

    @Override
    public ResultScanner scan(String tableName, String[] columns, Map<String, byte[]> filters) {
        Scan scan = new Scan();
        scan.addFamily(family);
        for (String column : columns) {
            scan.addColumn(family, column.getBytes());
        }
        for (Map.Entry<String, byte[]> entry : filters.entrySet()) {
            scan.setFilter(new SingleColumnValueFilter(family, entry.getKey().getBytes(), CompareOperator.EQUAL, entry.getValue()));
        }
        try {
            return table(tableName).getScanner(scan);
        }
        catch (IOException exception) {
            log.error("An error occurs while scanning HBase table `"+tableName+"`.", exception);
            throw new RuntimeException("An internal error occurs.");
        }
    }

    private Set<String> getConfig(String key) {
        try {
            return new TreeSet<>(mapper.readValue(this.get(this.table("config"), key, "value"),
                    new TypeReference<Map<String, Long>>() {
                    }).keySet());
        }
        catch (IOException exception) {
            log.error("Cannot get topics from HBase.", exception);
            return new TreeSet<>();
        }
    }


    @Override
    public Result[] get(String tableName, List<String> ids) {
        try {
            return table(tableName).get(ids.stream().map(id -> new Get(id.getBytes())).collect(Collectors.toList()));
        }
        catch (IOException exception) {
            log.error("An error occurs while getting more ids from HBase table `"+tableName+"`.", exception);
            throw new RuntimeException("An internal error occurs.");
        }
    }

    @Override
    public String getRowColumnAsString(Result result, String column) {
        return new String(result.getValue(HBaseService.family, column.getBytes()));
    }

    @Override
    public Double getRowColumnAsDouble(Result result, String column) {
        byte[] value = result.getValue(HBaseService.family, column.getBytes());
        return value.length == 0 ? null : Double.valueOf(new String(value));
    }

    @Override
    public Harvest getHarvest(String id) {
        Map<String, byte[]> row = getAll(table("harvest"), id);
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

    @Override
    public Set<String> getTopics() {
        return getConfig("topics");
    }

    @Override
    public Set<String> getWebTypes() {
        return getConfig("webtypes");
    }
}
