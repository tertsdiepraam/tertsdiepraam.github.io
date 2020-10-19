FROM alpine

RUN apk add curl wkhtmltopdf; \
    apk add --update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ zola; \
    apk add libgcc libstdc++ libx11 glib libxrender libxext libintl \
    ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family;