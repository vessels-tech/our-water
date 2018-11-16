"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require('firebase-admin');
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.default = admin;
//# sourceMappingURL=FirebaseAdmin.js.map