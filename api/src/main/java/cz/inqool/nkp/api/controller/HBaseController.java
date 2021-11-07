package cz.inqool.nkp.api.controller;

import cz.inqool.nkp.api.service.HBaseService;
import cz.inqool.nkp.api.service.HarvestService;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class HBaseController {
    private static final Logger log = LoggerFactory.getLogger(HBaseController.class);

    @Value("${solr.base.host.query}")
    private String solrBaseHost;

    private final HBaseService hbase;
    private final HarvestService harvest;

    public HBaseController(HBaseService hbase, HarvestService harvest) {
        this.hbase = hbase;
        this.harvest = harvest;
    }

//    @GetMapping("/api/harvest/{id}")
//    public Harvest getHarvest(@PathVariable String id) throws IOException {
//        Map<String, byte[]> row = hbase.getAll(hbase.table("harvest"), id);
//        Date date = null;
//        try {
//            String dateStr = Bytes.toString(row.get("date"));
//            date = new SimpleDateFormat("yyyyMMdd").parse(dateStr);
//        } catch (ParseException e) {
//            log.error(e.toString());
//        }
//        String type = Bytes.toString(row.get("type"));
//        return new Harvest(id, date, type);
//    }

//    @GetMapping("/api/harvest")
//    public List<Harvest> getHarvests() throws IOException {
//        List<Harvest> harvests = new ArrayList<>();
//        try (ResultScanner scanner = hbase.scan("harvest")) {
//            for (Result result : scanner) {
//                String row = new String(result.getRow());
//                Date date = null;
//                try {
//                    String dateStr = new String(result.getValue(HBaseService.family, "date".getBytes()));
//                    date = new SimpleDateFormat("yyyyMMdd").parse(dateStr);
//                } catch (ParseException e) {
//                    log.error(e.toString());
//                }
//                String type = new String(result.getValue(HBaseService.family, "type".getBytes()));
//                harvests.add(new Harvest(row, date, type));
//            }
//        }
//        return harvests;
//    }
	
    @GetMapping("/api/topic")
    public Set<String> getTopics() {
        return hbase.getTopics();
    }

    @GetMapping("/api/webtype")
    public Set<String> getWebTypes() {
        return hbase.getWebTypes();
    }

    @PostMapping("/api/clear")
    public void clearData() throws IOException, SolrServerException {
        harvest.clearAll();
    }
}