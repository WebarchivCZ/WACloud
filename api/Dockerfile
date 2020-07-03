FROM alpine:latest

RUN apk add --update maven openjdk8 \
    && rm -rf /var/cache/apk/*

ADD pom.xml /root/pom.xml
RUN mvn -f /root/pom.xml dependency:go-offline

COPY src /root/src

ENTRYPOINT mvn -f /root/pom.xml spring-boot:run
