const assert = require('assert');
const request = require('request-promise-native');
const admin = require('firebase-admin');
admin.initializeApp();
const fs = admin.firestore();

const { createNewSync } = require('./TestUtils');

const baseUrl = process.env.BASE_URL;
const orgId = process.env.ORG_ID;

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});


describe('SyncAPI', function () {
  this.timeout(5000);

  //Objects to clean up later
  let syncIds = [];
  let syncRunIds = [];

  it('should create a new Sync', () => {

    const data = {
      isOneTime: false,
      datasource: {
        type: "LegacyMyWellDatasource",
        url: "https://mywell-server.vessels.tech",
      },
      type: "unknown",
      selectedDatatypes: [
        'group',
        'resource',
        'reading',
      ]
    };

    const options = {
      method: 'POST',
      uri: `${baseUrl}/sync/${orgId}`,
      json: true,
      body: {
        data
      }
    };

    return request(options)
    .then(response => {
      syncIds.push(response.syncId);
    })
    .catch(err => {
      console.log('err', err);
      return Promise.reject(err);
    });
  });

  it('should create and run the sync', () => {

    return createNewSync()
    .then(syncId => {
      syncIds.push(syncId);

      const options = {
        method: 'GET',
        uri: `${baseUrl}/sync/${orgId}/run/${syncId}?method=validate`
      };
      
      return request(options);
    })
    .then(response => {
      syncRunIds.push(response.syncRunId);
    });
  });



  //Cleanup all created resources
  after(function() {
    console.log(`     cleaning up ${syncIds.length} syncs`);
    syncIds.forEach(syncId => {
      return fs.collection('org').doc(orgId).collection('sync').doc(syncId)
        .delete();
    });

    console.log(`     cleaning up ${syncRunIds.length} syncRuns`);
    syncRunIds.forEach(syncRunId => {
      return fs.collection('org').doc(orgId).collection('syncRun').doc(syncRunId)
        .delete();
    });
  
  });
});
