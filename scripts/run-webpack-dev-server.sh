#! /usr/bin/env sh

NODE_ENV='development' webpack-dev-server \
  --port 4663 \
  --https \
  --http2 \
  --key ./local-dev-certs/key.pem \
  --cert ./local-dev-certs/cert.pem
