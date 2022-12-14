#### Environment variables in the file `.env`

| Environment value's name   | Description                                         |
|----------------------------|-----------------------------------------------------|
| POSTGRES_PASSWORD          | Password used for database account                  |
| SPRING_DATASOURCE_PASSWORD | Have to contain the same value as POSTGRES_PASSWORD |
| HBASE_ZOOKEEPER_QUORUM     | IP/domain of the zookeeper with hbase node          |
| ZOOKEEPER_ZNODE_PARENT     | Zookeeper prefix for hbase nodes                    |


# FAQ

**What is the interface for?**

The centralized interface allows researchers to work with data stored in the web archive of the National Library of the Czech Republic. Using faceted (using filters) and full-text searches, they can specify their queries and retrieve datasets relevant for further research.

**How can I create a query?**

First you need to enter filters (site and query parameters) on the home page. This will narrow down the number of sites to search. Then you can enter one or more of the four analytical queries (full-text search, collocation, frequency, networks). Multiple analytical queries can be entered simultaneously.

**What are harvests?**

Harvesting is the process of harvesting web content. There are several types, such as full-screen, selective or thematic. You can learn more about Webarchive harvests [here](https://www.webarchiv.cz/cs/o-webarchivu) and [here](http://invenio.nusl.cz/record/432325).

**How big are the harvests?**

Harvests are in the order of hundreds of MB to units of GB of data, depending on the number of WARCs they contain.

**What are analytical queries?**

Analytic queries allow you to create datasets based on query parameters - such as full-text search (finds the search word), collocation (related words), frequency (most common words), networks (links leading to other pages).


**What is the format of a datasets?**

Analytic queries result in an exported dataset in either .json or .csv format. 

**Can I bring my own data?**

No, the interface only works with Webarchive data that is embedded in the interface.

**Can I take the resulting datasets with me?**

Yes, you can download the dataset and work with it later. 


Detailed technical documentation and user manual is available [here](https://github.com/WebarchivCZ/WACloud_Docs) 
