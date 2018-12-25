FROM node:current-alpine

COPY . /app

WORKDIR /app

RUN apk add zeromq python make g++

RUN npm install

CMD ["node", "start.js"]