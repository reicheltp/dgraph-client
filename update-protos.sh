#!/usr/bin/env bash
# Download the protos directly from dgraph repository. We replace the absolute imports with
# relative ones.

rm -rf ./protos

IMPORT_GLOBAL="github.com/dgraph-io/dgraph/protos/"
IMPORT_LOCAL="../"

mkdir -p ./protos/facetsp
curl -s https://raw.githubusercontent.com/dgraph-io/dgraph/release/v0.7.5/protos/facetsp/facets.proto \
| sed "s,$IMPORT_GLOBAL,$IMPORT_LOCAL,g" > ./protos/facetsp/facets.proto

mkdir -p ./protos/graphp
curl https://raw.githubusercontent.com/dgraph-io/dgraph/release/v0.7.5/protos/graphp/graphresponse.proto \
| sed "s,$IMPORT_GLOBAL,$IMPORT_LOCAL,g" > ./protos/graphp/graphresponse.proto

mkdir -p ./protos/taskp
curl https://raw.githubusercontent.com/dgraph-io/dgraph/release/v0.7.5/protos/taskp/task.proto \
| sed "s,$IMPORT_GLOBAL,$IMPORT_LOCAL,g" > ./protos/taskp/task.proto

mkdir -p ./protos/typesp
curl https://raw.githubusercontent.com/dgraph-io/dgraph/release/v0.7.5/protos/typesp/types.proto \
| sed "s,$IMPORT_GLOBAL,$IMPORT_LOCAL,g" > ./protos/typesp/types.proto

mkdir -p ./protos/workerp
curl https://raw.githubusercontent.com/dgraph-io/dgraph/release/v0.7.5/protos/workerp/payload.proto \
| sed "s,$IMPORT_GLOBAL,$IMPORT_LOCAL,g" > ./protos/workerp/payload.proto