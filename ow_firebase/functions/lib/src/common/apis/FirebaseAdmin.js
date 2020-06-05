"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestore = exports.auth = exports.admin = void 0;
const admin = require("firebase-admin");
exports.admin = admin;
let firestore;
exports.firestore = firestore;
if (admin.apps.length === 0) {
    admin.initializeApp();
    exports.firestore = firestore = admin.firestore();
    // const settings = { timestampsInSnapshots: true };
    const settings = {};
    // console.log("FirebaseAdmin calling firestore.settings");
    firestore.settings(settings);
}
const auth = admin.auth();
exports.auth = auth;
if (!firestore) {
    exports.firestore = firestore = admin.firestore();
}
//# sourceMappingURL=FirebaseAdmin.js.map