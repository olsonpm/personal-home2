#! /usr/bin/env sh

. ./scripts/.env

version=$(jq --raw-output .version < ./package.json)

docker build --tag "${docker_repo}:latest" --tag "${docker_repo}:v${version}" .
