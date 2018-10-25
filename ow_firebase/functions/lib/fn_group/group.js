"use strict";

var validate = _interopRequireWildcard(require("express-validation"));

var express = _interopRequireWildcard(require("express"));

var _OWGeoPoint = _interopRequireDefault(require("../common/models/OWGeoPoint"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var bodyParser = require('body-parser');

var Joi = require('joi');

module.exports = function (functions, admin) {
  var app = (0, express)();
  app.use(bodyParser.json());
  var fs = admin.firestore(); // const defaultErrorHandler = require('../common/defaultErrorHandler');
  //TODO: fix this error handler
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
  app.get('/:orgId', function (req, res) {
    return res.send("TODO");
  });
  var createGroupValidation = {
    options: {
      allowUnknownBody: false
    },
    body: {
      coords: Joi.array().items(Joi.object().keys({
        latitude: Joi.number().required(),
        longitude: Joi.number().required()
      })).required(),
      //TODO: make proper enums
      type: Joi.valid('village', 'pincode', 'country').required(),
      name: Joi.string().required()
    }
  };

  var fb = require('firebase-admin');

  app.post('/:orgId/', (0, validate)(createGroupValidation), function (req, res, next) {
    var orgId = req.params.orgId; //Ensure geopoints get added properly

    var newCoords = req.body.coords.map(function (c) {
      return new _OWGeoPoint.default(c.latitude, c.longitude);
    });
    req.body.coords = newCoords;
    console.log("org id:", orgId); //Ensure the orgId exists

    var orgRef = fs.collection('org').doc(orgId);
    return orgRef.get().then(function (doc) {
      if (!doc.exists) {
        throw new Error("Org with id: ".concat(orgId, " not found"));
      }
    }).then(function () {
      return fs.collection("/org/".concat(orgId, "/group")).add(req.body);
    }).then(function (result) {
      return res.json({
        groupId: result.id
      });
    }).catch(function (err) {
      return next(err);
    });
  });
  /**
   * getResourcesForGroup
   * 
   * Returns all the resources for a given group
   */

  var getReadingsForGroupValidation = {
    options: {
      allowUnknownBody: false
    },
    query: {
      type: Joi.valid('well', 'raingauge', 'checkdam').optional()
    }
  };
  app.get('/:orgId/:groupId/resource', function (req, res, next) {
    var type = req.query.type;
    var _req$params = req.params,
        orgId = _req$params.orgId,
        groupId = _req$params.groupId; // // Create a reference to the cities collection
    // var citiesRef = db.collection('cities');
    // // Create a query against the collection
    // var queryRef = citiesRef.where('state', '==', 'CA');

    var readingsRef = fs.collection("/org/".concat(orgId, "/resource")).where("groups.".concat(groupId), '==', true).get().then(function (snapshot) {
      var resources = [];
      snapshot.forEach(function (doc) {
        return resources.push(doc.data());
      });
      res.json(resources);
    }).catch(function (err) {
      return next(err);
    });
  });
  return functions.https.onRequest(app);
};