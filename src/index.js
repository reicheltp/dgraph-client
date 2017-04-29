/* @flow */

import grpc from 'grpc';
import { graphp } from './protos';
import { nodeToObject, toSetMutation } from './converter';

/**
 * A dgraph gRPC client
 */
class DgraphClient {

  /**
   * create new client
   * @param url
   * @param credentials (optional)
   */
  constructor(url, credentials){
    if(!credentials){
      credentials = grpc.credentials.createInsecure();
    }

    this.dgraph = new graphp.Dgraph(url, credentials);
  }

  /**
   * Run a DgraphClient.Request against dgraph and get raw response
   * @param request
   * @returns {Promise}
   */
  run(request){
    return new Promise((res, rej) => {
      this.dgraph.run(request, (err, response) => {
        if(err){
          rej(err);
        } else {
          res(response);
        }
      });
    });
  }

  /**
   * Run a query against dgraph
   * @param query
   */
  query(query) {
    let request = new graphp.Request();
    request.query = query;
    return this.run(request).then(response => nodeToObject(response.n[0]));
  }

  /**
   * Set mutation against dgraph
   * @param object
   * @returns {Promise.<*>}
   */
  async set(object) {
    let request = new graphp.Request();

    let map = [];
    request.mutation = toSetMutation(object, map);

    let response = await this.run(request);

    for(let obj of map){
      if(obj.__tmpId){
        obj._uid_ = response.AssignedUids[obj.__tmpId];
        delete obj.__tmpId;
      }
    }

    return object;
  }
}

DgraphClient.Request = graphp.Request;
DgraphClient.Mutation = graphp.Mutation;

export default DgraphClient;
