package cz.inqool.nkp.api.model;

import java.util.Date;
import java.util.List;
import java.util.Locale;
import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.solr.client.solrj.SolrQuery;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;

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
        NETWORK,
		RAW
    }

    public enum Format {
        JSON,
        CSV
    }

    public enum SortBy {
        YEAR_ASC,
        YEAR_DESC,
        LANGUAGE_ASC,
        LANGUAGE_DESC,
        TITLE_ASC,
        TITLE_DESC,
        URL_ASC,
        URL_DESC,
        SENTIMENT_ASC,
        SENTIMENT_DESC,
        SCORE_ASC,
        SCORE_DESC;

        public String getField() {
            return this.name().toLowerCase(Locale.ROOT).split("_")[0];
        }

        public SolrQuery.ORDER getOrder() {
            return SolrQuery.ORDER.valueOf(this.name().toLowerCase(Locale.ROOT).split("_")[1]);
        }
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

    @Enumerated(EnumType.STRING)
    private Format format = Format.JSON;

    @Column
    @Enumerated
    @LazyCollection(LazyCollectionOption.FALSE)
    @ElementCollection(targetClass = SortBy.class)
    private List<SortBy> sorting;

    @ElementCollection
    @LazyCollection(LazyCollectionOption.FALSE)
    @CollectionTable(name = "analytic_query_expression", joinColumns = @JoinColumn(name = "id"))
    @Column(name = "analytic_query_expression")
    private List<String> expressions;

    @ElementCollection
    @LazyCollection(LazyCollectionOption.FALSE)
    @CollectionTable(name = "analytic_query_expression_opposite", joinColumns = @JoinColumn(name = "id"))
    @Column(name = "analytic_query_expression_opposite")
    private List<String> expressionsOpposite;
    
    @Column(columnDefinition = "integer")
    private Integer contextSize;
    
    @Column(name = "result_limit", columnDefinition = "integer")
    private Integer limit;

    private boolean useOnlyDomains = false;

    private boolean useOnlyDomainsOpposite = false;

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
