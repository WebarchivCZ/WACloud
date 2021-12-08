package cz.inqool.nkp.api.controller;

import cz.inqool.nkp.api.model.Harvest;
import cz.inqool.nkp.api.repository.HarvestRepository;
import cz.inqool.nkp.api.service.HarvestService;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
public class HarvestController {

	private final HarvestRepository harvestRepository;
	private final HarvestService harvestService;

	public HarvestController(HarvestRepository harvestRepository, HarvestService harvestService) {
		this.harvestRepository = harvestRepository;
		this.harvestService = harvestService;
	}

	@GetMapping("/api/harvest")
	public List<Harvest> getAll() {
		return harvestRepository.findAll(Sort.by(Sort.Order.desc("date")));
	}

	@PostMapping("/api/harvest/index")
	public void index(String harvestId) {
		harvestService.asyncIndex(harvestId);
	}

	@PostMapping("/api/harvest/clear-all")
	public void clearAll() throws IOException, SolrServerException {
		harvestService.clearAll();
	}

	@PostMapping("/api/harvest/clear")
	public void clearOne(String harvestId) throws IOException, SolrServerException {
		harvestService.clear(harvestId);
	}
}
