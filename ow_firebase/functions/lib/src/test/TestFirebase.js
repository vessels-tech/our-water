"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require('firebase-admin');
exports.admin = admin;
/* Not in git. Download from FB console*/
// const serviceAccount = require('./.serviceAccountKey.json');
const serviceAccountKeyFile = `./${process.env.service_account_key_filename}`;
console.log("importing service account from", serviceAccountKeyFile);
const serviceAccount = require(serviceAccountKeyFile);
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
if (!firestore) {
    exports.firestore = firestore = admin.firestore();
}
//# sourceMappingURL=TestFirebase.js.map