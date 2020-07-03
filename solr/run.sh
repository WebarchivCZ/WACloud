set -e
/opt/docker-solr/scripts/init-var-solr
. /opt/docker-solr/scripts/run-initdb
/opt/docker-solr/scripts/precreate-core nkpbase /opt/solr/server/solr/configsets/nkpconfig-base
/opt/docker-solr/scripts/precreate-core nkpquery /opt/solr/server/solr/configsets/nkpconfig-query
exec solr-fg
