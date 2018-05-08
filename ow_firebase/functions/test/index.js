
const admin = require('firebase-admin');
admin.initializeApp();
const fs = admin.firestore();

const SyncTest = require('./SyncTest')({fs: fs});
const MiscTest = require('./MiscTest')({fs: fs});

