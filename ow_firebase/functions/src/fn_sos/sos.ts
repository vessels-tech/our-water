/**
 * SOS is the SOS Adapter for OurWater
 * 
 * It will start with basic set of express handlers, 
 * but from there, we'll build out a proper SOSAdapterAPI
 * which we may even be able to publish separately
 */

import * as express from 'express';
import * as cors from 'cors';
import * as moment from 'moment';
//@ts-ignore
import * as morgan from 'morgan';
//@ts-ignore
import * as morganBody from 'morgan-body';
import ErrorHandler from '../common/ErrorHandler';
import { SOSRequestType, GetFeatureOfInterestRequest, GetFeatureOfInterestRequestFilterType } from './Types';
import SOSApi from '../common/apis/SOSApi';
import { ResultType } from '../common/types/AppProviderTypes';

require('express-async-errors');


const bodyParser = require('body-parser');
const Joi = require('joi');

module.exports = (functions: any) => {
  const app = express();
  app.use(bodyParser.json());


  if (process.env.VERBOSE_LOG === 'false') {
    console.log('Using simple log');
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  } else {
    console.log('Using verbose log');
    morganBody(app);
    // app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

  }

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);


  app.get('*', async (req, res) => {
    //TODO: make sure is valid
    const requestType: SOSRequestType = req.query.REQUEST;

    //TODO: parse into the appropriate SOSRequest type

    const demoRequest: GetFeatureOfInterestRequest = {
      type: SOSRequestType.GetFeatureOfInterest,
      version: '2.0.0',
      service: 'SOS',
      filter: {
        type: GetFeatureOfInterestRequestFilterType.spatialFilter,
        namespace: 'om:featureOfInterest/*/sams:shape',
        //-116,50.5,-75,51.6,
        lat: -116,
        lng: 50.5,
        zoom: 51.6,
      }
    }

    const result = await SOSApi.handleRequest(demoRequest);
    if (result.type !== ResultType.SUCCESS) { 
      throw new Error(result.message);
    }

    res.set('Content-Type', 'text/xml');
    res.send(result.result);
  });
  

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
}