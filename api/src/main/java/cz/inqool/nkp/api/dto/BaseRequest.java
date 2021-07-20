package cz.inqool.nkp.api.dto;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

public class BaseRequest {
	@NotBlank(message = "filter is mandatory")
	private final String filter;

	private final String[] ids;

	@Max(value = 1000, message = "maximal limit for testing is 1000 entries")
	@Min(value = 10, message = "minimal limit for testing is 10 entries")
	private final Integer entries;

	public BaseRequest(String filter, String[] ids, Integer entries) {
		this.filter = filter;
		this.ids = ids;
		this.entries = entries != null ? entries : 10;
	}

	public String getFilter() {
		return filter;
	}

	public String[] getIds() {
		return ids;
	}

	public Integer getEntries() {
		return entries;
	}	
}
