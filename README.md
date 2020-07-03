# Centralized interface

### Run containers

Containers can be run through docker-compose with following command.
There is a docker image built from solr/Dockerfile, therefore if it 
is change, we also have to add a `--build` option.

- `docker-compose up -d`

### Client application

If all containers start succefully, an HTTP server runs on the TCP port 5000. 
It is small configuration check application, that creates proxy to the backend API 
service and tries to get version information from the API. 
