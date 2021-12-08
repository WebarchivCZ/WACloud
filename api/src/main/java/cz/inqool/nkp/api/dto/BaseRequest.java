package cz.inqool.nkp.api.dto;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

public class BaseRequest {
	@NotBlank(message = "filter is mandatory")
	private final String filter;

	private final String[] ids;

	private final String[] stopWords;

	private final String[] harvests;

	@Max(value = 10000, message = "maximal limit for testing is 10000 entries")
	@Min(value = 10, message = "minimal limit for testing is 10 entries")
	private final Integer entries;

	private final String randomSeed;

	public BaseRequest(String filter, String[] ids, String[] stopWords, String[] harvests, Integer entries, String randomSeed) {
		this.filter = filter;
		this.ids = ids;
		this.stopWords = stopWords;
		this.harvests = harvests;
		this.entries = entries != null ? entries : 10;
		this.randomSeed = randomSeed;
	}

	public String getFilter() {
		return filter;
	}

	public String[] getIds() {
		return ids;
	}

	public String[] getStopWords() {
		return stopWords;
	}

	public Integer getEntries() {
		return entries;
	}

	public String getRandomSeed() {
		return randomSeed;
	}

	public String[] getHarvests() {
		return harvests;
	}
}
