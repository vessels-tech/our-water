"use strict";

var validate = _interopRequireWildcard(require("express-validation"));

var express = _interopRequireWildcard(require("express"));

var cors = _interopRequireWildcard(require("cors"));

var moment = _interopRequireWildcard(require("moment"));

var _Group = require("../common/models/Group");

var _GroupType = require("../common/enums/GroupType");

var _OWGeoPoint = _interopRequireDefault(require("../common/models/OWGeoPoint"));

var _Resource = require("../common/models/Resource");

var _util = require("util");

var _ResourceIdType = _interopRequireDefault(require("../common/types/ResourceIdType"));

var _ResourceType = require("../common/enums/ResourceType");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var bodyParser = require('body-parser');

var Joi = require('joi');

var fb = require('firebase-admin');

module.exports = function (functions, admin) {
  var app = (0, express)();
  app.use(bodyParser.json());
  var fs = admin.firestore();
  /* CORS Configuration */

  var openCors = (0, cors)({
    origin: '*'
  });
  app.use(openCors); //TODO: fix this error handler
  // app.use(defaultErrorHandler);

  app.use(function (err, req, res, next) {
    console.log("error", err);

    if (err.status) {
      return res.status(err.status).json(err);
    }

    return res.status(500).json({
      status: 500,
      message: err.message
    });
  });

  var getOrgs = function getOrgs(orgId) {
    var last_createdAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, moment)().valueOf();
    var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 25;
    return fs.collection('org').doc(orgId).collection('resource').orderBy('createdAt').startAfter(last_createdAt).limit(limit).get();
  };
  /**
   * return all the resources in a given organisation, containing the latest reading
   */


  app.get('/:orgId', function (req, res, next) {
    var orgId = req.params.orgId;
    var _req$query = req.query,
        last_createdAt = _req$query.last_createdAt,
        limit = _req$query.limit; // const resourceRef = fs.collection('org').doc(orgId).collection('resource');

    return getOrgs(orgId, last_createdAt, limit).then(function (snapshot) {
      var resources = [];
      snapshot.forEach(function (doc) {
        resources.push(doc.data());
      }); //Sadly this doesn't give us the nested reading.
      //It also doesn't give us the document containing the resources...
      //One way to do this would be to store readings in an array on this object, but I'm worried about performance issues

      return res.json(resources);
    }).catch(function (err) {
      return next(err);
    });
  });
  app.get('/:orgId/test', function (req, res, next) {
    console.log("running TEST function");
    var orgId = req.params.orgId; // Try saving a new group

    var coords = [new _OWGeoPoint.default(34.34, -115.67)];
    var group = new _Group.Group('5000', orgId, _GroupType.GroupType.Pincode, coords, null);
    return group.create({
      fs: fs
    }).then(function (saved) {
      return res.json(saved);
    });
  });
  /**
   * createResource
   * 
   * Creates a new resource for a given org
   * 
   *  Example:
   *  {
   *    "coords": {"latitude":13.2, "longitude":45.4},
   *    "type": "well",
   *    "owner": { "name": "Ram Ji"},
   *    "imageUrl": "s3://location",
   *    "groups": {
   *       "9waUCZJIDvGXJzAi64BX": true
   *     }
   *  }
   */

  var createResourceValidation = {
    options: {
      allowUnknownBody: false
    },
    body: {
      //This is annoying...
      data: {
        coords: Joi.object().keys({
          latitude: Joi.number().required(),
          longitude: Joi.number().required()
        }).required(),
        //TODO: make proper enums
        owner: Joi.object().keys({
          name: Joi.string().required()
        }),
        groups: Joi.object().optional(),
        imageUrl: Joi.string().optional(),
        //We will create an index on this to make this backwards compatible with MyWell
        legacyId: Joi.string().optional(),
        type: Joi.valid('well', 'raingauge', 'checkdam').required()
      } //TODO: add custom fields based on type

    }
  };
  app.post('/:orgId/', (0, validate)(createResourceValidation), function (req, res, next) {
    var orgId = req.params.orgId; //Ensure geopoints get added properly

    var oldCoords = req.body.data.coords;
    var newCoords = new fb.firestore.GeoPoint(oldCoords.latitude, oldCoords.longitude);
    req.body.data.coords = newCoords;
    console.log("org id:", orgId); //Add default lastReading

    req.body.data.lastValue = 0;
    req.body.data.lastReadingDatetime = new Date(0); //Ensure the orgId exists

    var orgRef = fs.collection('org').doc(orgId);
    return orgRef.get().then(function (doc) {
      if (!doc.exists) {
        throw new Error("Org with id: ".concat(orgId, " not found"));
      }
    }) //TODO: standardize all these refs
    .then(function () {
      return fs.collection("/org/".concat(orgId, "/resource")).add(req.body.data);
    }).then(function (result) {
      console.log(JSON.stringify({
        resourceId: result.id
      }));
      return res.json({
        resource: result.id
      });
    }).catch(function (err) {
      return next(err);
    });
  });
  /**
   * updateResource
   * PUT /:orgId/:resourceId
   */

  var updateResourceValidation = {
    options: {
      allowUnknownBody: true
    },
    body: {
      //This is annoying...
      data: {
        coords: Joi.object().keys({
          _latitude: Joi.number().optional(),
          _longitude: Joi.number().optional()
        }).optional(),
        owner: Joi.object().keys({
          name: Joi.string().optional(),
          createdByUserId: Joi.string().optional()
        }).optional(),
        externalIds: Joi.object().optional(),
        imageUrl: Joi.string().optional(),
        resourceType: Joi.valid('well', 'raingauge', 'checkdam').optional()
      }
    }
  };
  app.put('/:orgId/:resourceId', (0, validate)(updateResourceValidation), function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(req, res, next) {
      var _req$params, orgId, resourceId, newData, resource, modifiableKeys;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _req$params = req.params, orgId = _req$params.orgId, resourceId = _req$params.resourceId;
              newData = req.body.data;
              console.log("orgId", orgId);
              console.log("resourceId", resourceId);
              console.log("newData", JSON.stringify(newData, null, 2));
              _context.prev = 5;
              _context.next = 8;
              return _Resource.Resource.getResource({
                orgId: orgId,
                id: resourceId,
                fs: fs
              });

            case 8:
              resource = _context.sent;
              modifiableKeys = ['owner', 'externalIds', 'resourceType', 'coords'];
              modifiableKeys.forEach(function (key) {
                var newValue = newData[key];

                if ((0, _util.isNullOrUndefined)(newValue)) {
                  return;
                }

                if (key === 'externalIds') {
                  newValue = _ResourceIdType.default.deserialize(newValue);
                }

                if (key == 'resourceType') {
                  newValue = (0, _ResourceType.resourceTypeFromString)(newValue);
                }

                resource[key] = newValue;
              });
              _context.next = 13;
              return resource.save({
                fs: fs
              });

            case 13:
              return _context.abrupt("return", res.json(resource));

            case 16:
              _context.prev = 16;
              _context.t0 = _context["catch"](5);
              return _context.abrupt("return", next(_context.t0));

            case 19:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[5, 16]]);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }());
  /**
   * getReadingsForResource
   * 
   * Returns all the readings for a given resource, optionally filtering by type.
   * May need 
   */

  var getReadingsForResourceValidation = {
    options: {
      allowUnknownBody: false
    },
    query: {
      type: Joi.valid('well', 'raingauge', 'checkdam').optional()
    }
  };
  app.get('/:orgId/:resourceId/reading', (0, validate)(getReadingsForResourceValidation), function (req, res, next) {
    var type = req.query.type;
    var _req$params2 = req.params,
        orgId = _req$params2.orgId,
        resourceId = _req$params2.resourceId; // // Create a reference to the cities collection
    // var citiesRef = db.collection('cities');
    // // Create a query against the collection
    // var queryRef = citiesRef.where('state', '==', 'CA');
    //TODO: implement optional type filter

    var readingsRef = fs.collection("/org/".concat(orgId, "/reading")).where("resourceId", '==', resourceId).get().then(function (snapshot) {
      var resources = [];
      snapshot.forEach(function (doc) {
        return resources.push(doc.data());
      });
      res.json(resources);
    }).catch(function (err) {
      return next(err);
    });
  });
  /**
   * getResourceNearLocation
   * 
   * Returns all the resources near a given location.
   * Basic geoquery, creates a square bounding box (sorry, nothing too fancy here).
   * 
   * Currently, the cloudstore database only filters by latitude, and not longitude.
   * So this endpoint queries based on latitude, and then manually filters.
   * See: https://github.com/invertase/react-native-firebase/issues/561, 
   *  and https://gist.github.com/zirinisp/e5cf5d9c33cb0bd815993900618eafe0
   * 
   * It seems if we want more advanced geo queries, we will have to implement that ourselves. Some people sync
   * their data to Algolia, which allows them to peform these complex queries. That could work in the future, 
   * but for now, this will do.
   * 
   * @param {number} latitude  - the Latitude of the centre point
   * @param {number} longitude - the Longitude of the centre point
   * @param {float}  distance  - between 0 & 1, how far the search should go. Min x m, Max 10km (approximate)
   */

  var getResourceNearLocationValidation = {
    options: {
      allowUnknownBody: false
    },
    query: {
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      distance: Joi.number().max(1).min(0).required()
    }
  };
  app.get('/:orgId/nearLocation', (0, validate)(getResourceNearLocationValidation), function (req, res, next) {
    var _req$query2 = req.query,
        latitude = _req$query2.latitude,
        longitude = _req$query2.longitude,
        distance = _req$query2.distance;
    var orgId = req.params.orgId;
    var distanceMultiplier = 100; //TODO: tune this value based on the queries we are getting back once we can see it a map

    var minLat = latitude - distanceMultiplier * distance;
    var minLng = longitude - distanceMultiplier * distance;
    var maxLat = latitude + distanceMultiplier * distance;
    var maxLng = longitude + distanceMultiplier * distance;
    console.log("Coords are: min:(".concat(minLat, ",").concat(minLng, "), max:(").concat(maxLat, ",").concat(maxLng, ")."));
    var readingsRef = fs.collection("/org/".concat(orgId, "/resource")).where('coords', '>=', new _OWGeoPoint.default(minLat, minLng)).where('coords', '<=', new _OWGeoPoint.default(maxLat, maxLng)).get().then(function (snapshot) {
      var resources = [];
      snapshot.forEach(function (doc) {
        var data = doc.data();
        data.id = doc.id; // Filter based on longitude. TODO: remove this once google fixes this query

        if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
          return;
        }

        resources.push(data);
      });
      res.json(resources);
    }).catch(function (err) {
      return next(err);
    });
  });
  return functions.https.onRequest(app);
};