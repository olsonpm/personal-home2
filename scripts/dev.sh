#! /usr/bin/env sh

# We're using nodemon since it would take too long to fix
# nunjucks-webpack-plugin compatibility with webpack-dev-server

allExts='.avif,.html,.ico,.js,.mp4,.njk,.png,.scss,.woff'

NODE_ENV='development' nodemon \
  --watch ./client \
  --watch './*.js' \
  --ext "${allExts}" \
  --exec webpack-dev-server
