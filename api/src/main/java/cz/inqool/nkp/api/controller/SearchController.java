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
import cz.inqool.nkp.api.model.AppUser;
import cz.inqool.nkp.api.model.Search;
import cz.inqool.nkp.api.repository.AnalyticQueryRepository;
import cz.inqool.nkp.api.repository.SearchRepository;
import cz.inqool.nkp.api.security.AppUserPrincipal;
import cz.inqool.nkp.api.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.api.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    private Search prepareSearch(@RequestBody @Valid RequestDTO request, Authentication authentication) {
        AppUser user = ((AppUserPrincipal) authentication.getPrincipal()).getAppUser();

        Search search = new Search();
        search.setUser(user);
        search.setFilter(request.getBase().getFilter());
        search.setEntries(request.getBase().getEntries());
        search.setRandomSeed(request.getBase().getRandomSeed());
        search.setStopWords(request.getBase().getStopWords() == null ? new ArrayList<>() : Arrays.asList(request.getBase().getStopWords()));
        search.setIds(request.getBase().getIds() == null ? new ArrayList<>() : Arrays.asList(request.getBase().getIds()));
        search.setHarvests(request.getBase().getHarvests() == null ? new ArrayList<>() : Arrays.asList(request.getBase().getHarvests()));

        return search;
    }

    @Operation(summary = "Create a search request")
    @PreAuthorize("isAuthenticated()")
    @PostMapping(value="/api/search")
    public Search search(@Valid @RequestBody RequestDTO request, Authentication authentication) {
        Search search = prepareSearch(request, authentication);
        Long estimated = searchService.estimate(search);
        search.setToIndex(estimated == null ? 0 : estimated.intValue());
        searchRepository.save(search);

        analyticQueryRepository.saveAllAndFlush(Arrays.stream(request.getQueries()).map(queryRequest -> {
            AnalyticQuery analyticQuery = new AnalyticQuery();
            analyticQuery.setSearch(search);
            analyticQuery.setContextSize(queryRequest.getContextSize());
            analyticQuery.setExpressions(queryRequest.getTexts());
            analyticQuery.setExpressionsOpposite(queryRequest.getTextsOpposite());
            analyticQuery.setUseOnlyDomains(queryRequest.isUseOnlyDomains());
            analyticQuery.setUseOnlyDomainsOpposite(queryRequest.isUseOnlyDomainsOpposite());
            analyticQuery.setLimit(queryRequest.getLimit());
            analyticQuery.setType(queryRequest.getType());
            analyticQuery.setFormat(queryRequest.getFormat());
            analyticQuery.setSorting(queryRequest.getSorting());
            return analyticQuery;
        }).collect(Collectors.toList()));

        return search;
    }

    @Operation(summary = "Get my requests")
    @PreAuthorize("isAuthenticated()")
    @GetMapping(value="/api/search")
    public List<Search> getMy(Authentication authentication) {
        AppUser user = ((AppUserPrincipal)authentication.getPrincipal()).getAppUser();
        return searchRepository.findByUserOrderByIdDesc(user);
    }

    @Operation(summary = "Estimate a search request", description = "Return number of evaluated documents, null if the request is not valid.")
    @PreAuthorize("isAuthenticated()")
    @PostMapping(value="/api/search/estimate")
    public Estimation estimate(@Valid @RequestBody RequestDTO request, Authentication authentication) {
        Search search = prepareSearch(request, authentication);
        Long estimated = searchService.estimate(search);
        return new Estimation(estimated != null, estimated);
    }

    @Operation(summary = "Get all requests (only for admins)")
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping(value="/api/search/all")
    public Page<Search> getAll(@ParameterObject @PageableDefault(sort = "id", direction = Sort.Direction.DESC) Pageable p) {
        return searchRepository.findAll(p);
    }

    @Operation(summary = "Get a request")
    @PreAuthorize("isAuthenticated()")
    @GetMapping(value="/api/search/{id}")
    public Search getOne(@PathVariable Long id, Authentication authentication) {
        return findSearch(id, authentication);
    }

    @Operation(summary = "Stop a request")
    @PreAuthorize("isAuthenticated()")
    @PostMapping(value="/api/search/{id}/stop")
    public Search stopOne(@PathVariable Long id, Authentication authentication) {
        Search search = findSearch(id, authentication);
        if (search.isFinished()) {
            throw new RuntimeException("The search is already finished.");
        }
        search.setState(Search.State.STOPPED);
        searchRepository.save(search);
        return search;
    }

    @Operation(summary = "Get my favorite searches")
    @PreAuthorize("isAuthenticated()")
    @GetMapping(value="/api/search/favorite")
    public List<Search> getMySaved(Authentication authentication) {
        AppUser user = ((AppUserPrincipal)authentication.getPrincipal()).getAppUser();
        return searchRepository.findByUserOrderByIdDesc(user).stream().filter(Search::isFavorite).collect(Collectors.toList());
    }

    @Operation(summary = "Save a search as a favorite")
    @PreAuthorize("isAuthenticated()")
    @PostMapping(value="/api/search/favorite/{id}")
    public Search saveOne(@PathVariable Long id, @Valid @RequestBody SaveSearchDTO request, Authentication authentication) {
        Search search = findSearch(id, authentication);
        search.setName(request.getName());
        search.setFavorite(true);
        searchRepository.save(search);
        return search;
    }

    @Operation(summary = "Delete a favorite search")
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping(value="/api/search/favorite/{id}")
    public void deleteSavedOne(@PathVariable Long id, Authentication authentication) {
        Search search = findSearch(id, authentication);
        search.setName("");
        search.setFavorite(false);
        searchRepository.save(search);
    }

    @Operation(summary = "Download a result")
    @PreAuthorize("isAuthenticated()")
    @GetMapping(value="/api/download/{id}", produces="application/zip")
    public byte[] download(@PathVariable Long id, Authentication authentication) throws IOException {
        Search search = findSearch(id, authentication);
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
                String filename = queryIndex + "_" + query.getType().toString() + ".";
                switch (query.getFormat()) {
                    case CSV: filename = filename + "csv"; break;
                    default: filename = filename + "json"; break;
                }
                byte[] result = query.getData();
                zipOutputStream.putNextEntry(new ZipEntry(filename));
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

    private Search findSearch(@PathVariable Long id, Authentication authentication) {
        Search search = searchRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
        AppUser user = ((AppUserPrincipal)authentication.getPrincipal()).getAppUser();
        if(user.getId() != search.getUser().getId() && !user.getRole().equals(AppUser.Role.ADMIN)) {
            throw new RuntimeException("You are not allowed to view this saved search.");
        }
        return search;
    }
}
