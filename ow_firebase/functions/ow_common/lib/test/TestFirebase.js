"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
const Maybe_1 = require("../utils/Maybe");
// const admin = require('firebase-admin');
/* Not in git. Download from FB console*/
const serviceAccount = require('./.serviceAccountKey.json');
let firestore;
exports.firestore = firestore;
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    exports.firestore = firestore = admin.firestore();
    const settings = { timestampsInSnapshots: true };
    console.log("TestFirebase calling firestore.settings");
    firestore.settings(settings);
}
const auth = admin.auth();
exports.auth = auth;
if (Maybe_1.isUndefined(firestore)) {
    exports.firestore = firestore = admin.firestore();
}
