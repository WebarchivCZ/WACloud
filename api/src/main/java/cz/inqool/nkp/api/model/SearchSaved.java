package cz.inqool.nkp.api.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.List;
import java.util.Set;

@Entity
@DiscriminatorValue("2")
@Getter
@Setter
@NoArgsConstructor
public class SearchSaved extends SearchBase {

	@Column(columnDefinition = "text")
	private String name;

}
