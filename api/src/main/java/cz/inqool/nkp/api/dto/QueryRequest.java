package cz.inqool.nkp.api.dto;

import cz.inqool.nkp.api.model.FulltextSearch;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import java.util.List;

import static cz.inqool.nkp.api.dto.BaseRequest.DEFAULT_RANDOM_SEED;

public class QueryRequest {
    public static final int MAX_LIMIT = 1000;

    @NotBlank(message = "type of query is mandatory")
    private final FulltextSearch.Type type;

    @NotBlank(message = "at least one text in query is mandatory")
    private final List<String> texts;

    @Max(value = 20, message = "maximal limit for contextSize is 20")
    @Min(value = 0, message = "minimal limit for contextSize is 0")
    private final Integer contextSize;

    @Max(value = MAX_LIMIT, message = "maximal limit is "+MAX_LIMIT)
    @Min(value = 1, message = "minimal limit is 1")
    private final Integer limit;

    public QueryRequest(FulltextSearch.Type type, List<String> texts, Integer contextSize, Integer limit) {
        this.type = type;
        this.texts = texts;
        this.contextSize = contextSize;
        this.limit = limit;
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

    public Integer getLimit() {
        if (limit == null || limit.equals(0)) {
            return MAX_LIMIT;
        }
        return limit;
    }
}
