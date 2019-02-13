import * as admin from "firebase-admin";
import { Maybe, isUndefined } from "ow_common/lib/utils/Maybe";
type Firestore = admin.firestore.Firestore;

// const admin = require('firebase-admin');


/* Not in git. Download from FB console*/
const serviceAccountKeyFile = `./${process.env.service_account_key_filename}`;
const serviceAccount = require(serviceAccountKeyFile);

let firestore: Firestore

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: databaseUrl,
    // storageBucket,
  });
  firestore = admin.firestore();
  const settings = { timestampsInSnapshots: true };
  console.log("TestFirebase calling firestore.settings");
  firestore.settings(settings);
}

const auth = admin.auth();
if (isUndefined(firestore)) {
  firestore = admin.firestore();
}

// const myExports: {
//   admin: any
//   auth: any
//   firestore: Firestore,
// } = {
//   admin,
//   auth,
//   firestore
// }

// export default myExports;

export {
  admin,
  auth,
  firestore
};