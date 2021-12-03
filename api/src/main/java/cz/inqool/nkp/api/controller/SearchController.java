package cz.inqool.nkp.api.controller;

import java.io.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import cz.inqool.nkp.api.dto.*;
import cz.inqool.nkp.api.service.SearchService;
import org.apache.commons.io.IOUtils;
import org.apache.solr.client.solrj.SolrServerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import javax.validation.Valid;

@RestController
public class SearchController {
    private static final Logger log = LoggerFactory.getLogger(HBaseController.class);

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @PostMapping(value="/api/search", produces="application/zip")
    public byte[] search(@Valid @RequestBody RequestDTO request) throws IOException {
        // Index a base of the query
        searchService.index(request.getBase());

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(byteArrayOutputStream);
        ZipOutputStream zipOutputStream = new ZipOutputStream(bufferedOutputStream);

        int queryIndex = 1;
        for (QueryRequest query : request.getQueries()) {
            try {
                // Process query
                byte[] result = searchService.query(query);
                zipOutputStream.putNextEntry(new ZipEntry(queryIndex + "_" + query.getType().toString() + ".json"));
                zipOutputStream.write(result);
                zipOutputStream.closeEntry();
            }
            catch (Throwable ex) {
                log.error("Cannot process "+queryIndex+" query.", ex);
            }
            queryIndex++;
        }

        zipOutputStream.finish();
        zipOutputStream.flush();
        IOUtils.closeQuietly(zipOutputStream);
        IOUtils.closeQuietly(bufferedOutputStream);
        IOUtils.closeQuietly(byteArrayOutputStream);
        return byteArrayOutputStream.toByteArray();
    }
}
