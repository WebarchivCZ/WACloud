package cz.inqool.nkp.api.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;

import javax.persistence.*;
import java.util.Date;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "search")
public class Search extends AuditModel {

	public enum State {
		WAITING,
		INDEXING,
		PROCESSING,
		ERROR,
		DONE
	}

	@Id
	@GeneratedValue(generator = "search_generator")
	@SequenceGenerator(
			name = "search_generator",
			sequenceName = "search_sequence"
	)
	private Long id;

	@Column(columnDefinition = "text")
	private String name;

	private boolean favorite = true;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private AppUser user;

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy="search")
	@OrderBy("id")
	private Set<AnalyticQuery> queries;

	@Column(columnDefinition = "text")
	private String randomSeed;

	@ElementCollection
	@LazyCollection(LazyCollectionOption.FALSE)
	@CollectionTable(name = "search_stop_word", joinColumns = @JoinColumn(name = "id"))
	@Column(name = "word")
	private List<String> stopWords;

	@ElementCollection
	@LazyCollection(LazyCollectionOption.FALSE)
	@CollectionTable(name = "search_entries", joinColumns = @JoinColumn(name = "id"))
	@Column(name = "entry_id")
	private List<String> ids;

	@ElementCollection
	@LazyCollection(LazyCollectionOption.FALSE)
	@CollectionTable(name = "search_harvests", joinColumns = @JoinColumn(name = "id"))
	@Column(name = "harvest")
	private List<String> harvests;

    @Column(columnDefinition = "text")
	private String filter;

	@Enumerated(EnumType.STRING)
	private State state = State.WAITING;

	@Column(columnDefinition = "integer")
	@NonNull
	private Integer entries;

	@Column(columnDefinition = "integer")
	@NonNull
	private Integer indexed = 0;

	@Column(columnDefinition = "integer")
	private Integer toIndex;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "started_at")
	private Date startedAt;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "finished_at")
	private Date finishedAt;
}
