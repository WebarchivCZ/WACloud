package cz.inqool.nkp.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.inqool.nkp.api.dto.SolrBaseEntry;
import cz.inqool.nkp.api.exception.ResourceNotFoundException;
import cz.inqool.nkp.api.model.Harvest;
import cz.inqool.nkp.api.repository.HarvestRepository;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.ResultScanner;
import org.apache.hadoop.hbase.util.Bytes;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HarvestServiceImpl implements HarvestService {
    private static final Logger log = LoggerFactory.getLogger(HarvestService.class);

    private final HBaseService hbase;
    private final HttpSolrClient solr;
    private final HarvestRepository harvestRepository;

    public HarvestServiceImpl(@Value("${solr.base.host.query}") String solrBaseHost, HBaseService hbase, HarvestRepository harvestRepository) {
        this.hbase = hbase;
        this.solr = new HttpSolrClient.Builder(solrBaseHost.trim()).build();
        this.harvestRepository = harvestRepository;
    }

    @Override
    public void asyncIndex(String harvestId) {
        Harvest harvest = harvestRepository.findById(harvestId).orElseThrow(ResourceNotFoundException::new);
        harvest.setState(Harvest.State.UNPROCESSED);
        harvest.setEntries(0L);
        harvestRepository.saveAndFlush(harvest);
    }

    @Override
    public void index(String harvestId) {
        Harvest harvest = harvestRepository.findById(harvestId).orElseThrow(ResourceNotFoundException::new);
        if (harvest.getState() == Harvest.State.PROCESSING) {
            return;
        }

        try {
            // Clear harvest from index
            clear(harvestId);
            harvest.setEntries(0L);
            harvest.setState(Harvest.State.PROCESSING);
            harvestRepository.saveAndFlush(harvest);

            long totalCount = 0;
            long lastLog = System.currentTimeMillis();
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
                            .setHarvestId(harvestId)
                            .setHarvestType(harvest.getType())
                            .setWebType(webType);
                    solr.addBean(entry);

                    totalCount += 1;
                    if (System.currentTimeMillis() - lastLog >= 10000) {
                        lastLog = System.currentTimeMillis();
                        solr.commit();
                        harvest.setEntries(totalCount);
                        harvestRepository.saveAndFlush(harvest);
                    }
                }
            }
            solr.commit();
            harvest.setEntries(totalCount);
            harvest.setState(Harvest.State.INDEXED);
            harvestRepository.saveAndFlush(harvest);
        }
        catch (Throwable exception) {
            log.error("Error while indexing harvest "+harvestId, exception);
            harvest.setState(Harvest.State.ERROR);
            harvestRepository.saveAndFlush(harvest);
        }
    }

    @Override
    public void clear(String harvestId) throws IOException, SolrServerException {
        Harvest harvest = harvestRepository.findById(harvestId).orElseThrow(ResourceNotFoundException::new);
        // Clear from index
        solr.deleteByQuery("harvestId: \""+harvestId.replaceAll("\"", "\\\"")+"\"");
        solr.commit();
        // Update state
        harvest.setState(Harvest.State.CLEARED);
        harvest.setEntries(0L);
        harvestRepository.saveAndFlush(harvest);
    }

    @Override
    public void clearAll() throws IOException, SolrServerException {
        solr.deleteByQuery("*:*");
        solr.commit();

        List<Harvest> harvests = harvestRepository.findAll();
        for (Harvest harvest : harvests) {
            harvest.setState(Harvest.State.CLEARED);
            harvest.setEntries(0L);
        }
        harvestRepository.saveAllAndFlush(harvests);
    }

    @Override
    public void sync() {
        // Load known harvests
        Map<String, Harvest> harvests = harvestRepository.findAll().stream()
                .collect(Collectors.toMap(Harvest::getIdentification, Function.identity()));
        Set<String> harvestsInHBase = new HashSet<>(harvests.keySet());

        // Read all harvests in HBase
        try (ResultScanner scanner = hbase.scan("harvest")) {
            for (Result result : scanner) {
                String identification = new String(result.getRow());
                harvestsInHBase.remove(identification);
                if (!harvests.containsKey(identification)) {
                    String dateStr = new String(result.getValue(HBaseService.family, "date".getBytes()));
                    LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyyMMdd"));
                    String type = new String(result.getValue(HBaseService.family, "type".getBytes()));

                    // Initialize harvest
                    Harvest harvest = new Harvest();
                    harvest.setIdentification(identification);
                    harvest.setDate(date);
                    harvest.setType(type);
                    harvest.setEntries(0L);
                    harvest.setState(Harvest.State.UNPROCESSED);
                    harvestRepository.saveAndFlush(harvest);
                    harvests.put(identification, harvest);
                    break;
                }

                Harvest harvest = harvests.get(identification);
                if (harvest.getState() == Harvest.State.UNPROCESSED) {
                    index(identification);
                }
            }

            // Delete harvest that are not in HBase
            for (String identification : harvestsInHBase) {
                Harvest harvest = harvests.get(identification);
                harvestRepository.delete(harvest);
            }
            harvestRepository.flush();
        }
    }
}
