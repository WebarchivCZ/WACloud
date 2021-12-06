package cz.inqool.nkp.api.dto;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

public class BaseRequest {
	public static final String DEFAULT_RANDOM_SEED = "NKP";

	@NotBlank(message = "filter is mandatory")
	private final String filter;

	private final String[] ids;

	private final String[] stopWords;

	@Max(value = 10000, message = "maximal limit for testing is 10000 entries")
	@Min(value = 10, message = "minimal limit for testing is 10 entries")
	private final Integer entries;

	private final String randomSeed;

	public BaseRequest(String filter, String[] ids, String[] stopWords, Integer entries, String randomSeed) {
		this.filter = filter;
		this.ids = ids;
		this.stopWords = stopWords;
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
		if (randomSeed == null) {
			return DEFAULT_RANDOM_SEED;
		}
		return randomSeed;
	}
}
