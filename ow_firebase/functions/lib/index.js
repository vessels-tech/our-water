"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.test = functions.https.onRequest((request, response) => {
    console.log("registering org");
    response.send("registered org: 1234");
});
const admin = require('firebase-admin');
admin.initializeApp();
//Org Api
exports.org = require('./fn_org/org')(functions, admin);
//Group Api
exports.group = require('./fn_group/group')(functions, admin);
//Resource Api
exports.resource = require('./fn_resource/resource')(functions, admin);
//Reading Api
exports.reading = require('./fn_reading/reading')(functions, admin);
//# sourceMappingURL=index.js.map