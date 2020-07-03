package cz.inqool.nkp.api.model;

import java.util.Date;

import javax.persistence.*;

@Entity
@Table(name = "harvests")
public class Harvest extends AuditModel {
	@Id
    @GeneratedValue(generator = "question_generator")
    @SequenceGenerator(
            name = "question_generator",
            sequenceName = "question_sequence",
            initialValue = 1
    )
    private Long id;
	
    @Column(columnDefinition = "text")
    private String identification;
	
    @Column(columnDefinition = "text")
    private String type;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "date", nullable = false)
    private Date date;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

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
}
