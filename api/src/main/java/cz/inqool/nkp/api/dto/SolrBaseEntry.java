package cz.inqool.nkp.api.dto;

import org.apache.solr.client.solrj.beans.Field;

import java.util.Date;
import java.util.List;

public class SolrBaseEntry {
    @Field
    String id;

    @Field
    String url;

    @Field
    Date date;

    @Field
    String harvestType;

    @Field
    String webType;

    @Field
    String pageType;

    @Field
    List<String> topics;

    @Field
    Double sentiment;

    public SolrBaseEntry() {

    }

    public SolrBaseEntry(String id, String url, Date date, String harvestType, String webType, String pageType, List<String> topics, Double sentiment) {
        this.id = id;
        this.url = url;
        this.date = date;
        this.harvestType = harvestType;
        this.webType = webType;
        this.pageType = pageType;
        this.topics = topics;
        this.sentiment = sentiment;
    }

    public String getId() {
        return id;
    }

    public String getUrl() {
        return url;
    }

    public Date getDate() {
        return date;
    }

    public String getHarvestType() {
        return harvestType;
    }

    public String getWebType() {
        return webType;
    }

    public String getPageType() {
        return pageType;
    }

    public List<String> getTopics() {
        return topics;
    }

    public Double getSentiment() {
        return sentiment;
    }
}
