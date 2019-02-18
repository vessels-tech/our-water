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
const QRCode_1 = require("../../common/apis/QRCode");
const utils_1 = require("../../common/utils");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin');
require('express-async-errors');
module.exports = (functions) => {
    const app = express();
    app.use(bodyParser.json());
    utils_1.enableLogging(app);
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
    /* CORS Configuration */
    const openCors = cors({ origin: '*' });
    app.use(openCors);
    /*Error Handling - must be at bottom!*/
    app.use(ErrorHandler_1.default);
    return functions.https.onRequest(app);
};
//# sourceMappingURL=public.js.map