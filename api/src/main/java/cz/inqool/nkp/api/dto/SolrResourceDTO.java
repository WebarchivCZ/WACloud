package cz.inqool.nkp.api.dto;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

public class SolrResourceDTO {

	@Valid
	@NotNull
	private final BaseRequest base;

	private final QueryRequest[] queries;

	public SolrResourceDTO(BaseRequest base, QueryRequest[] queries) {
		this.base = base;
		this.queries = queries;
	}

	public BaseRequest getBase() {
		return base;
	}

	public QueryRequest[] getQueries() {
		return queries;
	}
}
