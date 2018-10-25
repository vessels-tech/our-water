"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.weekly_job = exports.daily_job = exports.hourly_job = exports.sync = exports.reading = exports.resource = exports.group = exports.org = void 0;

var functions = _interopRequireWildcard(require("firebase-functions"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var admin = require('firebase-admin');

admin.initializeApp(); // /*
// const firestore = new Firestore();
// const settings = {/* your settings... */ timestampsInSnapshots: true };
// firestore.settings(settings)
// */
//Org Api

var org = require('./fn_org/org')(functions, admin); //Group Api


exports.org = org;

var group = require('./fn_group/group')(functions, admin); //Resource Api


exports.group = group;

var resource = require('./fn_resource/resource')(functions, admin); //Reading Api


exports.resource = resource;

var reading = require('./fn_reading/reading')(functions, admin); //Sync Api


exports.reading = reading;

var sync = require('./fn_sync/sync')(functions, admin); //Cron Api


exports.sync = sync;

var _require = require('./fn_cron/cron'),
    hourly_job = _require.hourly_job,
    daily_job = _require.daily_job,
    weekly_job = _require.weekly_job;

exports.weekly_job = weekly_job;
exports.daily_job = daily_job;
exports.hourly_job = hourly_job;
var fs = admin.firestore();
fs.settings({
  timestampsInSnapshots: true
}); //TODO: move these functions to new doc
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