package cz.inqool.nkp.api.dto;

import cz.inqool.nkp.api.model.AppUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.constraints.NotNull;

@Getter
@AllArgsConstructor
public class CreateUserDTO {
	@NotNull
	private String name;

	@NotNull
	private String username;

	@NotNull
	private String password;

	@NotNull
	private AppUser.Role role;
}
