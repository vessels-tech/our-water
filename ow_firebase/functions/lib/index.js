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
// export const createUser = functions.firestore
//   .document('users/{userId}')
//   .onCreate((snap, context) => {
//     // Get an object representing the document
//     // e.g. {'name': 'Marie', 'age': 66}
//     const newValue = snap.data();
//     // access a particular field as you would any JS property
//     const name = newValue.name;
//     // perform desired operations ...
//   });
//TODO: move these functions to new doc
const fs = admin.firestore();
/**
 * Add metadata to readings when created
 */
exports.copyResourceFields = functions.firestore
    .document('org/{orgId}/{reading}/{readingId}')
    .onCreate((snapshot, context) => {
    //Get the corresponding resource
    const { orgId, readingId } = context.params;
    const newReading = snapshot.data();
    const resourceId = newReading.resourceId;
    return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).get()
        .then(doc => {
        const data = doc.data();
        return {
            //TODO: double check format
            coords: data.coords,
            groups: data.groups,
        };
    })
        .then(readingMetadata => fs.collection('org').doc(orgId)
        .collection('reading').doc(readingId).update(readingMetadata))
        .then(() => console.log(`added metadata to /org/${orgId}/reading/${readingId}`));
});
/**
 * Update the last value on resource when there is a new reading
 *
 * when doing bulk uploads, add a field: `isLegacy:true` to the readings, which will bypass this function
 */
exports.updateLastValue = functions.firestore
    .document('org/{orgId}/{reading}/{readingId}')
    .onCreate((snapshot, context) => {
    //Get the corresponding resource
    const { orgId, resourceId, readingId } = context.params;
    const newReading = snapshot.data();
    //If this reading is a legacyReading, then don't update
    if (newReading.isLegacy === true) {
        console.log("reading marked as legacy reading. Not updating");
        return;
    }
    return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).get()
        .then(doc => {
        const res = doc.data();
        if (res.lastReadingDatetime
            && res.lastReadingDatetime > newReading.datetime) {
            console.log(`newer reading for /org/${orgId}/resource/${resourceId} already exists`);
            return true;
        }
        const latestReadingMetadata = {
            lastReadingDatetime: newReading.datetime,
            lastValue: newReading.value,
        };
        return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).update(latestReadingMetadata);
    });
});
//TODO: on creation of a resource, send an email or sms
//These aren't so pressing...
//TODO: change group name, propagate to all resources and readings
//TODO: add or remove group from resource, propagate to existing readings
//# sourceMappingURL=index.js.map