package cz.inqool.nkp.api.dto;

import java.util.Map;

public class HBaseConfig {
	private final Map<String, Long> topics;
	private final Map<String, Long> webtypes;

	public HBaseConfig(Map<String, Long> topics, Map<String, Long> webtypes) {
		this.topics = topics;
		this.webtypes = webtypes;
	}

	public Map<String, Long> getTopics() {
		return topics;
	}

	public Map<String, Long> getWebTypes() {
		return webtypes;
	}
}
