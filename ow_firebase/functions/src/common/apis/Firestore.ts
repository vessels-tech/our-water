const admin = require('firebase-admin');
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true };
firestore.settings(settings);

export default firestore;