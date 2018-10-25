"use strict";
/**
 * SOS is the SOS Adapter for OurWater
 *
 * It will start with basic set of express handlers,
 * but from there, we'll build out a proper SOSAdapterAPI
 * which we may even be able to publish separately
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
//@ts-ignore
const morgan = require("morgan");
//@ts-ignore
const morganBody = require("morgan-body");
const ErrorHandler_1 = require("../common/ErrorHandler");
const Types_1 = require("./Types");
const SOSApi_1 = require("../common/apis/SOSApi");
const AppProviderTypes_1 = require("../common/types/AppProviderTypes");
require('express-async-errors');
const bodyParser = require('body-parser');
const Joi = require('joi');
module.exports = (functions) => {
    const app = express();
    app.use(bodyParser.json());
    if (process.env.VERBOSE_LOG === 'false') {
        console.log('Using simple log');
        app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
    }
    else {
        console.log('Using verbose log');
        morganBody(app);
        // app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
    }
    /* CORS Configuration */
    const openCors = cors({ origin: '*' });
    app.use(openCors);
    app.get('*', (req, res) => __awaiter(this, void 0, void 0, function* () {
        //TODO: make sure is valid
        const requestType = req.query.REQUEST;
        //TODO: parse into the appropriate SOSRequest type
        const demoRequest = {
            type: Types_1.SOSRequestType.GetFeatureOfInterest,
            version: '2.0.0',
            service: 'SOS',
            filter: {
                type: Types_1.GetFeatureOfInterestRequestFilterType.spatialFilter,
                namespace: 'om:featureOfInterest/*/sams:shape',
                //-116,50.5,-75,51.6,
                lat: -116,
                lng: 50.5,
                zoom: 51.6,
            }
        };
        const result = yield SOSApi_1.default.handleRequest(demoRequest);
        if (result.type !== AppProviderTypes_1.ResultType.SUCCESS) {
            throw new Error(result.message);
        }
        res.set('Content-Type', 'text/xml');
        res.send(result.result);
    }));
    /*Error Handling - must be at bottom!*/
    app.use(ErrorHandler_1.default);
    return functions.https.onRequest(app);
};
//# sourceMappingURL=sos.js.map