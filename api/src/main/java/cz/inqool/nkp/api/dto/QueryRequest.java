package cz.inqool.nkp.api.dto;

import cz.inqool.nkp.api.model.AnalyticQuery;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

public class QueryRequest {
    public static final int MAX_LIMIT = 1000;

    @NotBlank(message = "type of query is mandatory")
    private final AnalyticQuery.Type type;

    @NotBlank(message = "format of query is mandatory")
    private final AnalyticQuery.Format format;

    @NotNull(message = "sorting of query is mandatory")
    private final List<AnalyticQuery.SortBy> sorting;

    @NotBlank(message = "at least one text in query is mandatory")
    private final List<String> texts;

    private final List<String> textsOpposite;

    @Max(value = 20, message = "maximal limit for contextSize is 20")
    @Min(value = 0, message = "minimal limit for contextSize is 0")
    private final Integer contextSize;

    @Max(value = MAX_LIMIT, message = "maximal limit is "+MAX_LIMIT)
    @Min(value = 1, message = "minimal limit is 1")
    private final Integer limit;

    private final boolean useOnlyDomains;

    private final boolean useOnlyDomainsOpposite;

    public QueryRequest(AnalyticQuery.Type type, AnalyticQuery.Format format, List<AnalyticQuery.SortBy> sorting, List<String> texts, List<String> textsOpposite, Integer contextSize, Integer limit, boolean useOnlyDomains, boolean useOnlyDomainsOpposite) {
        this.type = type;
        this.format = format;
        this.sorting = sorting;
        this.texts = texts;
        this.textsOpposite = textsOpposite;
        this.contextSize = contextSize;
        this.limit = limit;
        this.useOnlyDomains = useOnlyDomains;
        this.useOnlyDomainsOpposite = useOnlyDomainsOpposite;
    }

    public AnalyticQuery.Type getType() {
        return type;
    }

    public AnalyticQuery.Format getFormat() {
        return format;
    }

    public List<AnalyticQuery.SortBy> getSorting() {
        return sorting;
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

    public boolean isUseOnlyDomains() {
        return useOnlyDomains;
    }

    public boolean isUseOnlyDomainsOpposite() {
        return useOnlyDomainsOpposite;
    }

    public List<String> getTextsOpposite() {
        return textsOpposite;
    }
}
