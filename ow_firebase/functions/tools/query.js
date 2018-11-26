#!/usr/bin/env node

const admin = require('firebase-admin');
const request = require('request-promise-native');

/* Not in git. Download from FB console*/
const serviceAccount = require('../../.serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: databaseUrl,
    // storageBucket,
  });
}

const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

const auth = admin.auth();


firestore.collection('org').doc('mywell').collection('reading')
  // .where('resourceId', '==', 'wNsDkCkwvfgyiPk5Zu5Q')
  // .where('timeseriesId', '==', 'default')
  .where('resourceType', '==', 'checkdam')
  .limit(10)
  .get()
.then(sn => {
  console.log(sn.docs.map(doc => doc.data()));
})

// firestore.collection('org').doc('mywell').collection('reading').get(sn => console.log(sn.size));