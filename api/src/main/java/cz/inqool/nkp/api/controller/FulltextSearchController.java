package cz.inqool.nkp.api.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import cz.inqool.nkp.api.model.FulltextSearch;
import cz.inqool.nkp.api.repository.FulltextSearchRepository;

@RestController
public class FulltextSearchController {
	@Autowired
    private FulltextSearchRepository fulltextSearchRepository;

    @GetMapping("/api/fulltext-search")
    public List<FulltextSearch> getQuestions() {
        return fulltextSearchRepository.findAll();
    }

    @PostMapping("/api/fulltext-search")
    public FulltextSearch createQuestion(@Valid @RequestBody FulltextSearch question) {
        return fulltextSearchRepository.save(question);
    }
}
