package cz.inqool.nkp.api.dto;

public class Estimation {
	private final Boolean valid;
	private final Long estimated;

	public Estimation(Boolean valid, Long estimated) {
		this.valid = valid;
		this.estimated = estimated;
	}

	public Boolean getValid() {
		return valid;
	}

	public Long getEstimated() {
		return estimated;
	}
}
