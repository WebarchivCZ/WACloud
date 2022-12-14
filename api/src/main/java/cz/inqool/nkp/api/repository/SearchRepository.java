package cz.inqool.nkp.api.repository;

import cz.inqool.nkp.api.model.AppUser;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import cz.inqool.nkp.api.model.Search;

import java.util.List;

@Repository
public interface SearchRepository extends PagingAndSortingRepository<Search, Long> {
    List<Search> findByState(Search.State state);

    List<Search> findByWarcArchiveState(Search.State state);

    List<Search> findByUserOrderByIdDesc(AppUser user);
}
