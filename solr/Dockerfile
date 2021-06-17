FROM solr:7-slim
LABEL maintainer="sekan@inqool.cz"

ADD config-base /opt/solr/server/solr/configsets/nkpconfig-base
ADD config-query /opt/solr/server/solr/configsets/nkpconfig-query
ADD sample-data /sample-data
ENTRYPOINT ["bash", "-c", "precreate-core nkpbase /opt/solr/server/solr/configsets/nkpconfig-base; precreate-core nkpquery /opt/solr/server/solr/configsets/nkpconfig-query; exec solr -f"]
