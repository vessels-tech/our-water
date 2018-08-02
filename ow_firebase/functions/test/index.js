
const admin = require('firebase-admin');
admin.initializeApp();
const fs = admin.firestore();

/**
 * Using the real Firestore API
 * TODO: rename these to be integration tests
 */
const SyncTest = require('./SyncTest')({fs});
const MiscTest = require('./MiscTest')({fs});


/**
 * Using the mock Firestore API
 */
const LegacyMyWellDatasoureTest = require('./common/models/Datasources/LegacyMyWellDatasourceTest')({fs});
