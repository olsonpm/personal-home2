FROM node:20

COPY app /opt/app/

WORKDIR /opt/app/

RUN npm ci --omit dev

CMD node server.js
