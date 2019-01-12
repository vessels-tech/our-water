"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate = require("express-validation");
const express = require("express");
const cors = require("cors");
//@ts-ignore
const morgan = require("morgan");
//@ts-ignore
const morganBody = require("morgan-body");
const ErrorHandler_1 = require("../../common/ErrorHandler");
const FirebaseApi_1 = require("../../common/apis/FirebaseApi");
const AppProviderTypes_1 = require("../../common/types/AppProviderTypes");
const FirebaseAdmin_1 = require("../../common/apis/FirebaseAdmin");
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
    }
    /**
   * createShortId
   *
   * @description
   * Creates a shortId for a resource. If the shortId already exists,
   * it returns the existing one.
   *
   *
   * POST /:orgId/
   * body: { resourceId: string }
   */
    const createShortIdValidation = {
        body: {
            resourceId: Joi.string().required()
        }
    };
    //TODO: Secure this endpoint
    app.post('/:orgId', validate(createShortIdValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { orgId } = req.params;
        const { resourceId } = req.body;
        const fbApi = new FirebaseApi_1.default(FirebaseAdmin_1.firestore);
        const result = yield fbApi.createShortId(orgId, resourceId);
        if (result.type === AppProviderTypes_1.ResultType.ERROR) {
            throw new Error(result.message);
        }
        res.json(result.result.serialize());
    }));
    /* CORS Configuration */
    const openCors = cors({ origin: '*' });
    app.use(openCors);
    /*Error Handling - must be at bottom!*/
    app.use(ErrorHandler_1.default);
    return functions.https.onRequest(app);
};
//# sourceMappingURL=shortId.js.map