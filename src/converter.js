/* @flow */
import protos from './protos';
import wkx from 'wkx';

const {
  graphp,
  typesp
} = protos;

export function setPropertyValue(nquad, value) {
  switch (typeof value) {
    case 'string':
      nquad.objectType = typesp.Posting.ValType.STRING;
      nquad.objectValue = new graphp.Value().set('str_val', value);
      break;
    case 'number':
      nquad.objectType = typesp.Posting.ValType.FLOAT;
      nquad.objectValue = new graphp.Value().set('double_val', value);
      break;
    case 'boolean':
      nquad.objectType = typesp.Posting.ValType.BOOL;
      nquad.objectValue = new graphp.Value().set('bool_val', value);
      break;
    case 'object':
      // GEO JSON
      if((value.type === 'Point' || value.type === 'Polygon')
        && value.coordinates.constructor === Array){
        nquad.objectType = typesp.Posting.ValType.GEO;
        let wkb = wkx.Geometry.parseGeoJSON(value).toWkb();
        nquad.objectValue = new graphp.Value().set('geo_val', wkb);
      } else if (value instanceof Date){
        nquad.objectType = typesp.Posting.ValType.DATETIME;
        nquad.objectValue = new graphp.Value().set('datetime_val', value.toISOString())
      }
      break;
  }
}

export function toSetMutation(object, map = []){
  let mutation = new graphp.Mutation();

  function itterObj(obj, map, counter = 0) {
    if(map.includes(obj)){
      return obj._uid_ || obj.__tmpId;
    }

    let id = obj._uid_ || '_:' + (obj.__tmpId = 'tmp' + counter);
    map.push(obj);

    for (let key in obj) {
      if (!obj.hasOwnProperty(key) || key === '_uid_' || key === '__tmpId')
        continue;

      let nquad = new graphp.NQuad();
      nquad.subject = id;
      nquad.predicate = key;

      let value = obj[key];
      setPropertyValue(nquad, value);

      if (nquad.objectValue === null && typeof value === 'object') {
        nquad.objectId = itterObj(value, map, counter + 1);
      }

      mutation.set.push(nquad);
    }

    return id;
  }
  itterObj(object, map);

  return mutation;
}

export function getPropertyValue(prop) {
  switch (prop.value.val){
    case 'default_val':
    case 'str_val':
    case 'bool_val':
    case 'double_val':
    case 'int_val':
      return prop.value[prop.value.val];
    case 'geo_val':
      return wkx.Geometry.parse(prop.value.geo_val).toGeoJSON();
    case 'date_val':
    case 'datetime_val':
      return Date.parse(prop.value[prop.value.val]);
    case 'bytes_val':
    case 'password_val':
    default:
      return undefined;
  }
}

export function nodeToObject(node) {
  let obj = {};
  if(node.uid && node.uid > 0){
    obj._uid_ = node.uid;
  }
  if(node.xid){
    obj._xid_ = node.xid;
  }
  if (node.children) {
    for (let child of node.children) {
      obj[child.attribute] = nodeToObject(child);
    }
  }
  if (node.properties) {
    for (let prop of node.properties) {
      obj[prop.prop] = getPropertyValue(prop);
    }
  }
  return obj;
}