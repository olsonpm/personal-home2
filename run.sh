#! /usr/bin/env sh

#
# can't use `npx` because it wants to swallow error output for some reason.  I
#   didn't look too much into it though, meaning it could have something to do
#   with webpack and esm or a combination of all.
#

command="${1}"
shift

build() {
  config="${1}"
  shift
  node node_modules/.bin/webpack \
    --config-register 'esm' \
    --config "${config}" \
    "$@"
}

build_client() {
  build 'webpack-config/client.js' "$@"
}

build_server() {
  build 'webpack-config/server.js' "$@"
}

usage() {
  echo '' >&2
  echo './run <command> [args]' >&2
  echo '' >&2
  echo 'commands' >&2
  echo '  build-(dev|prod)' >&2
  echo '  (dev|prod)' >&2
  echo '  lint' >&2
}

case "${command}" in
  build-release)
    NODE_ENV='production' build_client "$@"
    NODE_ENV='production' build_server "$@"
    cp package.json package-lock.json license.txt release ;;

  build-prod)
    NODE_ENV='production' build_client "$@"
    NODE_ENV='production' build_server "$@" ;;

  prod)
    NODE_ENV='production' node -r esm pseudo-prod-server.js ;;

  dev)
    NODE_ENV='development' \
      node ./node_modules/.bin/webpack-dev-server \
      --config-register esm \
      --config webpack-config/client.js \
      ;;

  lint)
    node node_modules/.bin/eslint --ext .js -- webpack-config index.js server.js client/js/index.js ;;

  '')
    echo 'no command given' >&2
    echo '' >&2
    usage ;;

  *)
    echo "command not found: ${command}" >&2
    echo '' >&2
    usage ;;
esac
