#!/bin/bash

echo 'PORT=8080' >> .env && \
docker-compose run --rm app npm install
