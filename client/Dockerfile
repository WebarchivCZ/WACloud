FROM alpine:latest

RUN apk add --update apache2 apache2-proxy yarn \
    && rm -rf /var/cache/apk/* 

ADD package.json /root/
ADD yarn.lock /root/
ADD tsconfig.json /root/

RUN yarn --cwd "/root" install

ADD run.sh /run.sh
RUN chmod +x /run.sh

COPY public /root/public
COPY src /root/src

ENTRYPOINT ./run.sh 

