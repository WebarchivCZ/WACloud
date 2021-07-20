package cz.inqool.nkp.api.dto;

import cz.inqool.nkp.api.model.FulltextSearch;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import java.util.List;

public class QueryRequest {
    @NotBlank(message = "type of query is mandatory")
    private final FulltextSearch.Type type;

    @NotBlank(message = "at least one text in query is mandatory")
    private final List<String> texts;

    @Max(value = 20, message = "maximal limit for contextSize is 20")
    @Min(value = 0, message = "minimal limit for contextSize is 0")
    private final Integer contextSize;

    public QueryRequest(FulltextSearch.Type type, List<String> texts, Integer contextSize) {
        this.type = type;
        this.texts = texts;
        this.contextSize = contextSize;
    }

    public FulltextSearch.Type getType() {
        return type;
    }

    public List<String> getTexts() {
        return texts;
    }

    public Integer getContextSize() {
        return contextSize;
    }
}
