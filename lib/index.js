'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var grpc = _interopDefault(require('grpc'));
var path = _interopDefault(require('path'));
var wkx = _interopDefault(require('wkx'));

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// @noflow
var p1 = grpc.load(path.join(__dirname, '/../protos/task.proto'));
var p2 = grpc.load(path.join(__dirname, '/../protos/types.proto'));

var protos = _extends({}, p1.protos, p2.protos);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function setPropertyValue(nquad, value) {
  switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
    case 'string':
      nquad.objectType = protos.Posting.ValType.STRING;
      nquad.objectValue = new protos.Value().set('str_val', value);
      break;
    case 'number':
      nquad.objectType = protos.Posting.ValType.FLOAT;
      nquad.objectValue = new protos.Value().set('double_val', value);
      break;
    case 'boolean':
      nquad.objectType = protos.Posting.ValType.BOOL;
      nquad.objectValue = new protos.Value().set('bool_val', value);
      break;
    case 'object':
      // GEO JSON
      if ((value.type === 'Point' || value.type === 'Polygon') && value.coordinates.constructor === Array) {
        nquad.objectType = protos.Posting.ValType.GEO;
        var wkb = wkx.Geometry.parseGeoJSON(value).toWkb();
        nquad.objectValue = new protos.Value().set('geo_val', wkb);
      } else if (value instanceof Date) {
        // Send the time as ISO 8061 and let dgraph parse it
        // TODO: #33 Use binary format and datetime_val
        nquad.objectType = protos.Posting.ValType.STRING;
        nquad.objectValue = new protos.Value().set('str_val', value.toISOString());
      }
      break;
  }
}

function toSetMutation(object, map) {
  var mutation = new protos.Mutation();

  function itterObj(obj, map) {
    var counter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    if (map.includes(obj)) {
      // $FlowFixMe
      return obj['_uid_'] || obj.__tmpId;
    }

    // $FlowFixMe
    var id = obj['_uid_'] || '_:' + (obj.__tmpId = 'tmp' + counter);
    map.push(obj);

    for (var key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key) || key === '_uid_' || key === '__tmpId') {
        continue;
      }

      var nquad = new protos.NQuad();
      nquad.subject = id;
      nquad.predicate = key;

      var value = obj[key];
      setPropertyValue(nquad, value);

      if (nquad.objectValue === null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        nquad.objectId = itterObj(value, map, counter + 1);
      }

      mutation.set.push(nquad);
    }

    return id;
  }

  itterObj(object, map);

  return mutation;
}

var ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/;

function getPropertyValue(prop) {
  switch (prop.value.val) {
    case 'default_val':
    case 'bool_val':
    case 'double_val':
    case 'int_val':
    case 'uid_val':
      return prop.value[prop.value.val];
    case 'str_val':
      // TODO: #33 Use binary format and datetime_val otherwise dates are marked as string
      var val = prop.value[prop.value.val];
      if (val.match(ISO_8601)) {
        return new Date(val);
      }
      return val;
    case 'geo_val':
      return wkx.Geometry.parse(prop.value.geo_val).toGeoJSON();
    case 'date_val':
    case 'datetime_val':
      throw Error('See #33. We do not support binary datetime for now.');
    case 'bytes_val':
    case 'password_val':
    default:
      console.log('undefined prop: ' + prop.value.val + ':' + prop.value[prop.value.val]);
      return undefined;
  }
}

function nodeToObject(node) {
  var obj = {};
  if (node.children) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = node.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var child = _step.value;

        if (obj[child.attribute] === undefined) {
          obj[child.attribute] = [nodeToObject(child)];
        } else {
          obj[child.attribute].push(nodeToObject(child));
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  if (node.properties) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = node.properties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var prop = _step2.value;

        obj[prop.prop] = getPropertyValue(prop);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }
  return obj;
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A dgraph gRPC client
 */

var DgraphClient = function () {

  /**
   * create new client
   * @param {string} url
   * @param credentials (optional)
   */
  function DgraphClient(url) {
    var credentials = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

    _classCallCheck(this, DgraphClient);

    if (!credentials) {
      credentials = grpc.credentials.createInsecure();
    }

    this.dgraph = new protos.Dgraph(url, credentials);
  }

  /**
   * Run a DgraphClient.Request against dgraph and get raw response
   * @param request
   * @returns {Promise}
   */


  _createClass(DgraphClient, [{
    key: 'run',
    value: function run(request) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.dgraph.run(request, function (err, response) {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    }

    /**
     * Run a query against dgraph
     * @param query
     */

  }, {
    key: 'query',
    value: function query(_query) {
      var request = new protos.Request();
      request.query = _query;
      return this.run(request).then(function (response) {
        return nodeToObject(response.n[0]);
      });
    }

    /**
     * Set mutation against dgraph
     * @param object
     * @returns {Promise.<*>}
     */

  }, {
    key: 'set',
    value: function set(object) {
      var request = new protos.Request();

      var map = [];
      request.mutation = toSetMutation(object, map);

      return this.run(request).then(function (response) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = map[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var obj = _step.value;

            if (obj.__tmpId) {
              obj['_uid_'] = response.AssignedUids[obj.__tmpId];
              // $FlowFixMe
              delete obj.__tmpId;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return object;
      });
    }
  }]);

  return DgraphClient;
}();

module.exports = DgraphClient;
