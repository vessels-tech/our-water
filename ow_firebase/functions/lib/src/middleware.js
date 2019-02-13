"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Firebase admin middleware
 *
 * taken from: https://github.com/firebase/functions-samples/blob/master/authorized-https-endpoint/functions/index.js
 */
const FirebaseAdmin_1 = require("./common/apis/FirebaseAdmin");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
exports.validateFirebaseIdToken = (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');
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
 * @param req
 * @param res
 * @param next
 */
exports.validateUserIsAdmin = (req, res, next) => {
    //TODO: implement!
};
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