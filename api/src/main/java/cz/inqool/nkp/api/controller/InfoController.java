package cz.inqool.nkp.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class InfoController {

	@GetMapping("/api")
	public Map<String, String> info() {
		return new HashMap<String, String>() {{
			put("version", "0.1.2");
		}};
	}

}
