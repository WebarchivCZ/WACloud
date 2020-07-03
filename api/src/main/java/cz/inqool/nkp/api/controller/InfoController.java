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

	@GetMapping("/api/topics")
	public String[] topics() {
		String[] topics = {
				"devizový trh",
				"ekonomické sankce",
				"ekosystém",
				"elektronika",
				"energie z obnovitelných zdrojů",
				"požár",
				"terapie",
				"větrná bouře",
				"zajímavosti o lidech",
				"zemědělství",
				"zvířata",
				"Bangladéš",
				"Bělorusko",
				"Brno",
				"Libanon",
				"Maďarsko",
				"Teplice",
				"Zlín"
				};
		return topics;
	}

	@GetMapping("/api/web-types")
	public String[] webTypes() {
		String[] topics = {
                "eshop",
                "news",
                "forum"
				};
		return topics;
	}
}
