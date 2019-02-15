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
/**
 * Firebase admin middleware
 *
 * taken from: https://github.com/firebase/functions-samples/blob/master/authorized-https-endpoint/functions/index.js
 */
const FirebaseAdmin_1 = require("./common/apis/FirebaseAdmin");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const api_1 = require("ow_common/lib/api");
const UserType_1 = require("ow_common/lib/enums/UserType");
const utils_1 = require("./common/utils");
const env_1 = require("./common/env");
// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
exports.validateFirebaseIdToken = (req, res, next) => {
    //Allow a master token to be used to get through the authentication.
    const insecureToken = utils_1.get(req, ['headers', 'insecure_token']);
    if (insecureToken && insecureToken !== env_1.temporaryAdminAccessToken) {
        console.warn("Found invalid insecure token.");
        res.status(403).send('Unauthorized');
        return;
    }
    console.log("insecure token is", insecureToken);
    if (insecureToken) {
        console.warn("Using insecure access token. This should be replaced");
        req.user = { uid: env_1.temporaryAdminUserId };
        return next();
    }
    const validateResult = getIdToken(req);
    if (validateResult.type === AppProviderTypes_1.ResultType.ERROR) {
        res.status(403).send('Unauthorized');
        return;
    }
    const idToken = validateResult.result;
    return verifyIdToken(idToken)
        .then(result => {
        if (result.type === AppProviderTypes_1.ResultType.ERROR) {
            res.status(403).send('Unauthorized');
            return;
        }
        req.user = result.result;
        console.log("user is", result.result);
        return next();
    });
};
/**
 * validateUserIsAdmin
 *
 * Middleware that looks up the user object, and ensures they are an administrator!
 * Assumes you are using with validateFirebaseIdToken to inject the user Id, otherwise
 * req.user will be null
 *
 * @param req
 * @param res
 * @param next
 */
exports.validateUserIsAdmin = (req, res, next) => {
    const userId = utils_1.get(req, ['user', 'uid']);
    if (!userId) {
        console.warn("No user found on req object. You should be using validateFirebaseIdToken middleware before this middleware.");
        res.status(403).send('Unauthorized');
        return;
    }
    console.log("req.params", req.originalUrl);
    const orgId = utils_1.unsafelyGetOrgId(req.originalUrl);
    if (!orgId) {
        console.warn("No orgId found on req.params.");
        res.status(400).send('Could not find orgId on request params');
        return;
    }
    const userApi = new api_1.UserApi(FirebaseAdmin_1.firestore, orgId);
    return getIsUserAdmin(userApi, orgId, userId)
        .then((result) => {
        if (result.type === AppProviderTypes_1.ResultType.ERROR) {
            res.status(403).send('Unauthorized');
            return;
        }
        return next();
    })
        .catch((err) => {
        res.status(403).send('Unauthorized');
        return;
    });
};
function getIsUserAdmin(userApi, orgId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userResult = yield userApi.getUser(userApi.userRef(orgId, userId));
        if (userResult.type === AppProviderTypes_1.ResultType.ERROR) {
            return AppProviderTypes_1.makeError(userResult.message);
        }
        if (userResult.result.type !== UserType_1.default.Admin) {
            return AppProviderTypes_1.makeError('User is not admin.');
        }
        return AppProviderTypes_1.makeSuccess(undefined);
    });
}
exports.getIsUserAdmin = getIsUserAdmin;
/**
 * getIdToken
 *
 * Ensures that the required token is present in the Auth header
 * or session cookie
 *
 * @returns: SuccessResult<idToken> | ErrorResult
 */
function getIdToken(req) {
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');
        return AppProviderTypes_1.makeError('No ID token found');
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }
    else {
        // No cookie
        return AppProviderTypes_1.makeError('No ID token found');
    }
    return AppProviderTypes_1.makeSuccess(idToken);
}
exports.getIdToken = getIdToken;
function verifyIdToken(token) {
    return FirebaseAdmin_1.auth.verifyIdToken(token)
        .then((decodedIdToken) => {
        console.log('ID Token correctly decoded');
        return AppProviderTypes_1.makeSuccess(decodedIdToken);
    }).catch((error) => {
        console.error('Error while verifying Firebase ID token.');
        return AppProviderTypes_1.makeError(error.message);
    });
}
exports.verifyIdToken = verifyIdToken;
//# sourceMappingURL=middleware.js.map