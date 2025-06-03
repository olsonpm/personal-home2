#! /usr/bin/env sh

. ./scripts/.env

version=$(jq --raw-output .version < ./package.json)

docker push "${docker_repo}:latest"
docker push "${docker_repo}:v${version}"
