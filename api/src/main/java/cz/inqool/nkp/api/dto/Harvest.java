package cz.inqool.nkp.api.dto;

import java.util.Date;

public class Harvest {
	private final String identification;
	private final Date date;
	private final String type;

	public Harvest(String identification, Date date, String type) {
		this.identification = identification;
		this.date = date;
		this.type = type;
	}

	public String getIdentification() {
		return identification;
	}

	public Date getDate() {
		return date;
	}

	public String getType() {
		return type;
	}
}
