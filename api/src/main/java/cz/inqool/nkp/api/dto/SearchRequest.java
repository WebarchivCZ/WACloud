package cz.inqool.nkp.api.dto;

public class SearchRequest {
	private final String filter;
	
	private final String ids;
	
	private final Long entries;

	public SearchRequest(String filter, String ids, Long entries) {
		this.filter = filter;
		this.ids = ids;
		this.entries = entries;
	}

	public String getFilter() {
		return filter;
	}

	public String getIds() {
		return ids;
	}

	public Long getEntries() {
		return entries;
	}	
}
