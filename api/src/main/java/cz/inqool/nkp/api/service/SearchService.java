package cz.inqool.nkp.api.service;

import cz.inqool.nkp.api.dto.BaseRequest;
import cz.inqool.nkp.api.dto.QueryRequest;

import java.util.List;

public interface SearchService {
    void index(BaseRequest query);
    byte[] query(QueryRequest query);

    List<String> getStopWords();
    void addStopWords(List<String> stopWords);
    void clearStopWords();
    void changeStopWords(List<String> stopWords);
}
