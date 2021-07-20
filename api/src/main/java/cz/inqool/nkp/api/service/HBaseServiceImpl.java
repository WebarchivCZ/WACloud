package cz.inqool.nkp.api.service;

import cz.inqool.nkp.api.exception.ResourceNotFoundException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.CompareOperator;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.filter.SingleColumnValueFilter;
import org.apache.hadoop.hbase.util.Bytes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class HBaseServiceImpl implements HBaseService {

    @Value("${hbase.zookeeper.quorum}")
    private String hbaseHost;

    @Value("${zookeeper.znode.parent}")
    private String zookeeperNode;

    private Connection connection = null;

    @Override
    public Configuration getConfig() throws IOException {
        Configuration config = HBaseConfiguration.create();
        config.set("hbase.zookeeper.quorum", hbaseHost);
        config.set("zookeeper.znode.parent", zookeeperNode);
        HBaseAdmin.available(config);
        return config;
    }

    @Override
    public String get(Table table, String row, String column) throws IOException {
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

    @Override
    public Map<String, byte[]> getAll(Table table, String row) throws IOException {
        Result r = table.get(new Get(Bytes.toBytes(row)));
        if (r.isEmpty()) {
            throw new ResourceNotFoundException("HBase entry with id '"+row+"' in table '"+table.getName().getNameAsString()+"' does not exist.");
        }
        Map<String, byte[]> map = new HashMap<>();
        for (Map.Entry<byte[], byte[]> entry : r.getFamilyMap(family).entrySet()) {
            map.put(Bytes.toString(entry.getKey()), entry.getValue());
        }
        return map;
    }

    @Override
    public Table table(String name) throws IOException {
        if (connection == null) {
            connection = ConnectionFactory.createConnection(getConfig());
        }
        return connection.getTable(TableName.valueOf(name));
    }

    @Override
    public ResultScanner scan(String tableName) throws IOException {
        return scan(tableName, new String[]{}, new HashMap<String, byte[]>(){});
    }

    @Override
    public ResultScanner scan(String tableName, String[] columns) throws IOException {
        return scan(tableName, columns, new HashMap<String, byte[]>(){});
    }

    @Override
    public ResultScanner scan(String tableName, String[] columns, Map<String, byte[]> filters) throws IOException {
        Scan scan = new Scan();
        scan.addFamily(family);
        for (String column : columns) {
            scan.addColumn(family, column.getBytes());
        }
        for (Map.Entry<String, byte[]> entry : filters.entrySet()) {
            scan.setFilter(new SingleColumnValueFilter(family, entry.getKey().getBytes(), CompareOperator.EQUAL, entry.getValue()));
        }
        return table(tableName).getScanner(scan);
    }
}
