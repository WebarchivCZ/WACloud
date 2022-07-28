package cz.inqool.nkp.api.repository;

import cz.inqool.nkp.api.model.AppUser;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import cz.inqool.nkp.api.model.Search;

import java.util.List;

@Repository
public interface SearchRepository extends JpaRepository<Search, Long> {
    List<Search> findByState(Search.State state);

    List<Search> findByUserOrderByIdDesc(AppUser user);
}
