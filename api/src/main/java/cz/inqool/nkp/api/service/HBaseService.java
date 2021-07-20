package cz.inqool.nkp.api.service;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.client.ResultScanner;
import org.apache.hadoop.hbase.client.Table;

import java.io.IOException;
import java.util.Map;

public interface HBaseService {
    byte[] family = "cf1".getBytes();

    Configuration getConfig() throws IOException;
    String get(Table table, String row, String column) throws IOException;
    Map<String, byte[]> getAll(Table table, String row) throws IOException;
    Table table(String name) throws IOException;
    ResultScanner scan(String tableName) throws IOException;
    ResultScanner scan(String tableName, String[] columns) throws IOException;
    ResultScanner scan(String tableName, String[] columns, Map<String, byte[]> filters) throws IOException;
}
