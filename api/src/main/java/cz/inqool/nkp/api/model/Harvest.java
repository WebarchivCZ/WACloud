package cz.inqool.nkp.api.model;

import java.time.LocalDate;
import java.util.Date;

import javax.persistence.*;

@Entity
@Table(name = "harvests")
public class Harvest extends AuditModel {

	public enum State {
		UNPROCESSED,
		PROCESSING,
		INDEXED,
		ERROR,
		CLEARED
	}

	@Id
    @Column(columnDefinition = "text")
    private String identification;
	
    @Column(columnDefinition = "text")
    private String type;

//    @Temporal(TemporalType.TIMESTAMP)
    @Column(columnDefinition = "date", nullable = false)
    private LocalDate date;

	@Enumerated(EnumType.STRING)
	private Harvest.State state;

	@Column
	private Long entries;

	public String getIdentification() {
		return identification;
	}

	public void setIdentification(String identification) {
		this.identification = identification;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Harvest.State getState() {
		return state;
	}

	public void setState(Harvest.State state) {
		this.state = state;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public Long getEntries() {
		return entries;
	}

	public void setEntries(Long entries) {
		this.entries = entries;
	}
}
