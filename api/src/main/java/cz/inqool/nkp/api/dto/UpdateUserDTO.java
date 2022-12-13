package cz.inqool.nkp.api.dto;

import cz.inqool.nkp.api.model.AppUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.constraints.NotNull;

@Getter
@AllArgsConstructor
public class UpdateUserDTO {
	@NotNull
	private String name;

	@NotNull
	private String username;

	@NotNull
	private AppUser.Role role;

	@NotNull
	private Boolean enabled;
}
