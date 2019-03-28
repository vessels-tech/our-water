"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
exports.admin = admin;
let firestore;
exports.firestore = firestore;
const _serviceAccountKey_1 = require("../.serviceAccountKey");
const env_1 = require("../env");
if (admin.apps.length === 0) {
    admin.initializeApp({
        //@ts-ignore
        credential: admin.credential.cert(_serviceAccountKey_1.default),
        storageBucket: env_1.storageBucket,
    });
    exports.firestore = firestore = admin.firestore();
    const settings = {};
    firestore.settings(settings);
}
const auth = admin.auth();
exports.auth = auth;
if (!firestore) {
    exports.firestore = firestore = admin.firestore();
}
const storage = admin.storage();
exports.storage = storage;
//# sourceMappingURL=FirebaseAdmin.js.map