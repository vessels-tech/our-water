import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


export const test = functions.https.onRequest((request, response) => {

  console.log("registering org");

  response.send("registered org: 1234");
});

const admin = require('firebase-admin');
admin.initializeApp();

//Org Api
export const org = require('./fn_org/org')(functions, admin);

//Group Api
export const group = require('./fn_group/group')(functions, admin);

//Resource Api
export const resource = require('./fn_resource/resource')(functions, admin);

//Reading Api
export const reading = require('./fn_reading/reading')(functions, admin);