"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
exports.admin = admin;
const Maybe_1 = require("ow_common/lib/utils/Maybe");
// const admin = require('firebase-admin');
/* Not in git. Download from FB console*/
const serviceAccountKeyFile = `./${process.env.service_account_key_filename}`;
const serviceAccount = require(serviceAccountKeyFile);
let firestore;
exports.firestore = firestore;
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    exports.firestore = firestore = admin.firestore();
    // const settings = { timestampsInSnapshots: true };
    const settings = {};
    console.log("TestFirebase calling firestore.settings");
    firestore.settings(settings);
}
const auth = admin.auth();
exports.auth = auth;
if (Maybe_1.isUndefined(firestore)) {
    exports.firestore = firestore = admin.firestore();
}
//# sourceMappingURL=TestFirebase.js.map