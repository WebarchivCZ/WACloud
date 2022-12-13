package cz.inqool.nkp.api.service;

import cz.inqool.nkp.api.dto.Harvest;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.ResultScanner;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface HBaseService {
    byte[] family = "cf1".getBytes();

    Result getOne(String tableName, String id);
    Result[] get(String tableName, List<String> ids);
    ResultScanner scan(String tableName);
    ResultScanner scan(String tableName, String[] columns);
    ResultScanner scan(String tableName, String[] columns, Map<String, byte[]> filters);

    String getRowColumnAsString(Result result, String column);
    Double getRowColumnAsDouble(Result result, String column);

    Harvest getHarvest(String id);
    Set<String> getTopics();
    Set<String> getWebTypes();
}
