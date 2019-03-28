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
const api_1 = require("ow_common/lib/api");
const moment = require("moment");
const FirebaseAdmin_1 = require("../../common/apis/FirebaseAdmin");
const FirebaseApi_1 = require("../../common/apis/FirebaseApi");
const bodyParser = require('body-parser');
const Joi = require('joi');
const fs = require('fs');
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
        const fbApi = new FirebaseApi_1.default(FirebaseAdmin_1.firestore);
        const shortId = AppProviderTypes_1.unsafeUnwrap(yield fbApi.createShortId(orgId, id));
        const buffer = AppProviderTypes_1.unsafeUnwrap(yield QRCode_1.getWholeQR(orgId, shortId.shortId, id));
        res.json(buffer.toString('base64'));
    }));
    app.get('/:orgId/downloadQrCode', validate(generateQRCodeValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { id } = req.query;
        const { orgId } = req.params;
        const fbApi = new FirebaseApi_1.default(FirebaseAdmin_1.firestore);
        const shortId = AppProviderTypes_1.unsafeUnwrap(yield fbApi.createShortId(orgId, id));
        const buffer = AppProviderTypes_1.unsafeUnwrap(yield QRCode_1.getWholeQR(orgId, shortId.shortId, id));
        const file = `/tmp/qr_${id}.png`;
        fs.writeFileSync(file, buffer);
        res.download(file);
    }));
    /**
     * Download Readings for Resources
     * GET /:orgId/downloadReadings
     *
     * eg: /test_12348/downloadReadings?resourceIds=00001%2C00002%2C00003
     *
     * Download a list of readings for a given resource.
     * resourceIds must be a comma separated list of resourceIds
     */
    const getReadingsValidation = {
        options: {
            allowUnknownBody: false,
        },
        query: {
            resourceIds: Joi.string().required(),
        }
    };
    app.get('/:orgId/downloadReadings', validate(getReadingsValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { resourceIds } = req.query;
        const { orgId } = req.params;
        const readingApi = new api_1.ReadingApi(FirebaseAdmin_1.firestore, orgId);
        resourceIds = resourceIds.split(',');
        if (resourceIds.length > 50) {
            throw new Error("Too many resourceIds. Max is 50");
        }
        const readings = AppProviderTypes_1.unsafeUnwrap(yield readingApi.getReadingsForResources(resourceIds, { limit: 100 }));
        if (readings.readings.length === 0) {
            const error = new Error(`No readings found for ids: ${resourceIds}`);
            return res.status(404).send(error);
        }
        const readingsData = api_1.ExportApi.readingsToExport(readings.readings, api_1.ExportFormat.CSV);
        const file = `/tmp/${moment().toISOString()}.csv`;
        yield utils_1.writeFileAsync(file, readingsData, 'utf-8');
        res.download(file);
    }));
    /**
     * Download Readings images for a single resource
     * GET /:orgId/downloadReadingImages
     *
     * eg: /test_12348/downloadReadings?resourceIds=00001
     *
     * Download a list of readings for a given resource.
     * resourceIds must be a comma separated list of resourceIds
     */
    const getReadingImagesValidation = {
        options: {
            allowUnknownBody: false,
        },
        query: {
            resourceId: Joi.string().required(),
        }
    };
    app.get('/:orgId/downloadReadingImages', validate(getReadingImagesValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { resourceId } = req.query;
        const { orgId } = req.params;
        const readingApi = new api_1.ReadingApi(FirebaseAdmin_1.firestore, orgId);
        resourceId = resourceId.split(',');
        if (resourceId.length > 1) {
            const error = new Error("Can only download reading images for one resource at a time");
            return res.status(400).send(error);
        }
        const momentUnix = moment().unix();
        const dirName = `/tmp/${resourceId[0]}_${momentUnix}`;
        const archiveName = `/tmp/${resourceId[0]}_${momentUnix}.zip`;
        const readings = AppProviderTypes_1.unsafeUnwrap(yield readingApi.getReadingsForResources(resourceId, { limit: 200 }));
        if (readings.readings.length === 0) {
            const error = new Error(`No readings found for ids: ${resourceId}`);
            return res.status(404).send(error);
        }
        //TODO: get a zip file containing all images 
        const readingImagesBase64 = api_1.ExportApi.exportReadingImages(readings.readings);
        if (readingImagesBase64.length === 0) {
            const error = new Error(`No images found for readings for resourceId: ${resourceId}`);
            return res.status(404).send(error);
        }
        //Create the dir
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
        }
        //Write each image to a file
        yield readingImagesBase64.reduce((acc, curr) => __awaiter(this, void 0, void 0, function* () {
            yield acc;
            const file = `${dirName}/${curr.id}.png`;
            //TODO: figure out how to save a png
            return utils_1.writeFileAsync(file, curr.base64, 'base64');
        }), Promise.resolve({}));
        //Archive the folder
        yield utils_1.zipFolderAsync(dirName, archiveName);
        res.download(archiveName);
    }));
    /**
     * getReadingImage
     *
     * View a reading image for a given readingId. Returns a simple webpage
     *
     */
    app.get('/:orgId/image/:readingId', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { orgId, readingId } = req.params;
        const readingApi = new api_1.ReadingApi(FirebaseAdmin_1.firestore, orgId);
        const readingImage = AppProviderTypes_1.unsafeUnwrap(yield readingApi.getReadingImage(readingId));
        res.send(`<img width="300" src="data:image/png;base64, ${readingImage}"/>`);
    }));
    /* CORS Configuration */
    const openCors = cors({ origin: '*' });
    app.use(openCors);
    /*Error Handling - must be at bottom!*/
    app.use(ErrorHandler_1.default);
    return functions.https.onRequest(app);
};
//# sourceMappingURL=public.js.map