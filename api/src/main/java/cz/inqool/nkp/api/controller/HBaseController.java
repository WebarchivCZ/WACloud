package cz.inqool.nkp.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import cz.inqool.nkp.api.dto.HBaseConfig;

import java.io.IOException;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hbase.HBaseConfiguration;

import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.util.Bytes;

@RestController
public class HBaseController {
	
	private static String getRowValue(Table table, String row) throws IOException {
		String family = "cf1";
		Result r = table.get(new Get(Bytes.toBytes(row)));
		return Bytes.toString(r.getValue(family.getBytes(), Bytes.toBytes("value"))); 
	}
	
	@GetMapping("/api/hbase/config")
    public HBaseConfig getHBaseConfig() throws IOException {
		Configuration config = HBaseConfiguration.create();
		 
		String path = this.getClass()
		  .getClassLoader()
		  .getResource("hbase.xml")
		  .getPath();
		config.addResource(new Path(path));
		
		try (Connection connection = ConnectionFactory.createConnection(config)) {
			Table table = connection.getTable(TableName.valueOf("config"));
			
			ObjectMapper mapper = new ObjectMapper();
			Map<String, Long> topics = mapper.readValue(getRowValue(table, "topics"), new TypeReference<Map<String, Long>>() {});
			Map<String, Long> types = mapper.readValue(getRowValue(table, "webtypes"), new TypeReference<Map<String, Long>>() {});
			
			return new HBaseConfig(topics, types);
		}
    }
}