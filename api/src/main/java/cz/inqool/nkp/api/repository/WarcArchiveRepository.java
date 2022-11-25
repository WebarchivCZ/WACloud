package cz.inqool.nkp.api.repository;

import cz.inqool.nkp.api.model.Search;
import cz.inqool.nkp.api.model.WarcArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarcArchiveRepository extends JpaRepository<WarcArchive, Long> {

    List<WarcArchive> findBySearch(Search search);

    void deleteAllBySearch(Search search);

}
