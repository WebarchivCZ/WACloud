package cz.inqool.nkp.api.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Entity
@DiscriminatorValue("1")
@Getter
@Setter
@NoArgsConstructor
public class Search extends SearchBase {
	public enum State {
		WAITING,
		INDEXING,
		PROCESSING,
		ERROR,
		DONE
	}

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
