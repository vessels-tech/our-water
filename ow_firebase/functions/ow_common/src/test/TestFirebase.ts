import * as admin from "firebase-admin";
// import { Maybe, isUndefined } from "../utils/Maybe";
type Firestore = admin.firestore.Firestore;

// const admin = require('firebase-admin');


/* Not in git. Download from FB console*/
const serviceAccount = require('./.serviceAccountKey.json');

let firestore: Firestore;

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: databaseUrl,
    // storageBucket,
  });
  firestore = admin.firestore();
  const settings = {};
  console.log("TestFirebase calling firestore.settings");
  firestore.settings(settings);
}

const auth = admin.auth();
// if (isUndefined(firestore)) {
//   firestore = admin.firestore();
// }

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