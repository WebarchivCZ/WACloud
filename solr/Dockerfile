FROM solr:7-slim
LABEL maintainer="sekan@inqool.cz"

ADD config-base /opt/solr/server/solr/configsets/nkpconfig-base
ADD config-query /opt/solr/server/solr/configsets/nkpconfig-query
ADD sample-data /sample-data
ADD run.sh /opt/solr
ENTRYPOINT ["bash", "-c", "/opt/solr/run.sh"]
