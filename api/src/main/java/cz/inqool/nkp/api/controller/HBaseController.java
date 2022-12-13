package cz.inqool.nkp.api.controller;

import cz.inqool.nkp.api.service.HBaseService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class HBaseController {
    private static final Logger log = LoggerFactory.getLogger(HBaseController.class);

    private final HBaseService hbase;

    public HBaseController(HBaseService hbase) {
        this.hbase = hbase;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/topic")
    public Set<String> getTopics() {
        return hbase.getTopics();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/webtype")
    public Set<String> getWebTypes() {
        return hbase.getWebTypes();
    }
}