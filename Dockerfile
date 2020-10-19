FROM alpine

RUN apk add curl wkhtmltopdf; \
    apk add --update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ zola;