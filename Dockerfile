FROM node:8

COPY ./bot /opt/bot

WORKDIR /opt/bot

RUN npm install
