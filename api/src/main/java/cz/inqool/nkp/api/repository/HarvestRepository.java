package cz.inqool.nkp.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cz.inqool.nkp.api.model.Harvest;

@Repository
public interface HarvestRepository extends JpaRepository<Harvest, Long> {
	
}
