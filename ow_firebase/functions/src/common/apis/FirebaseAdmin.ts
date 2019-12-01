import * as admin from "firebase-admin";

let firestore: FirebaseFirestore.Firestore;
import serviceAccountKey from "../.serviceAccountKey";
import { storageBucket } from "../env";

if (admin.apps.length === 0) {
  admin.initializeApp({
    //@ts-ignore
    credential: admin.credential.cert(serviceAccountKey),
    storageBucket
  });
  firestore = admin.firestore();
  // const settings = { timestampsInSnapshots: true };
  const settings = {};
  // console.log("FirebaseAdmin calling firestore.settings");
  firestore.settings(settings);
}

const auth = admin.auth();
if (!firestore) {
  firestore = admin.firestore();
}

const storage = admin.storage();

export { admin, auth, firestore, storage };
