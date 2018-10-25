"use strict";

var validate = _interopRequireWildcard(require("express-validation"));

var express = _interopRequireWildcard(require("express"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var bodyParser = require('body-parser');

var Joi = require('joi');

module.exports = function (functions, admin) {
  var app = (0, express)();
  app.use(bodyParser.json());
  var fs = admin.firestore();
  app.get('/', function (req, res) {
    console.log("TODO");
    res.json(['test_12345', 'mywell', 'igrac']);
  });
  var createOrgValidation = {
    options: {
      allowUnknownBody: false
    },
    body: {
      name: Joi.string().required(),
      url: Joi.string().hostname()
    }
  };
  app.post('/', (0, validate)(createOrgValidation), function (req, res) {
    return fs.collection('org').add(req.body).then(function (result) {
      return res.json({
        orgId: result.id
      });
    });
  });
  return functions.https.onRequest(app);
};