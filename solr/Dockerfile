FROM solr:8.2
MAINTAINER sekan@inqool.cz

ADD config /opt/solr/server/solr/configsets/nkpconfig
ADD sample-data /sample-data
CMD solr-precreate nkpcore /opt/solr/server/solr/configsets/nkpconfig
