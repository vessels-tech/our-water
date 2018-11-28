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
// const admin = require('firebase-admin');
const request = require('request-promise-native');
// /* Not in git. Download from FB console*/
// const serviceAccount = require('../../.serviceAccountKey.json');
// if (admin.apps.length === 0) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     // databaseURL: databaseUrl,
//     // storageBucket,
//   });
//   const firestore = admin.firestore();
//   const settings = { timestampsInSnapshots: true };
//   firestore.settings(settings);
// }
// const auth = admin.auth();
function getToken(admin) {
    return __awaiter(this, void 0, void 0, function* () {
        return admin.auth().createCustomToken('12345')
            .then(function (customToken) {
            const options = {
                json: true,
                url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${process.env.WEB_API_KEY}`,
                method: 'POST',
                body: {
                    token: customToken,
                    returnSecureToken: true
                },
            };
            return request(options);
        })
            .then(response => {
            return response.idToken;
        })
            .catch(function (error) {
            console.log("Error creating custom token:", error);
        });
    });
}
exports.getToken = getToken;
function getAuthHeader(admin) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield getToken(admin);
        return {
            Authorization: `Bearer ${token}`
        };
    });
}
exports.getAuthHeader = getAuthHeader;
//# sourceMappingURL=index.js.map