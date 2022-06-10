package cz.inqool.nkp.api.controller;

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import cz.inqool.nkp.api.dto.*;
import cz.inqool.nkp.api.exception.ResourceNotFoundException;
import cz.inqool.nkp.api.model.AnalyticQuery;
import cz.inqool.nkp.api.model.Search;
import cz.inqool.nkp.api.repository.AnalyticQueryRepository;
import cz.inqool.nkp.api.repository.SearchRepository;
import cz.inqool.nkp.api.service.SearchService;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
public class SearchController {
    private static final Logger log = LoggerFactory.getLogger(HBaseController.class);

    private final SearchService searchService;
    private final SearchRepository searchRepository;
    private final AnalyticQueryRepository analyticQueryRepository;

    public SearchController(SearchService searchService, SearchRepository searchRepository, AnalyticQueryRepository analyticQueryRepository) {
        this.searchService = searchService;
        this.searchRepository = searchRepository;
        this.analyticQueryRepository = analyticQueryRepository;
    }

//    @PostMapping(value="/api/search", produces="application/zip")
//    public byte[] search(@Valid @RequestBody RequestDTO request) throws IOException {
//        // Index a base of the query
//        searchService.index(request.getBase());
//
//        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
//        BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(byteArrayOutputStream);
//        ZipOutputStream zipOutputStream = new ZipOutputStream(bufferedOutputStream);
//
//        int queryIndex = 1;
//        for (QueryRequest query : request.getQueries()) {
//            try {
//                // Process query
//                byte[] result = searchService.query(query);
//                zipOutputStream.putNextEntry(new ZipEntry(queryIndex + "_" + query.getType().toString() + ".json"));
//                zipOutputStream.write(result);
//                zipOutputStream.closeEntry();
//            }
//            catch (Throwable ex) {
//                log.error("Cannot process "+queryIndex+" query.", ex);
//            }
//            queryIndex++;
//        }
//
//        zipOutputStream.finish();
//        zipOutputStream.flush();
//        IOUtils.closeQuietly(zipOutputStream);
//        IOUtils.closeQuietly(bufferedOutputStream);
//        IOUtils.closeQuietly(byteArrayOutputStream);
//        return byteArrayOutputStream.toByteArray();
//    }

    @PostMapping(value="/api/search")
    public Search search(@Valid @RequestBody RequestDTO request) {
        Search search = new Search();
        search.setFilter(request.getBase().getFilter());
        search.setEntries(request.getBase().getEntries());
        search.setRandomSeed(request.getBase().getRandomSeed());
        search.setStopWords(request.getBase().getStopWords() == null ? new ArrayList<>() : Arrays.asList(request.getBase().getStopWords()));
        search.setIds(request.getBase().getIds() == null ? new ArrayList<>() : Arrays.asList(request.getBase().getIds()));
        search.setHarvests(request.getBase().getHarvests() == null ? new ArrayList<>() : Arrays.asList(request.getBase().getHarvests()));
        search.setToIndex((int)searchService.estimate(search));
        searchRepository.saveAndFlush(search);

        analyticQueryRepository.saveAllAndFlush(Arrays.stream(request.getQueries()).map(queryRequest -> {
            AnalyticQuery analyticQuery = new AnalyticQuery();
            analyticQuery.setSearch(search);
            analyticQuery.setContextSize(queryRequest.getContextSize());
            analyticQuery.setExpressions(queryRequest.getTexts());
            analyticQuery.setLimit(queryRequest.getLimit());
            analyticQuery.setType(queryRequest.getType());
            return analyticQuery;
        }).collect(Collectors.toList()));

        return search;
    }

    @GetMapping(value="/api/search")
    public List<Search> getAll() {
        return searchRepository.findAll(Sort.by(Sort.Order.desc("id")));
    }

    @GetMapping(value="/api/search/{id}")
    public Search getOne(@PathVariable Long id) {
        return searchRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
    }

    @GetMapping(value="/api/download/{id}", produces="application/zip")
    public byte[] download(@PathVariable Long id) throws IOException {
        Search search = searchRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
        if (!search.getState().equals(Search.State.DONE)) {
            throw new ResourceNotFoundException("Search is not processed yet.");
        }

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(byteArrayOutputStream);
        ZipOutputStream zipOutputStream = new ZipOutputStream(bufferedOutputStream);

        int queryIndex = 1;
        for (AnalyticQuery query : search.getQueries()) {
            try {
                // Process query
                byte[] result = query.getData();
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
