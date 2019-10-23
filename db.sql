DROP TABLE IF EXISTS fulltext_search_result;
DROP TABLE IF EXISTS links_search_result;
DROP TABLE IF EXISTS fulltext_analysis;
DROP TABLE IF EXISTS fulltext_search;
DROP TABLE IF EXISTS links_search;
DROP TABLE IF EXISTS archived_webpage;
DROP TABLE IF EXISTS harvest;
DROP TABLE IF EXISTS search;

CREATE TABLE harvest (
    id SERIAL,
    year SMALLINT NOT NULL,
    month SMALLINT NOT NULL,
    type VARCHAR(50),
    PRIMARY KEY (id)
);

CREATE TABLE archived_webpage (
    id VARCHAR(45) NOT NULL,
    harvest_id INT NOT NULL,
    url TEXT NOT NULL,
    topic VARCHAR(50),
    sentiment DOUBLE,
    type VARCHAR(50),
    PRIMARY KEY (id),
    CONSTRAINT fk_archived_webpage_harvest
        FOREIGN KEY (harvest_id) REFERENCES harvest (id)
);

CREATE TABLE search (
    id SERIAL,
    created_at DATE NOT NULL DEFAULT NOW(),
    name VARCHAR(50),
    filter_random_size INT,
    filter_ids_list TEXT,
    filter_faset_json TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE fulltext_analysis (
    id SERIAL,
    search_id INT NOT NULL,
    started_at DATE,
    finished_at DATE,
    state SMALLINT NOT NULL,
    type SMALLINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_fulltext_analysis_search
        FOREIGN KEY (search_id) REFERENCES search (id)
);

CREATE TABLE fulltext_search (
    id SERIAL,
    search_id INT NOT NULL,
    started_at DATE,
    finished_at DATE,
    state SMALLINT NOT NULL,
    query TEXT NOT NULL,
    search_type SMALLINT NOT NULL,
    context_size INT,
    limit INT,
    PRIMARY KEY (id),
    CONSTRAINT fk_fulltext_search_search
        FOREIGN KEY (search_id) REFERENCES search (id)
);

CREATE TABLE fulltext_search_result (
    id SERIAL,
    webpage_id VARCHAR(45) NOT NULL,
    fulltext_search_id INT NOT NULL,
    value TEXT,
    hit_count INT,
    contexts_list TEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_fulltext_search_result_fulltext_search
        FOREIGN KEY (fulltext_search_id) REFERENCES fulltext_search (id),
    CONSTRAINT fk_fulltext_search_result_archived_webpage
        FOREIGN KEY (webpage_id) REFERENCES archived_webpage (id)
);

CREATE TABLE links_search (
    id SERIAL,
    search_id INT NOT NULL,
    started_at DATE,
    finished_at DATE,
    state TINYINT(1) NOT NULL,
    target_urls_list TEXT NOT NULL,
    source_urls_list TEXT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_links_search_search
        FOREIGN KEY (search_id) REFERENCES search (id)
);

CREATE TABLE links_search_result (
    id SERIAL,
    source_id VARCHAR(45) NOT NULL,
    links_search_id INT NOT NULL,
    target TEXT,
    hit_count INT,
    PRIMARY KEY (id),
    CONSTRAINT fk_links_search_result_links_search
        FOREIGN KEY (links_search_id) REFERENCES links_search (id),
    CONSTRAINT fk_links_search_result_archived_webpage
        FOREIGN KEY (source_id) REFERENCES archived_webpage (id)
);
