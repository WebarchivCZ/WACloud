package cz.inqool.nkp.api.controller;

import cz.inqool.nkp.api.model.AppUser;
import cz.inqool.nkp.api.security.AppUserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
public class InfoController {

	@GetMapping("/api")
	public Map<String, String> info() {
		return new HashMap<String, String>() {{
			put("version", "0.6.0");
		}};
	}

	@PreAuthorize("isAuthenticated()")
	@GetMapping("/api/me")
	public AppUser me(Authentication authentication) {
		return ((AppUserPrincipal)authentication.getPrincipal()).getAppUser();
	}

}
