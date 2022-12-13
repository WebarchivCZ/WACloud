package cz.inqool.nkp.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cz.inqool.nkp.api.model.AnalyticQuery;

@Repository
public interface AnalyticQueryRepository extends JpaRepository<AnalyticQuery, Long> {
	
}
