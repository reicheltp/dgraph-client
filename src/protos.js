import grpc from 'grpc';

const {
  graphp,
  facetsp,
  taskp,
  workerp,
} = grpc.load(__dirname + '/../protos/workerp/payload.proto');
const { typesp } = grpc.load(__dirname + "/../protos/typesp/types.proto");

const protos = {
  graphp,
  facetsp,
  typesp,
  taskp,
  workerp,
};

module.exports = protos;
