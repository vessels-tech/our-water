"use strict";

var validate = _interopRequireWildcard(require("express-validation"));

var express = _interopRequireWildcard(require("express"));

var moment = _interopRequireWildcard(require("moment"));

var _utils = require("../common/utils");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var bodyParser = require('body-parser');

var Joi = require('joi');

var fb = require('firebase-admin');

module.exports = function (functions, admin) {
  var app = (0, express)();
  app.use(bodyParser.json());
  var fs = admin.firestore(); //TODO: fix this error handler
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
  /**
   * GET reading
   * Get all the readings for an orgId + resourceId
   */

  var getReading = function getReading(orgId, resourceId) {
    var last_createdAt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, moment)().valueOf();
    var limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 25;
    return fs.collection('org').doc(orgId).collection('reading').where('resourceId', '==', resourceId).orderBy('createdAt').startAfter(last_createdAt).limit(limit).get();
  };

  app.get('/:orgId/:resourceId', function (req, res, next) {
    var _req$params = req.params,
        orgId = _req$params.orgId,
        resourceId = _req$params.resourceId;
    var _req$query = req.query,
        last_createdAt = _req$query.last_createdAt,
        limit = _req$query.limit;
    return getReading(orgId, resourceId, last_createdAt, limit).then(function (snapshot) {
      return (0, _utils.snapshotToResourceList)(snapshot);
    }).then(function (resources) {
      return res.json(resources);
    }).catch(function (err) {
      return next(err);
    });
  });
  /**
   * saveReading
   * Records a new reading for a given orgId + resourceId
   * 
   * Example:
   * "data" {
   *   "datetime":"2018-04-28T09:40:38.460Z",
   *   "value":"123"
   * }
   */

  var createReadingValidation = {
    options: {
      allowUnknownBody: false
    },
    body: {
      data: {
        datetime: Joi.string().isoDate().required(),
        value: Joi.number().required()
      }
    }
  }; //Format the reading to be saved into the database

  var formatNewReading = function formatNewReading(data, resourceId) {
    return _extends({
      datetime: new Date(data.datetime),
      resourceId: resourceId
    }, data);
  };

  app.post('/:orgId/:resourceId/reading', (0, validate)(createReadingValidation), function (req, res, next) {
    var _req$params2 = req.params,
        orgId = _req$params2.orgId,
        resourceId = _req$params2.resourceId;
    var data = formatNewReading(req.body.data, resourceId); //TODO: custom validate depending on resource type
    //e.g. Date can't be in the future
    //Ensure the orgId + resource exists

    var resourceRef = fs.collection('org').doc(orgId).collection('resource').doc(resourceId);
    return resourceRef.get().then(function (doc) {
      if (!doc.exists) {
        throw new Error("Resource with with orgId: ".concat(orgId, ", resourceId: ").concat(resourceId, " not found"));
      }
    }) //TODO: standardize all these refs
    .then(function () {
      return fs.collection("/org/".concat(orgId, "/reading/")).add(data);
    }).then(function (result) {
      return res.json({
        reading: result.id
      });
    }).catch(function (err) {
      return next(err);
    });
  });
  /**
   * legacy_saveReading
   * Records a reading from the legacy MyWell System
   * 
   * @param {string} orgId - the organisation id
   * @param {string} legacyResourceId - a lecacy resourceId, of the format `pincode.resourceId`, eg 313603.1120
   */

  app.post('/legacy_save/:orgId/:legacyResourceId', (0, validate)(createReadingValidation), function (req, res, next) {
    var _req$params3 = req.params,
        orgId = _req$params3.orgId,
        legacyResourceId = _req$params3.legacyResourceId; //First, look up the resource based on the legacy id

    return fs.collection('org').doc(orgId).collection('resource').where('legacyResourceId', '==', legacyResourceId).get().then(function (snapshot) {
      var resources = [];
      snapshot.forEach(function (doc) {
        return resources.push(_extends({
          id: doc.id
        }, doc.data()));
      });

      if (resources.length === 0) {
        var error = new Error("No legacy resource found for legacyResourceId: ".concat(legacyResourceId));
        return Promise.reject(error);
      }

      if (resources.length > 1) {
        console.error("Found ".concat(resources.length, " resources for legacyResourceId: ").concat(legacyResourceId, ". Expected 1."));
      }

      console.log('found legacy res', resources);
      return resources[0];
    }).then(function (newResource) {
      var data = formatNewReading(req.body.data, newResource.id);
      console.log("data is:", data);
      return fs.collection("/org/".concat(orgId, "/reading/")).add(data);
    }).then(function (result) {
      return res.json({
        reading: result.id
      });
    }).catch(function (err) {
      return next(err);
    });
  });
  return functions.https.onRequest(app);
};