/**
 * Copyright (c) 2017 VLEK Technology UG (haftungsbeschränkt). All rights reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * proprietary and confidential.
 */
/* eslint-env jest */
/* @noflow */

import DgraphClient from '../src/index'

describe.skip('client', () => {
  it('can run a query', async () => {
    let client = new DgraphClient('localhost:8080')
    let query = 'query { me(id:paul) {name, size} }'

    let response = await client.query(query)

    expect(response).toMatchSnapshot()
  })

  it('can run a mutation', async () => {
    let client = new DgraphClient('localhost:8080')
    let me = {name: 'Paul', size: 1.85}

    let response = await client.set(me)

    expect(response._uid_).toBeDefined()
    expect(me._uid_).toBeDefined()
    expect(response).toBe(me)
  })

  it('can set and query all the types', async () => {
    let client = new DgraphClient('localhost:8080')

    let obj = {
      str: 'String Value',
      num: 1.23456,
      date: Date.now(),
      geo: {type: 'Point', coordinates: [13.1234, 52.1234]}
    }

    await client.set(obj)
    let query = `query { obj(id:${obj._uid_}) { _uid_, str, num, date, geo }}`
    let response = await client.query(query)

    expect(response.obj).toEqual(obj)
  })
})
