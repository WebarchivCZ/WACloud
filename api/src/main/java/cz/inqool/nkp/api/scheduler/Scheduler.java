package cz.inqool.nkp.api.scheduler;

import cz.inqool.nkp.api.service.HarvestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class Scheduler {
    private static final Logger log = LoggerFactory.getLogger(Scheduler.class);

    private final HarvestService harvestService;

    public Scheduler(HarvestService harvestService) {
        this.harvestService = harvestService;
    }

    @Scheduled(fixedDelay = 60000, initialDelay = 3000)
    public void scheduleFixedDelayTask() {
        harvestService.sync();
    }
}
