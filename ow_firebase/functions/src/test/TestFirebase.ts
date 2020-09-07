import * as admin from "firebase-admin";
import { Maybe, isUndefined } from "ow_common/lib/utils/Maybe";
type Firestore = admin.firestore.Firestore;

// const admin = require('firebase-admin');


/* Not in git. Download from FB console*/
const serviceAccountKeyFile = `./${process.env.service_account_key_filename}`;
console.log("service account key file", serviceAccountKeyFile)
const serviceAccount = require(serviceAccountKeyFile);

let firestore: Firestore

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: databaseUrl,
    // storageBucket: 'our-water-dev'
  });
  firestore = admin.firestore();
  const settings = { };
  firestore.settings(settings);
}

const auth = admin.auth();
if (isUndefined(firestore)) {
  firestore = admin.firestore();
}

export {
  admin,
  auth,
  firestore,
};