import * as admin from 'firebase-admin';

let firestore;
import serviceAccountKey from '../.serviceAccountKey';
import { storageBucket } from '../env';


if (admin.apps.length === 0) {
  admin.initializeApp({
    //@ts-ignore
    credential: admin.credential.cert(serviceAccountKey),
    storageBucket,
  });
  firestore = admin.firestore();
  const settings = { };
  firestore.settings(settings);
}

const auth = admin.auth();
if (!firestore) {
  firestore = admin.firestore();
}

const storage = admin.storage();

export {
  admin,
  auth,
  firestore,
  storage,
}