"use strict";

var express = _interopRequireWildcard(require("express"));

var cors = _interopRequireWildcard(require("cors"));

var morgan = _interopRequireWildcard(require("morgan"));

var morganBody = _interopRequireWildcard(require("morgan-body"));

var _ErrorHandler = _interopRequireDefault(require("../common/ErrorHandler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * SOS is the SOS Adapter for OurWater
 * 
 * It will start with basic set of express handlers, 
 * but from there, we'll build out a proper SOSAdapterAPI
 * which we may even be able to publish separately
 */
//@ts-ignore
//@ts-ignore
require('express-async-errors');

var bodyParser = require('body-parser');

var Joi = require('joi');

module.exports = function (functions) {
  var app = (0, express)();
  app.use(bodyParser.json());

  if (process.env.VERBOSE_LOG === 'false') {
    console.log('Using simple log');
    app.use((0, morgan)(':method :url :status :res[content-length] - :response-time ms'));
  } else {
    console.log('Using verbose log');
    (0, morganBody)(app); // app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  }
  /* CORS Configuration */


  var openCors = (0, cors)({
    origin: '*'
  });
  app.use(openCors);
  app.get('*', function (req, res) {
    //TODO: make sure is valid
    var requestType = req.query.REQUEST;
  });
  /*Error Handling - must be at bottom!*/

  app.use(_ErrorHandler.default);
  return functions.https.onRequest(app);
};