/* eslint-env jest */
/* @noflow */

import DgraphClient from '../src/index'

async function setAndQuery (value, debug = false) {
  let client = new DgraphClient('localhost:8080')

  let obj = {
    value
  }

  await client.set(obj, debug)

  let query = `query { obj(id:${obj._uid_}) { _uid_, value }}`
  let { obj: response } = await client.query(query, debug)

  expect(response[0]).toEqual(obj)
}

describe('client', () => {
  it('can run a query', async () => {
    let client = new DgraphClient('localhost:8080')
    let query = 'query { me(id:paul) {name, size} }'

    let response = await client.query(query)

    expect(response).toMatchSnapshot()
  })

  it('can run a mutation', async () => {
    let client = new DgraphClient('localhost:8080')
    let me = { name: 'Paul', size: 1.85 }

    let response = await client.set(me)

    expect(response._uid_).toBeDefined()
    expect(me._uid_).toBeDefined()
    expect(response).toBe(me)
  })
})

describe('can set and query value', () => {
  it('bool (true)', () => setAndQuery(true))
  it('bool (false)', () => setAndQuery(false))

  it('string', () => setAndQuery('Hallo World String!'))
  //it('string (empty)', () => setAndQuery('', true))

  it('number', () => setAndQuery(12345))
  it('number (negative)', () => setAndQuery(-12345))
  it('number (float)', () => setAndQuery(12.345))
  it('number (float negative)', () => setAndQuery(-12.345))

  it('geo json (point)', () =>
    setAndQuery({
      type: 'Point',
      coordinates: [9.3603515625, 51.6180165487737]
    }))
  it('geo json (polygon)', () =>
    setAndQuery({
      type: 'Polygon',
      coordinates: [
        [
          [10.711669921874998, 51.97134580885172],
          [12.76611328125, 51.97134580885172],
          [12.76611328125, 53.16982647814065],
          [10.711669921874998, 53.16982647814065],
          [10.711669921874998, 51.97134580885172]
        ]
      ]
    }))

  it('date', () => setAndQuery(new Date(2017, 8, 23)))
  it('datetime', () => setAndQuery(new Date(2017, 8, 23, 12, 23, 12)))
})
