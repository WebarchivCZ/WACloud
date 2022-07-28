package cz.inqool.nkp.api.controller;

import cz.inqool.nkp.api.exception.ResourceNotFoundException;
import cz.inqool.nkp.api.model.AppUser;
import cz.inqool.nkp.api.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;


@RestController
public class UserController {

	private static final SecureRandom secureRandom = new SecureRandom();
	private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();

	private final UserRepository userRepository;

	public UserController(UserRepository userRepository) {
		this.userRepository = userRepository;
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
	@DeleteMapping("/api/user/{id}")
	public void delete(@PathVariable Long id) {
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
