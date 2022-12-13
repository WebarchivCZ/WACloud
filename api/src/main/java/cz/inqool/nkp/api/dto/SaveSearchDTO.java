package cz.inqool.nkp.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
public class SaveSearchDTO {

	@NotNull
	private String name;

}
