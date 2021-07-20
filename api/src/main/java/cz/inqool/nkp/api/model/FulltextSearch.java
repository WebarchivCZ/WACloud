package cz.inqool.nkp.api.model;

import java.util.Date;
import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "search")
public class FulltextSearch extends AuditModel {
    
    public enum State {
        RUNNING,
        FINISHED
    }
    
    public enum Type {
        FREQUENCY,
        COLLOCATION,
        OCCURENCE,
		RAW
    }
    
	@Id
    @GeneratedValue(generator = "question_generator")
    @SequenceGenerator(
            name = "question_generator",
            sequenceName = "question_sequence",
            initialValue = 1
    )
    private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "search_id", nullable = false)
    @JsonIgnore
    private Search search;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "started_at", nullable = true)
    private Date startedAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "finished_at", nullable = true)
    private Date finishedAt;
    
    @Enumerated(EnumType.STRING)
    private State state;

    @Column(columnDefinition = "text")
    private String query;

    @Enumerated(EnumType.STRING)
    private Type searchType;
    
    @Column(columnDefinition = "integer")
    private Long contextSize;
    
    @Column(columnDefinition = "integer")
    private Long lim;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Search getSearch() {
		return search;
	}

	public void setSearch(Search search) {
		this.search = search;
	}

	public Date getStartedAt() {
		return startedAt;
	}

	public void setStartedAt(Date startedAt) {
		this.startedAt = startedAt;
	}

	public Date getFinishedAt() {
		return finishedAt;
	}

	public void setFinishedAt(Date finishedAt) {
		this.finishedAt = finishedAt;
	}

	public State getState() {
		return state;
	}

	public void setState(State state) {
		this.state = state;
	}

	public String getQuery() {
		return query;
	}

	public void setQuery(String query) {
		this.query = query;
	}

	public Type getSearchType() {
		return searchType;
	}

	public void setSearchType(Type searchType) {
		this.searchType = searchType;
	}

	public Long getContextSize() {
		return contextSize;
	}

	public void setContextSize(Long contextSize) {
		this.contextSize = contextSize;
	}

	public Long getLimit() {
		return lim;
	}

	public void setLimit(Long lim) {
		this.lim = lim;
	}
}
