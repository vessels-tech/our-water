
const admin = require('firebase-admin');
admin.initializeApp(); //Don't know why this stopped working
const fs = admin.firestore();

const SyncTest = require('./SyncTest')({fs: fs});
const MiscTest = require('./MiscTest')({fs: fs});

