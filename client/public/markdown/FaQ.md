## Dedication

Výstup vznikl za podpory projektu Vývoj centralizovaného rozhraní pro vytěžování velkých dat z webových archivů (identifikační kód projektu DG18P02OVV016), který je financován prostřednictvím dotačního programu MK ČR NAKI.

#### Environment variables in the file `.env`

| Environment value's name   | Description                                         |
|----------------------------|-----------------------------------------------------|
| POSTGRES_PASSWORD          | Password used for database account                  |
| SPRING_DATASOURCE_PASSWORD | Have to contain the same value as POSTGRES_PASSWORD |
| HBASE_ZOOKEEPER_QUORUM     | IP/domain of the zookeeper with hbase node          |
| ZOOKEEPER_ZNODE_PARENT     | Zookeeper prefix for hbase nodes                    |
