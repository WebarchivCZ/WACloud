package cz.inqool.nkp.api.controller;

import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import cz.inqool.nkp.api.dto.CreateRequest;
import cz.inqool.nkp.api.model.FulltextSearch;
import cz.inqool.nkp.api.model.Search;
import cz.inqool.nkp.api.repository.FulltextSearchRepository;
import cz.inqool.nkp.api.repository.SearchRepository;

@RestController
public class FulltextSearchController {
	@Autowired
    private FulltextSearchRepository fulltextSearchRepository;

	@Autowired
    private SearchRepository searchRepository;

    @GetMapping("/api/fulltext-search")
    public List<FulltextSearch> getQuestions() {
        return fulltextSearchRepository.findAll();
    }

    @PostMapping("/api/fulltext-search")
    public FulltextSearch createQuestion(@Valid @RequestBody FulltextSearch question) {
        return fulltextSearchRepository.save(question);
    }

    @PostMapping("/api/create")
    public FulltextSearch[] createFull(@Valid @RequestBody CreateRequest request) {
    	ArrayList<FulltextSearch> result = new ArrayList<FulltextSearch>();
    	Search search = searchRepository.save(request.getFilter());
    	for (FulltextSearch fSearch : request.getQueries()) {
    		fSearch.setSearch(search);
    		fSearch.setState(FulltextSearch.State.RUNNING);
    		FulltextSearch fulltextSearch = fulltextSearchRepository.save(fSearch);
    		result.add(fulltextSearch);
    	}
        return (FulltextSearch[]) result.toArray();
    }
}
