"use strict";
/**
 * SOS is the SOS Adapter for OurWater
 *
 * It will start with basic set of express handlers,
 * but from there, we'll build out a proper SOSAdapterAPI
 * which we may even be able to publish separately
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
//@ts-ignore
const morgan = require("morgan");
//@ts-ignore
const morganBody = require("morgan-body");
const ErrorHandler_1 = require("../common/ErrorHandler");
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
    app.get('*', (req, res) => {
        //TODO: make sure is valid
        const requestType = req.query.REQUEST;
    });
    /*Error Handling - must be at bottom!*/
    app.use(ErrorHandler_1.default);
    return functions.https.onRequest(app);
};
//# sourceMappingURL=sos.js.map