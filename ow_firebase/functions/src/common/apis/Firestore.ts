const admin = require('firebase-admin');
if (admin.apps.length === 0) {
  admin.initializeApp();
}


export default admin.firestore();