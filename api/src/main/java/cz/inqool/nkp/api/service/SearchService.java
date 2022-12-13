package cz.inqool.nkp.api.service;

import cz.inqool.nkp.api.model.AnalyticQuery;
import cz.inqool.nkp.api.model.Search;

import java.util.List;

public interface SearchService {
    void index(Search query);
    byte[] query(AnalyticQuery query);

    Long estimate(Search query);

    List<String> getStopWords();
    void addStopWords(List<String> stopWords);
    void clearStopWords();
    void changeStopWords(List<String> stopWords);

    void generateWarc(Search query);

    void processOneScheduledJob();

    void processOneScheduledWarcExportJob();
}
