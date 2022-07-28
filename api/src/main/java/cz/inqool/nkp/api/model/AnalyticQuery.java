package cz.inqool.nkp.api.model;

import java.util.Date;
import java.util.List;
import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "analytic_query")
@Getter
@Setter
@NoArgsConstructor
public class AnalyticQuery extends AuditModel {

    public enum State {
		WAITING,
        RUNNING,
        FINISHED,
		ERROR
    }

    public enum Type {
        FREQUENCY,
        COLLOCATION,
        OCCURENCE,
		RAW
    }
    
	@Id
    @GeneratedValue(generator = "analytic_query_generator")
    @SequenceGenerator(
            name = "analytic_query_generator",
            sequenceName = "analytic_query_sequence"
    )
    private Long id;
	
	@ManyToOne
    @JoinColumn(name = "search_id", nullable = false)
    @JsonIgnore
    private Search search;

    @Enumerated(EnumType.STRING)
    private State state = State.WAITING;

    @Enumerated(EnumType.STRING)
    private Type type;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "analytic_query_expression", joinColumns = @JoinColumn(name = "id"))
	@Column(name = "analytic_query_expression")
	private List<String> expressions;
    
    @Column(columnDefinition = "integer")
    private Integer contextSize;
    
    @Column(name = "result_limit", columnDefinition = "integer")
    private Integer limit;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "started_at")
	private Date startedAt;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "finished_at")
	private Date finishedAt;

    @Basic(fetch=FetchType.LAZY)
    @JsonIgnore
    private byte[] data;
}
