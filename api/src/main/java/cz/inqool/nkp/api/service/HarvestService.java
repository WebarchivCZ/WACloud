package cz.inqool.nkp.api.service;

import org.apache.solr.client.solrj.SolrServerException;

import java.io.IOException;

public interface HarvestService {
    void asyncIndex(String harvestId);
    void index(String harvestId) throws IOException, SolrServerException;
    void clear(String harvestId) throws IOException, SolrServerException;
    void clearAll() throws IOException, SolrServerException;
    void sync();
}
