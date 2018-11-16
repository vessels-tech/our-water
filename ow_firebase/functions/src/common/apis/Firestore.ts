import admin from './FirebaseAdmin';

const firestore = admin.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true };
firestore.settings(settings);

export default firestore;