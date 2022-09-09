package cz.inqool.nkp.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@Getter
@AllArgsConstructor
public class SaveSearchDTO {

	@Valid
	@NotNull
	private final String name;

}
