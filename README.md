# dgraph-client

A super simple, yet awesome client for dgraph using gRPC protocol. 

#### Benefits:
 - Fast (gRPC)
 - no handling with NQuads, just set objects

### Example
 
```javascript
import DgraphClient from 'dgraph-client';

// create a new client
let client = new DgraphClient('localhost:8080');

// set objects
let me = {name: 'Paul', size: 1.85, time: Date.now()};
await client.set(me); 

// query objects
let me = await client.query(`query { me(id:${me._uid_}) { name, size } }`); 
// reponse is {me: {name: 'Paul', size: 1.85} } 

// set also works with geojson
let me = {name: 'Paul', location: {type: 'Point', coordinates: [13.25, 52.14]}};

await client.set(me);

// and with nested objects
let me = {name: 'Paul', friends: [{name: 'Max'}, {_uid_: "0xd8450668580bf30f"}]};
await client.set(me);

```