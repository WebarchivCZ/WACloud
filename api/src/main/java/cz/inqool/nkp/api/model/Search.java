package cz.inqool.nkp.api.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "search")
@Getter
@Setter
@NoArgsConstructor
public class Search extends AuditModel {
	public enum State {
		WAITING,
		INDEXING,
		PROCESSING,
		ERROR,
		DONE
	}

	@Id
    @GeneratedValue(generator = "query_generator")
    @SequenceGenerator(
            name = "query_generator",
            sequenceName = "query_sequence"
    )
    private Long id;

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy="search")
	@OrderBy("id")
	private Set<AnalyticQuery> queries;

	@Enumerated(EnumType.STRING)
	private State state = State.WAITING;

    @Column(columnDefinition = "text")
    private String name;

	@Column(columnDefinition = "integer")
	@NonNull
	private Integer entries;

	@Column(columnDefinition = "integer")
	@NonNull
	private Integer indexed = 0;

	@Column(columnDefinition = "integer")
	private Integer toIndex;

	@Column(columnDefinition = "text")
	private String randomSeed;

	@ElementCollection
	@CollectionTable(name = "search_stop_word", joinColumns = @JoinColumn(name = "id"))
	@Column(name = "word")
	private List<String> stopWords;

	@ElementCollection
	@CollectionTable(name = "search_entries", joinColumns = @JoinColumn(name = "id"))
	@Column(name = "entry_id")
	private List<String> ids;

	@ElementCollection
	@CollectionTable(name = "search_harvests", joinColumns = @JoinColumn(name = "id"))
	@Column(name = "harvest")
	private List<String> harvests;

    @Column(columnDefinition = "text")
	private String filter;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "started_at")
	private Date startedAt;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "finished_at")
	private Date finishedAt;
}
