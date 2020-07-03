package cz.inqool.nkp.api.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.impl.XMLResponseParser;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import cz.inqool.nkp.api.dto.SearchRequest;
import cz.inqool.nkp.api.model.Search;
import cz.inqool.nkp.api.repository.SearchRepository;

@RestController
public class SearchController {
	@Autowired
    private SearchRepository searchRepository;

    @GetMapping("/api/search")
    public List<Search> getQuestions() {
        return searchRepository.findAll();
    }
    
    @PostMapping("/api/search")
    public Search createQuestion(@Valid @RequestBody Search question) {
        return searchRepository.save(question);
    }

    @PostMapping("/api/search/solr")
    public List<Map<String, Object>> search(@Valid @RequestBody SearchRequest request) throws SolrServerException, IOException {
    	String urlString = "http://solr:8983/solr/nkpbase";
        HttpSolrClient solr = new HttpSolrClient.Builder(urlString).build();
        solr.setParser(new XMLResponseParser());
        
        SolrQuery query = new SolrQuery();
        query.set("q", request.getFilter());
        QueryResponse response = solr.query(query);
         
        SolrDocumentList docList = response.getResults();
         
        List<Map<String, Object>> result = new ArrayList<>();
        for (SolrDocument doc : docList) {
        	result.add(doc.getFieldValueMap());
        }
        return result;
    }    
}
