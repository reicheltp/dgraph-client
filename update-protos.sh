#!/usr/bin/env bash
# Download the protos directly from dgraph repository

protos=("facets" "graphresponse" "payload" "schema" "task" "types")

mkdir -p ./protos
rm ./protos/*

for proto in "${protos[@]}"
do
    curl -s "https://raw.githubusercontent.com/dgraph-io/dgraph/release/v0.7.7/protos/$proto.proto" \
        > "./protos/$proto.proto"
done
