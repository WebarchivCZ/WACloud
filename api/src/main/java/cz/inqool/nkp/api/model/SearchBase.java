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
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name="search_type",
		discriminatorType = DiscriminatorType.INTEGER)
public abstract class SearchBase extends AuditModel {
	@Id
	@GeneratedValue(generator = "search_generator")
	@SequenceGenerator(
			name = "search_generator",
			sequenceName = "search_sequence"
	)
	private Long id;

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
}
