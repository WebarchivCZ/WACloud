set -e
precreate-core nkpbase /opt/solr/server/solr/configsets/nkpconfig-base
precreate-core nkpquery /opt/solr/server/solr/configsets/nkpconfig-query
mkdir -p /opt/solr/server/solr/mycores/nkpquery/conf
mkdir -p /opt/solr/server/solr/mycores/nkpbase/conf
exec solr -f