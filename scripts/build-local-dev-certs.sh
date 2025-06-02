#! /usr/bin/env sh

rm -rf ./local-dev-certs
mkdir ./local-dev-certs

openssl req -x509 \
  -newkey rsa:4096 \
  -keyout ./local-dev-certs/key.pem \
  -out ./local-dev-certs/cert.pem \
  -sha256 \
  -days 3650 \
  -nodes \
  -addext "subjectAltName = DNS:localhost" \
  -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=CommonNameOrHostname"

