FROM debian:stable-slim

RUN apt-get update; \
    apt-get install -y wkhtmltopdf curl;
