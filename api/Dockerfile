FROM alpine:latest

RUN apk add --update maven openjdk8 \
    && rm -rf /var/cache/apk/*

COPY src /root/src
ADD pom.xml /root/pom.xml

ENTRYPOINT mvn -f /root/pom.xml spring-boot:run
