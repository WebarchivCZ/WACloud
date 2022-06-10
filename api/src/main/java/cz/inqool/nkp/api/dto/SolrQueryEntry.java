package cz.inqool.nkp.api.dto;

import org.apache.solr.client.solrj.beans.Field;

import java.util.Date;
import java.util.List;

public class SolrQueryEntry {
    @Field
    String id;

    @Field
    String url;

    @Field
    String urlDomain;

    @Field
    String urlDomainTopLevel;

    @Field
    String title;

    @Field
    String language;

    @Field
    String plainText;

    @Field
    Integer year;

    @Field
    List<String> headlines;

    @Field
    List<String> links;

    @Field
    List<String> topics;

    @Field
    Double sentiment;

    public SolrQueryEntry() {

    }

    public String getId() {
        return id;
    }

    public SolrQueryEntry setId(String id) {
        this.id = id;
        return this;
    }

    public String getUrl() {
        return url;
    }

    public SolrQueryEntry setUrl(String url) {
        this.url = url;
        return this;
    }

    public String getUrlDomain() {
        return urlDomain;
    }

    public SolrQueryEntry setUrlDomain(String urlDomain) {
        this.urlDomain = urlDomain;
        return this;
    }

    public String getUrlDomainTopLevel() {
        return urlDomainTopLevel;
    }

    public SolrQueryEntry setUrlDomainTopLevel(String urlDomainTopLevel) {
        this.urlDomainTopLevel = urlDomainTopLevel;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public SolrQueryEntry setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getLanguage() {
        return language;
    }

    public SolrQueryEntry setLanguage(String language) {
        this.language = language;
        return this;
    }

    public String getPlainText() {
        return plainText;
    }

    public SolrQueryEntry setPlainText(String plainText) {
        this.plainText = plainText;
        return this;
    }

    public List<String> getHeadlines() {
        return headlines;
    }

    public SolrQueryEntry setHeadlines(List<String> headlines) {
        this.headlines = headlines;
        return this;
    }

    public List<String> getLinks() {
        return links;
    }

    public SolrQueryEntry setLinks(List<String> links) {
        this.links = links;
        return this;
    }

    public List<String> getTopics() {
        return topics;
    }

    public SolrQueryEntry setTopics(List<String> topics) {
        this.topics = topics;
        return this;
    }

    public Double getSentiment() {
        return sentiment;
    }

    public SolrQueryEntry setSentiment(Double sentiment) {
        this.sentiment = sentiment;
        return this;
    }

    public Integer getYear() {
        return year;
    }

    public SolrQueryEntry setYear(Integer year) {
        this.year = year;
        return this;
    }
}
