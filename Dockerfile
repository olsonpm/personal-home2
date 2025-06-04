FROM node:20

COPY app /opt/app/

WORKDIR /opt/app/

RUN corepack enable pnpm \
  && corepack prepare pnpm@10.11.1 --activate \
  && pnpm config set store-dir /root/pnpm-store

CMD pnpm -v \
  && pnpm install --prod --frozen-lockfile \
  && node server.js
