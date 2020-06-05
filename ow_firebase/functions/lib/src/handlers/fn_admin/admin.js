"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate = require("express-validation");
const express = require("express");
const cors = require("cors");
const ErrorHandler_1 = require("../../common/ErrorHandler");
const middleware_1 = require("../../middleware");
const utils_1 = require("../../common/utils");
const FirebaseApi_1 = require("../../common/apis/FirebaseApi");
const FirebaseAdmin_1 = require("../../common/apis/FirebaseAdmin");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const api_1 = require("ow_common/lib/api");
const UserType_1 = require("ow_common/lib/enums/UserType");
const UserStatus_1 = require("ow_common/lib/enums/UserStatus");
const bodyParser = require('body-parser');
const Joi = require('joi');
require('express-async-errors');
module.exports = (functions) => {
    const app = express();
    app.use(bodyParser.json());
    utils_1.enableLogging(app);
    app.use(middleware_1.validateFirebaseIdToken);
    app.use(middleware_1.validateUserIsAdmin);
    /**
     * @function ChangeUserStatus
     * PATCH /:orgId/:userId/status
     *
     * @description Change the user's status to either Approved or Rejected.
     *     If ther user's new status is 'Approved', and has pending resources or readings, they will be saved and deleted
     */
    const changeUserStatusValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            status: Joi.string().valid(UserStatus_1.default.Approved, UserStatus_1.default.Rejected),
        },
    };
    app.patch('/:orgId/:userId/status', validate(changeUserStatusValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { orgId, userId } = req.params;
        const { status } = req.body;
        const fbApi = new FirebaseApi_1.default(FirebaseAdmin_1.firestore);
        const userApi = new api_1.UserApi(FirebaseAdmin_1.firestore, orgId);
        //TODO: how to make sure only Admin can call this endpoint? 
        //Can we add that as a rule to the Firestore rules?
        const statusResult = yield userApi.changeUserStatus(userId, status);
        if (statusResult.type === AppProviderTypes_1.ResultType.ERROR) {
            throw new Error(statusResult.message);
        }
        if (status === "Approved") {
            const syncResult = yield fbApi.syncPendingForUser(orgId, userId);
            if (syncResult.type === AppProviderTypes_1.ResultType.ERROR) {
                throw new Error(syncResult.message);
            }
        }
        res.status(204).send("true");
    }));
    /**
     * ChangeUserType
     * PATCH /:orgId/:userId/type
     *
     * Change the user's type to either User or Admin
     */
    const changeUserTypeValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            type: Joi.string().valid(Object.keys(UserType_1.default)),
        },
    };
    app.patch('/:orgId/:userId/type', validate(changeUserTypeValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { orgId, userId } = req.params;
        const { type } = req.body;
        //TODO: how to make sure only Admin can call this endpoint? 
        //Can we add that as a rule to the Firestore rules?
        const userApi = new api_1.UserApi(FirebaseAdmin_1.firestore, orgId);
        const statusResult = yield userApi.changeUserType(userId, type);
        if (statusResult.type === AppProviderTypes_1.ResultType.ERROR) {
            throw new Error(statusResult.message);
        }
        res.status(204).send("true");
    }));
    /**
     * Bulk upload readings
     */
    const bulkUploadReadingsValidation = {
        options: { allowUnknownBody: false },
        query: { validateOnly: Joi.boolean().default(false) },
        body: {
            readings: Joi.array().min(1).required(),
        }
    };
    app.post('/:orgId/:userId/bulk_upload_readings', validate(bulkUploadReadingsValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { orgId, userId } = req.params;
        const { readings } = req.body;
        const { validateOnly } = req.query;
        const fbApi = new FirebaseApi_1.default(FirebaseAdmin_1.firestore);
        const readingApi = new api_1.ReadingApi(FirebaseAdmin_1.firestore, orgId);
        //Strip off the first row
        readings.shift();
        //Perform a reading validation, if validateOnly, then just return this result
        const validateResult = AppProviderTypes_1.unsafeUnwrap(yield fbApi.validateBulkUploadReadings(orgId, userId, readings));
        if (validateOnly) {
            return res.json(validateResult);
        }
        //Bulk upload the validated readings
        const bulkUploadResult = AppProviderTypes_1.unsafeUnwrap(yield readingApi.bulkUploadReadings(validateResult.validated, 250));
        return res.json(bulkUploadResult);
    }));
    /* CORS Configuration */
    const openCors = cors({ origin: '*' });
    app.use(openCors);
    /*Error Handling - must be at bottom!*/
    app.use(ErrorHandler_1.default);
    return functions.https.onRequest(app);
};
//# sourceMappingURL=admin.js.map