package cz.inqool.nkp.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import cz.inqool.nkp.api.dto.Info;

@RestController
public class InfoController {
	
	@GetMapping("/api")
	public Info info() {
		return new Info("0.0.1");
	}
}