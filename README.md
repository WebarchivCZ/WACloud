# WACloud

Centralised interface for Webarchive data extraction and analysis

## Funding - dedication

The work of this project - Centralised interface for Webarchive big data extraction and analysis (project identification code: DG18P02OVV016), was supported via programme of the Ministry of culture of the Czech Republic - Applied research and developement of national and culture identity programme (NAKI).

## Structure of the repository

The repository contains four subfolders, each with one component:

| Subdir name | Description                                             |
|-------------|---------------------------------------------------------|
| api         | Backend application based on springboot framework       |
| client      | Frontend application based on react                     |
| solr        | Docker image with Solr engine and two cores definitions |
| database    | Example of ER diagram and schema definition             |

## Development/initialization of a new environment

### Initialization

Before the first run of the application do the following:
- copy the content of the file `.env.example` to a new file `.env`
- change environment values in the file `.env` with proper values for your environment

#### Environment variables in the file `.env`

| Environment value's name   | Description                                         |
|----------------------------|-----------------------------------------------------|
| POSTGRES_PASSWORD          | Password used for database account                  |
| SPRING_DATASOURCE_PASSWORD | Have to contain the same value as POSTGRES_PASSWORD |
| HBASE_ZOOKEEPER_QUORUM     | IP/domain of the zookeeper with hbase node          |
| ZOOKEEPER_ZNODE_PARENT     | Zookeeper prefix for hbase nodes                    |

### Run containers

Containers can be run through docker-compose with following command.
There is a docker image built from solr/Dockerfile, therefore if it 
is change, we also have to add a `--build` option.

- `docker-compose up -d`

### Client application

If all containers start successfully, an HTTP server runs on the TCP port 5000. 

## Existed environment

### Test cluster segment
 
The application is running on the application node. To deploy a new version from 
git repository it is possible to use GitLab CI on the branch test (merge changes from `master`
to `test` branch and manually run pipeline's job `deploy-test`)

### Changes in Solr schemas

If schemas configs are changes, solr container has to be stopped and removed together with volumes
connected to it (`app_solr_cores_data, app_solr_data`). Then start Solr with command 
`docker-compose up -d --build solr`.
