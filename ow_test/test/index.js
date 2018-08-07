
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
// const LegacyMyWellDatasoureTest = require('./common/models/Datasources/LegacyMyWellDatasourceTest')({fs});
// const ResourceIdTypeTest = require('./common/models/types/ResourceIdTypeTest')();


/**
 * Note for future lewis
 * 
 * I moved the Misc, Org, and Sync tests here as they were more like
 * integration than unit tests. (calling apis, refering to the real firebase)
 * 
 * What we need to do next:
 * - modify the ReadingsIntegrationTest and SyncIntegrationTests to use mocha
 * - change these also to typescript, to make things easier!
 */