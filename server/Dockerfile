FROM node:current-alpine as server-dependecies

WORKDIR /usr/server
COPY server/package*.json ./
COPY server/server.js ./

RUN ["npm", "i"]

FROM node:current-alpine as build-and-run

COPY --from=server-dependecies /usr/server ./usr/server

WORKDIR /usr/server

CMD ["npm", "start"]