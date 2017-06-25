// @flow
import protos from './protos'
import wkx from 'wkx'

export function setPropertyValue (nquad: protos.NQuad, value: any) {
  switch (typeof value) {
    case 'string':
      nquad.objectType = protos.Posting.ValType.STRING
      nquad.objectValue = new protos.Value().set('str_val', value)
      break
    case 'number':
      nquad.objectType = protos.Posting.ValType.FLOAT
      nquad.objectValue = new protos.Value().set('double_val', value)
      break
    case 'boolean':
      nquad.objectType = protos.Posting.ValType.BOOL
      nquad.objectValue = new protos.Value().set('bool_val', value)
      break
    case 'object':
      // GEO JSON
      if (
        (value.type === 'Point' || value.type === 'Polygon') &&
        value.coordinates.constructor === Array
      ) {
        nquad.objectType = protos.Posting.ValType.GEO
        let wkb = wkx.Geometry.parseGeoJSON(value).toWkb()
        nquad.objectValue = new protos.Value().set('geo_val', wkb)
      } else if (value instanceof Date) {
        // Send the time as ISO 8061 and let dgraph parse it
        // TODO: #33 Use binary format and datetime_val
        nquad.objectType = protos.Posting.ValType.STRING
        // nquad.objectType = protos.Posting.ValType.DATETIME
        nquad.objectValue = new protos.Value().set(
          'str_val',
          value.toISOString()
        )
        // nquad.objectValue = new protos.Value().set(
        //   'datetime_val',
        //   value.toISOString()
        // )
      }
      break
  }
}

export function toSetMutation (object: {}, map: {}[]) {
  let mutation = new protos.Mutation()

  function itterObj (obj, map, counter = 0) {
    if (map.includes(obj)) {
      // $FlowFixMe
      return obj['_uid_'] || obj.__tmpId
    }

    // $FlowFixMe
    let id = obj['_uid_'] || '_:' + (obj.__tmpId = 'tmp' + counter)
    map.push(obj)

    for (let key in obj) {
      if (
        !Object.prototype.hasOwnProperty.call(obj, key) ||
        key === '_uid_' ||
        key === '__tmpId'
      ) {
        continue
      }

      let nquad = new protos.NQuad()
      nquad.subject = id
      nquad.predicate = key

      let value = obj[key]
      setPropertyValue(nquad, value)

      if (nquad.objectValue === null && typeof value === 'object') {
        nquad.objectId = itterObj(value, map, counter + 1)
      }

      mutation.set.push(nquad)
    }

    return id
  }

  itterObj(object, map)

  return mutation
}

const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/

export function getPropertyValue (prop: protos.Property) {
  // console.log(`prop: ${prop.value.val}:${prop.value[prop.value.val]}`)
  switch (prop.value.val) {
    case 'uid_val':
      return prop.value[prop.value.val]
    case 'default_val':
      let val = prop.value[prop.value.val]

      if (val.match(ISO_8601)) {
        return new Date(val)
      }
      try {
        return JSON.parse(val)
      } catch (err) {
        try {
          // Maybe a geojson so replace ' with " that we can deserialize it
          return JSON.parse(val.replace(/'/g, "\""))
        } catch (err) {
        }

        // obviously a plain string
        return val
      }
    case 'bool_val':
    case 'double_val':
    case 'int_val':
    // return prop.value[prop.value.val]
    case 'geo_val':
    // return wkx.Geometry.parse(prop.value.geo_val).toGeoJSON()
    case 'str_val':
      // TODO: #33 Use binary format and datetime_val otherwise dates are marked as string
      // let val = prop.value[prop.value.val]
      // if (val.match(ISO_8601)) {
      //   return new Date(val)
      // }
      // return val

      throw new Error(
        'dgraph 0.7.7 returns all values except uid as default_val'
      )
    case 'date_val':
    case 'datetime_val':
      throw Error('See #33. We do not support binary datetime for now.')
    case 'bytes_val':
    case 'password_val':
    default:
      console.log(
        `undefined prop: ${prop.value.val}:${prop.value[prop.value.val]}`
      )
      return undefined
  }
}

export function nodeToObject (node: protos.Node) {
  let obj = {}
  if (node.children) {
    for (let child of node.children) {
      if (obj[child.attribute] === undefined) {
        obj[child.attribute] = [nodeToObject(child)]
      } else {
        obj[child.attribute].push(nodeToObject(child))
      }
    }
  }
  if (node.properties) {
    for (let prop of node.properties) {
      obj[prop.prop] = getPropertyValue(prop)
    }
  }
  return obj
}
