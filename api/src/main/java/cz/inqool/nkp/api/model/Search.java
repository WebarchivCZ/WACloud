package cz.inqool.nkp.api.model;

import javax.persistence.*;

@Entity
@Table(name = "search")
public class Search extends AuditModel {
	@Id
    @GeneratedValue(generator = "question_generator")
    @SequenceGenerator(
            name = "question_generator",
            sequenceName = "question_sequence",
            initialValue = 1
    )
    private Long id;

    @Column(columnDefinition = "text")
    private String name;
    
    @Column(columnDefinition = "integer")
    private Long filterRandomSize;

    @Column(columnDefinition = "text")
    private String filterIdsList;

    @Column(columnDefinition = "text")
    private String filter;
    
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Long getFilterRandomSize() {
		return filterRandomSize;
	}

	public void setFilterRandomSize(Long filterRandomSize) {
		this.filterRandomSize = filterRandomSize;
	}

	public String getFilterIdsList() {
		return filterIdsList;
	}

	public void setFilterIdsList(String filterIdsList) {
		this.filterIdsList = filterIdsList;
	}

	public String getFilter() {
		return filter;
	}

	public void setFilter(String filter) {
		this.filter = filter;
	}
}
