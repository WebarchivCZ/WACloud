FROM alpine:latest

RUN apk add --update apache2 apache2-proxy yarn \
    && rm -rf /var/cache/apk/* 

ADD run.sh /run.sh
ADD package.json /root/
ADD yarn.lock /root/
ADD tsconfig.json /root/
COPY src /root/src
COPY public /root/public
RUN chmod +x /run.sh

ENTRYPOINT ./run.sh 
