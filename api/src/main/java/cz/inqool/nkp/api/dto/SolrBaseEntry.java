package cz.inqool.nkp.api.dto;

import org.apache.solr.client.solrj.beans.Field;

import java.time.LocalDate;
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

    public SolrBaseEntry setId(String id) {
        this.id = id;
        return this;
    }

    public String getUrl() {
        return url;
    }

    public SolrBaseEntry setUrl(String url) {
        this.url = url;
        return this;
    }

    public Date getDate() {
        return date;
    }

    public SolrBaseEntry setDate(Date date) {
        this.date = date;
        return this;
    }
    public SolrBaseEntry setDate(LocalDate date) {
        this.date = java.sql.Date.valueOf(date);
        return this;
    }

    public String getHarvestType() {
        return harvestType;
    }

    public SolrBaseEntry setHarvestType(String harvestType) {
        this.harvestType = harvestType;
        return this;
    }

    public String getWebType() {
        return webType;
    }

    public SolrBaseEntry setWebType(String webType) {
        this.webType = webType;
        return this;
    }

    public String getPageType() {
        return pageType;
    }

    public SolrBaseEntry setPageType(String pageType) {
        this.pageType = pageType;
        return this;
    }

    public List<String> getTopics() {
        return topics;
    }

    public SolrBaseEntry setTopics(List<String> topics) {
        this.topics = topics;
        return this;
    }

    public Double getSentiment() {
        return sentiment;
    }

    public SolrBaseEntry setSentiment(Double sentiment) {
        this.sentiment = sentiment;
        return this;
    }
}
