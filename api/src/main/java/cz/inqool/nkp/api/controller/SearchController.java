package cz.inqool.nkp.api.controller;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.validation.Valid;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.inqool.nkp.api.dto.SolrBaseEntry;
import cz.inqool.nkp.api.dto.SolrQueryEntry;
import org.apache.commons.io.IOUtils;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.beans.DocumentObjectBinder;
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
    public List<SolrQueryEntry> search(@Valid @RequestBody SearchRequest request) throws SolrServerException, IOException {
        String urlString = "http://solr:8983/solr/nkpquery";
        HttpSolrClient solr = new HttpSolrClient.Builder(urlString).build();
        solr.setParser(new XMLResponseParser());

        SolrQuery query = new SolrQuery();
        query.set("q", request.getFilter());
        query.setRows(10);
        QueryResponse response = solr.query(query);

        SolrDocumentList docList = response.getResults();
        DocumentObjectBinder binder = new DocumentObjectBinder();
        return binder.getBeans(SolrQueryEntry.class, docList);
    }

    @PostMapping(value="/api/search/solr/zip", produces="application/zip")
    public byte[] searchToZip(@Valid @RequestBody SearchRequest request) throws SolrServerException, IOException {
        String urlString = "http://solr:8983/solr/nkpquery";
        HttpSolrClient solr = new HttpSolrClient.Builder(urlString).build();
        solr.setParser(new XMLResponseParser());

        SolrQuery query = new SolrQuery();
        query.set("q", request.getFilter());
        query.setRows(Math.min(Math.max(request.getEntries().intValue(), 1), 100));
        QueryResponse response = solr.query(query);

        SolrDocumentList docList = response.getResults();
        DocumentObjectBinder binder = new DocumentObjectBinder();
        List<SolrQueryEntry> objects = binder.getBeans(SolrQueryEntry.class, docList);
        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(objects);

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(byteArrayOutputStream);
        ZipOutputStream zipOutputStream = new ZipOutputStream(bufferedOutputStream);

        zipOutputStream.putNextEntry(new ZipEntry("response.json"));
        zipOutputStream.write(json.getBytes());
        zipOutputStream.closeEntry();

        zipOutputStream.finish();
        zipOutputStream.flush();
        IOUtils.closeQuietly(zipOutputStream);
        IOUtils.closeQuietly(bufferedOutputStream);
        IOUtils.closeQuietly(byteArrayOutputStream);
        return byteArrayOutputStream.toByteArray();
    }
}
