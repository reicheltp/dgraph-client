/* @flow */

import DgraphClient from '../src/index';

describe('client', () => {
  it('can run a query', async () => {
    let client = new DgraphClient('localhost:8080');
    let query = 'query { me(id:paul) {name, size} }';

    let response = await client.query(query);

    expect(response).toMatchSnapshot();
  });

  it('can run a mutation', async () => {
    let client = new DgraphClient('localhost:8080');
    let me = {name: 'Paul', size: 1.85};

    let response = await client.set(me);

    expect(response._uid_).toBeDefined();
    expect(me._uid_).toBeDefined();
    expect(response).toBe(me);
  });

});