package cz.inqool.nkp.api.scheduler;

import cz.inqool.nkp.api.service.HarvestService;
import cz.inqool.nkp.api.service.SearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class Scheduler {

    private final HarvestService harvestService;
    private final SearchService searchService;

    public Scheduler(HarvestService harvestService, SearchService searchService) {
        this.harvestService = harvestService;
        this.searchService = searchService;
    }

    @Scheduled(fixedDelay = 60000, initialDelay = 3000)
    public void scheduleHarvestsSync() {
        harvestService.sync();
    }

    @Scheduled(fixedDelay = 5000, initialDelay = 5000)
    public void scheduleSearchProcessing() {
        searchService.processOneScheduledJob();
    }

    @Scheduled(fixedDelay = 5000, initialDelay = 5000)
    public void scheduleWarcArchiveProcessing() {
        searchService.processOneScheduledWarcExportJob();
    }
}
