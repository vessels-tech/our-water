import * as functions from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { UserBuilder } from 'firebase-functions/lib/providers/auth';
import { firestore } from './common/apis/FirebaseAdmin';
import UserType from 'ow_common/lib/enums/UserType';
import UserStatus from 'ow_common/lib/enums/UserStatus';
import EmailApi from './common/apis/EmailApi';

// const admin = require('firebase-admin');
// admin.initializeApp();

/**
 * This file works better in JS,
 * When it is in TS, it gets compiled to JS and this breaks
 * the imports for firebase functions
 */
const functionName = process.env.FUNCTION_NAME;
console.log('init for function', functionName);

//Admin Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'admin') {
  exports.admin = require('./handlers/fn_admin/admin')(functions);
}

//Cron Api
export const {
  hourly_job,
  daily_job,
  weekly_job
} = require('./handlers/fn_cron/cron');

//Group Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'group') {
  exports.group = require('./handlers/fn_group/group')(functions);
}

//Org Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'org') {
  exports.org = require('./handlers/fn_org/org')(functions);
}

//Public Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'public') {
  exports.org = require('./handlers/fn_public/public')(functions);
}

//Reading Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'reading') {
  exports.reading = require('./handlers/fn_reading/reading')(functions);
}

//Resource Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'resource') {
  exports.resource = require('./handlers/fn_resource/resource')(functions);
}

//ShortId Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'shortId') {
  exports.shortId = require('./handlers/fn_shortId/shortId')(functions);
}

//Sync Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'sync') {
  exports.sync = require('./handlers/fn_sync/sync')(functions);
}

//Public Api
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'public') {
  exports.public = require('./handlers/fn_public/public')(functions);
}

/**
 * userAccountDefaults
 *
 * When a user account is first created, set the defaults:
 * - status: "Unapproved"
 * - type: "User"
 *
 * //TD: how to define for only some environments?
 * //For now, this is mywell only.
 *
 * //TD: Use the properly defined types here.
 */
export const userAccountDefaults = functions.firestore
  .document('org/mywell/user/{userId}')
  .onCreate((snapshot, context) => {
    const { userId } = context.params;
    console.log('user id is', userId);
    const userDoc = firestore
      .collection('org')
      .doc('mywell')
      .collection('user')
      .doc(userId);
    return userDoc.set(
      {
        status: UserStatus.Unapproved,
        type: UserType.User
      },
      { merge: true }
    );
  });

exports.testOnCreateDocument = functions.https.onRequest(async (req, res) => {
  firestore
    .collection('org')
    .doc('mywell')
    .collection('user')
    .add({ User: 'kevin-test' });
  res.json({ status: 'ok' });
});

/**
 * @function userRecordUpdated
 *
 * @description If a user is updated, check a number of fields to see if the user has fully signed in for the first time
 *   If they have, add them to a list of users to the email digest
 */
// TODO: manual test!
// #MARK - #2103 KEVIN
// Email Notifications
// - Add an email alert to info@marvi.org.in email address when a new account is created
// - Email should include basic information about the user so we can contact them if needed, and easily find them in the Admin system
export const userRecordUpdated = functions.firestore
  .document('org/mywell/user/{userId}')
  .onUpdate(async (change, context) => {
    const { userId } = context.params;
    const newValue = change.after.data();
    const oldValue = change.before.data();

    /* If they already had a name, or didn't add a name we can ignore it*/
    if (oldValue.name || !newValue.name) {
      return;
    }

    const email = await EmailApi.sendUserSignupEmail('kevindoveton@me.com', {name: 'kevin', email: 'kevin@ME.COM'});

    const metadataDoc = firestore.collection('org').doc('mywell');
    /* add as a dict to allow for nice merging */
    return metadataDoc.set(
      {
        metadata: {
          newSignUps: {
            [userId]: true
          }
        }
      },
      {
        merge: true
      }
    );
  });

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
