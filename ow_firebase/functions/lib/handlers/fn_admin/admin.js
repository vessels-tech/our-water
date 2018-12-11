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
const ErrorHandler_1 = require("../../common/ErrorHandler");
//@ts-ignore
const morgan = require("morgan");
//@ts-ignore
const morganBody = require("morgan-body");
const QRCode_1 = require("../../common/apis/QRCode");
const AppProviderTypes_1 = require("../../common/types/AppProviderTypes");
const utils_1 = require("../../common/utils");
const FirebaseApi_1 = require("../../common/apis/FirebaseApi");
const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin');
require('express-async-errors');
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
    //TODO: figure out how to implement basic ACLS
    //we don't want to validate these endpoints for now.
    // app.use(validateFirebaseIdToken);
    /**
     * GenerateQRCode
     *
     * Generate a QR code for a given id.
     *
     */
    const generateQRCodeValidation = {
        options: {
            allowUnknownBody: false,
        },
        query: {
            id: Joi.string().required(),
        }
    };
    app.get('/:orgId/qrCode', validate(generateQRCodeValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { id } = req.query;
        const { orgId } = req.params;
        const result = yield QRCode_1.generateQRCode(orgId, id);
        if (result.type === AppProviderTypes_1.ResultType.ERROR) {
            throw new Error(result.message);
        }
        res.json(result.result);
    }));
    app.get('/:orgId/downloadQrCode', validate(generateQRCodeValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { id } = req.query;
        const { orgId } = req.params;
        const qrResult = yield QRCode_1.generateQRCode(orgId, id);
        if (qrResult.type === AppProviderTypes_1.ResultType.ERROR) {
            throw new Error(qrResult.message);
        }
        const base64Data = qrResult.result.replace(/^data:image\/png;base64,/, "");
        const file = `/tmp/qr_${id}.png`;
        yield utils_1.writeFileAsync(file, base64Data, 'base64');
        res.download(file);
    }));
    const changeUserStatusValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            status: Joi.string().valid('Approved', 'Rejected'),
        },
    };
    app.patch('/:orgId/:userId/status', validate(changeUserStatusValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { orgId, userId } = req.params;
        const { status } = req.body;
        const statusResult = yield FirebaseApi_1.default.changeUserStatus(orgId, userId, status);
        if (statusResult.type === AppProviderTypes_1.ResultType.ERROR) {
            throw new Error(statusResult.message);
        }
        res.status(204).send(true);
    }));
    /* CORS Configuration */
    const openCors = cors({ origin: '*' });
    app.use(openCors);
    /*Error Handling - must be at bottom!*/
    app.use(ErrorHandler_1.default);
    return functions.https.onRequest(app);
};
//# sourceMappingURL=admin.js.map