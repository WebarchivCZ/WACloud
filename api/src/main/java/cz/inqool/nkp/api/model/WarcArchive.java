package cz.inqool.nkp.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "warc_archive")
@Getter
@Setter
@NoArgsConstructor
public class WarcArchive extends AuditModel {

	@Id
    @GeneratedValue(generator = "warc_archive_generator")
    @SequenceGenerator(
            name = "warc_archive_generator",
            sequenceName = "warc_archive_sequence"
    )
    private Long id;
	
	@ManyToOne
    @JoinColumn(name = "search_id", nullable = false)
    @JsonIgnore
    private Search search;

    @Column(columnDefinition = "text")
    private String name;

    @Basic(fetch=FetchType.LAZY)
    @JsonIgnore
    private byte[] data;
}
