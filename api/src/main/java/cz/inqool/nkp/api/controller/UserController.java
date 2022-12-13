package cz.inqool.nkp.api.controller;

import cz.inqool.nkp.api.dto.CreateUserDTO;
import cz.inqool.nkp.api.dto.UpdateUserDTO;
import cz.inqool.nkp.api.dto.UpdateUserPasswordDTO;
import cz.inqool.nkp.api.exception.ResourceNotFoundException;
import cz.inqool.nkp.api.model.AppUser;
import cz.inqool.nkp.api.repository.UserRepository;
import cz.inqool.nkp.api.security.AppUserPrincipal;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;


@RestController
public class UserController {

	private static final SecureRandom secureRandom = new SecureRandom();
	private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public static String generateNewToken() {
		byte[] randomBytes = new byte[32];
		secureRandom.nextBytes(randomBytes);
		return base64Encoder.encodeToString(randomBytes);
	}

	@PreAuthorize("hasAuthority('ADMIN')")
	@GetMapping("/api/user")
	public List<AppUser> getAll() {
		return userRepository.findAll(Sort.by(Sort.Order.desc("username")));
	}

	@PreAuthorize("hasAuthority('ADMIN')")
	@PostMapping("/api/user")
	public AppUser create(@Valid @RequestBody CreateUserDTO request) {
		String password = passwordEncoder.encode(request.getPassword());
		AppUser user = new AppUser(request.getName(), request.getUsername(), password);
		user.setRole(request.getRole());
		userRepository.saveAndFlush(user);
		return user;
	}

	@PreAuthorize("hasAuthority('ADMIN')")
	@PutMapping("/api/user/{id}")
	public AppUser update(@PathVariable Long id, @Valid @RequestBody UpdateUserDTO request) {
		AppUser user = userRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
		user.setName(request.getName());
		user.setUsername(request.getUsername());
		user.setRole(request.getRole());
		user.setEnabled(request.getEnabled());
		userRepository.flush();
		return user;
	}

	@PreAuthorize("hasAuthority('ADMIN')")
	@PutMapping("/api/user/{id}/password")
	public AppUser updatePassword(@PathVariable Long id, @Valid @RequestBody UpdateUserPasswordDTO request) {
		AppUser user = userRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
		String password = passwordEncoder.encode(request.getPassword());
		user.setPassword(password);
		userRepository.flush();
		return user;
	}

	@PreAuthorize("hasAuthority('ADMIN')")
	@DeleteMapping("/api/user/{id}")
	public void delete(@PathVariable Long id, Authentication authentication) {
		AppUser loggedInUser = ((AppUserPrincipal)authentication.getPrincipal()).getAppUser();
		if (id.equals(loggedInUser.getId())) {
			throw new RuntimeException("You cannot delete yourself.");
		}

		AppUser user = userRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
		userRepository.delete(user);
		userRepository.flush();
	}

	@PreAuthorize("hasAuthority('ADMIN')")
	@PostMapping("/api/user/{id}/token")
	public String generateAccessToken(@PathVariable Long id) {
		AppUser user = userRepository.findById(id).orElseThrow(ResourceNotFoundException::new);

		String token;
		int tries = 0;
		do {
			token = generateNewToken();
			tries += 1;

			if (tries > 10) {
				throw new RuntimeException("Cannot generate new token.");
			}
		} while (userRepository.findByAccessToken(token).isPresent());

		user.setAccessToken(token);
		userRepository.saveAndFlush(user);
		return token;
	}

	@PreAuthorize("hasAuthority('ADMIN')")
	@DeleteMapping("/api/user/{id}/token")
	public void deleteAccessToken(@PathVariable Long id) {
		AppUser user = userRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
		user.setAccessToken(null);
		userRepository.saveAndFlush(user);
	}
}
