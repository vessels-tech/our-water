"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const FirebaseAdmin_1 = require("./common/apis/FirebaseAdmin");
// const admin = require('firebase-admin');
// admin.initializeApp();
/**
 * This file works better in JS,
 * When it is in TS, it gets compiled to JS and this breaks
 * the imports for firebase functions
 */
const functionName = process.env.FUNCTION_NAME;
console.log("init for function", functionName);
//Org Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'org') {
    exports.org = require('./handlers/fn_org/org')(functions);
}
//Group Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'group') {
    exports.group = require('./handlers/fn_group/group')(functions);
}
//Resource Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'resource') {
    exports.resource = require('./handlers/fn_resource/resource')(functions);
}
//Reading Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'reading') {
    exports.reading = require('./handlers/fn_reading/reading')(functions);
}
//Sync Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'sync') {
    exports.sync = require('./handlers/fn_sync/sync')(functions);
}
//ShortId Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'shortId') {
    exports.shortId = require('./handlers/fn_shortId/shortId')(functions);
}
//Admin Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'admin') {
    exports.admin = require('./handlers/fn_admin/admin')(functions);
}
//Cron Api
_a = require('./handlers/fn_cron/cron'), exports.hourly_job = _a.hourly_job, exports.daily_job = _a.daily_job, exports.weekly_job = _a.weekly_job;
/**
 * userAccountDefaults
 *
 * When a user account is first created, set the defaults:
 * - status: "Unapproved"
 *
 * //TD: how to define for only some environments?
 * //For now, this is mywell only.
 *
 * //TD: Use the properly defined types here.
 */
exports.userAccountDefaults = functions.firestore
    .document('org/mywell/user/{userId}')
    .onCreate((snapshot, context) => {
    const { userId } = context.params;
    console.log("user id is", userId);
    const userDoc = FirebaseAdmin_1.firestore.collection('org').doc('mywell').collection('user').doc(userId);
    return userDoc.set({ status: 'Unapproved' }, { merge: true });
});
var _a;
// const fs = admin.firestore();
// fs.settings({timestampsInSnapshots: true});
//TODO: move these functions to new doc
//TODO: REENABLE
/**
 * Add metadata to readings when created
 */
// export const copyResourceFields = functions.firestore
//   .document('org/{orgId}/{reading}/{readingId}')
//   .onCreate((snapshot, context) => {
//     //Get the corresponding resource
//     const {orgId, readingId} = context.params;
//     const newReading = snapshot.data();
//     const resourceId = newReading.resourceId;
//     return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).get()
//     .then(doc => {
//       const data = doc.data();
//       return {
//         //TODO: double check format
//         coords: data.coords,
//         groups: data.groups,
//       };
//     })
//     .then(readingMetadata => fs.collection('org').doc(orgId)
//                                .collection('reading').doc(readingId).update(readingMetadata))
//     .then(() => console.log(`added metadata to /org/${orgId}/reading/${readingId}`))
//   });
/**
 * Update the last value on resource when there is a new reading
 *
 * when doing bulk uploads, add a field: `isLegacy:true` to the readings, which will bypass this function
 */
// export const updateLastValue = functions.firestore
// .document('org/{orgId}/{reading}/{readingId}')
// .onCreate((snapshot, context) => {
//   //Get the corresponding resource
//   const { orgId, readingId } = context.params;
//   const newReading = snapshot.data();
//   const { resourceId } = newReading;
//   //If this reading is a legacyReading, then don't update
//   if (newReading.isLegacy === true) {
//     console.log("reading marked as legacy reading. Not updating");
//     return;
//   }
//   return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).get()
//     .then(doc => {
//       const res = doc.data();
//       if (res.lastReadingDatetime 
//         && res.lastReadingDatetime > newReading.datetime) {
//         console.log(`newer reading for /org/${orgId}/resource/${resourceId} already exists`);
//         return true;
//       }
//       const latestReadingMetadata = {
//         lastReadingDatetime: newReading.datetime,
//         lastValue: newReading.value,
//       };
//       return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).update(latestReadingMetadata);
//     });
// });
/*

  TODO: watches for syncs?
*/
/*

TODO: watches for SyncRuns:

- when a SyncRun changes state to success, update the Sync lastRunDate
- when a SyncRun changes state to failed, send error to subscribers

*/
//TODO: on creation of a resource, send an email or sms
//These aren't so pressing...
//TODO: change group name, propagate to all resources and readings
//TODO: add or remove group from resource, propagate to existing readings 
//# sourceMappingURL=index.js.map