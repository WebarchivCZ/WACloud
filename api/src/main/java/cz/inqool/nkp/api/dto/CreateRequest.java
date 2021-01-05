package cz.inqool.nkp.api.dto;

import cz.inqool.nkp.api.model.FulltextSearch;
import cz.inqool.nkp.api.model.Search;

public class CreateRequest {
	private final Search filter;
	
	private final FulltextSearch[] queries;

	public CreateRequest(Search filter, FulltextSearch[] queries) {
		this.filter = filter;
		this.queries = queries;
	}

	public Search getFilter() {
		return filter;
	}

	public FulltextSearch[] getQueries() {
		return queries;
	}
}
