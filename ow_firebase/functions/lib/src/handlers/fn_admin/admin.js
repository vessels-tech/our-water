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
const middleware_1 = require("../../middleware");
const FirebaseApi_1 = require("../../common/apis/FirebaseApi");
const FirebaseAdmin_1 = require("../../common/apis/FirebaseAdmin");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const api_1 = require("ow_common/lib/api");
const UserType_1 = require("ow_common/lib/enums/UserType");
const UserStatus_1 = require("ow_common/lib/enums/UserStatus");
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
    app.use(middleware_1.validateFirebaseIdToken);
    app.use(middleware_1.validateUserIsAdmin);
    /**
     * ChangeUserStatus
     * PATCH /:orgId/:userId/status
     *
     * Change the user's status to either Approved or Rejected.
     * If ther user's new status is 'Approved', and has pending resources or readings, they will be saved and deleted
     */
    const changeUserStatusValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            status: Joi.string().valid(UserStatus_1.default.Approved, UserStatus_1.default.Rejected),
        },
    };
    app.patch('/:orgId/:userId/status', validate(changeUserStatusValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
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
    //       status: Joi.string().valid(UserStatus.Approved, UserStatus.Rejected),
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
    app.patch('/:orgId/:userId/type', validate(changeUserTypeValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
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
    /* CORS Configuration */
    const openCors = cors({ origin: '*' });
    app.use(openCors);
    /*Error Handling - must be at bottom!*/
    app.use(ErrorHandler_1.default);
    return functions.https.onRequest(app);
};
//# sourceMappingURL=admin.js.map