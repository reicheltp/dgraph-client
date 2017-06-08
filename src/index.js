// @flow

import grpc from 'grpc'
import protos from './protos'
import { nodeToObject, toSetMutation } from './converter'

/**
 * A dgraph gRPC client
 */
class DgraphClient {
  dgraph: protos.Dgraph

  /**
   * create new client
   * @param {string} url
   * @param credentials (optional)
   */
  constructor (url: string, credentials: any = undefined) {
    if (!credentials) {
      credentials = grpc.credentials.createInsecure()
    }

    this.dgraph = new protos.Dgraph(url, credentials)
  }

  /**
   * Run a DgraphClient.Request against dgraph and get raw response
   * @param request
   * @returns {Promise}
   */
  run (request: any) {
    return new Promise((resolve, reject) => {
      this.dgraph.run(request, (err, response) => {
        if (err) {
          reject(err)
        } else {
          resolve(response)
        }
      })
    })
  }

  /**
   * Run a query against dgraph
   * @param query
   */
  query (query: string): Promise<Object> {
    let request = new protos.Request()
    request.query = query
    return this.run(request).then(response => nodeToObject(response.n[0]))
  }

  /**
   * Set mutation against dgraph
   * @param object
   * @returns {Promise.<*>}
   */
  set<T: Object> (object: T): Promise<T & {id: string}> {
    let request = new protos.Request()

    let map = []
    request.mutation = toSetMutation(object, map)

    return this.run(request)
      .then(response => {
        for (let obj of map) {
          if (obj.__tmpId) {
            obj['_uid_'] = response.AssignedUids[obj.__tmpId]
            // $FlowFixMe
            delete obj.__tmpId
          }
        }

        return object
      })
  }
}

export default DgraphClient
