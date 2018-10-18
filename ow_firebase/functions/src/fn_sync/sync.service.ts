import 'mocha';
import * as sleep from 'thread-sleep';
import * as assert from 'assert';
import * as request from 'request-promise';

import { getSyncRun, createNewSync } from '../common/test/TestUtils';
import fs from '../common/apis/Firestore';

const baseUrl = process.env.BASE_URL;
const orgId = process.env.ORG_ID;
const mywellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;

describe('SyncAPI', function() {
  this.timeout(30000);

  //Objects to clean up later
  let syncIds = [];
  let syncRunIds = [];

  describe('CSV Pull', () => {
    it('creates a new csv sync, and pulls the data correctly', () => {
      let syncId = null;
      let syncRunId = null;
      let fileUrl = 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2017.xlsx%20-%20B-Well.tsv?alt=media&token=1e17d48f-5404-4f27-90f3-fb6a76a6dc45';

      const data = {
        isOneTime: false,
        datasource: {
          type: "FileDatasource",
          fileUrl,
          dataType: 'Reading',
          fileFormat: 'TSV', //ignored for now
          options: {
            includesHeadings: true,
            usesLegacyMyWellIds: true,
          }
        },
        type: "unknown",
        selectedDatatypes: [
          'reading',
        ]
      };

      const createSyncOptions = {
        method: 'POST',
        uri: `${baseUrl}/sync/${orgId}`,
        json: true,
        body: {
          data
        }
      };

      return request(createSyncOptions)
        .then(response => {
          syncId = response.data.syncId;
          syncIds.push(syncId);

          const runSyncOptions = {
            method: 'POST',
            uri: `${baseUrl}/sync/${orgId}/run/${syncId}?method=validate`
          }

          return request(runSyncOptions);
        })
        .then(response => JSON.parse(response)) //json:true only applies to posts I think 
        .then(response => {
          //TODO: we might need to wait a little while 
          sleep(10000);

          syncRunId = response.data.syncRunId;
          syncRunIds.push(syncRunId)
          return getSyncRun(orgId, fs, syncRunId);
        })
        .then(syncRun => {
          console.log('syncRun: ', syncRun);
          assert.equal(syncRun.status, 'finished');
        });

    });
  });


  describe.only('MyWell Pull', () => {
    it('creates a new legacy sync, and pulls the data correctly', () => {

      let syncId = null;
      let syncRunId = null;

      const data = {
        isOneTime: false,
        datasource: {
          type: "LegacyMyWellDatasource",
          url: mywellLegacyBaseUrl,
        },
        type: "unknown",
        selectedDatatypes: [
          'group',
          'resource',
          'reading',
        ]
      };

      const createSyncOptions = {
        method: 'POST',
        uri: `${baseUrl}/sync/${orgId}`,
        json: true,
        body: {
          data
        }
      };

      console.log("createSyncOptions", createSyncOptions);

      return request(createSyncOptions)
        .then(response => {
          syncId = response.data.syncId;
          syncIds.push(syncId);

          const runSyncOptions = {
            method: 'POST',
            uri: `${baseUrl}/sync/${orgId}/run/${syncId}?method=pullFrom`
          }

          return request(runSyncOptions);
        })
        .then(response => JSON.parse(response)) //json:true only applies to posts I think 
        .then(response => {
          //TODO: we might need to wait a little while 
          sleep(20000);

          syncRunId = response.data.syncRunId;
          syncRunIds.push(syncRunId)
          return getSyncRun(orgId, fs, syncRunId);
        })
        .then(syncRun => {
          console.log('syncRun: ', syncRun);
          assert.equal(syncRun.status, 'finished');
        });
    });
  });

  it('should create a new Sync', () => {
    const data = {
      isOneTime: false,
      datasource: {
        type: "LegacyMyWellDatasource",
        url: mywellLegacyBaseUrl,
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
      syncIds.push(response.data.syncId);
    })
    .catch(err => {
      console.log('err', err);
      return Promise.reject(err);
    });
  });

  it('should create and run the sync', () => {
    let syncRunId = null;
    return createNewSync()
    .then(syncId => {
      syncIds.push(syncId);

      const options = {
        method: 'POST',
        uri: `${baseUrl}/sync/${orgId}/run/${syncId}?method=pullFrom`
      };
      
      return request(options);
    })
    .then(response => JSON.parse(response)) //json:true only applies to posts I think 
    .then(response => {
      syncRunIds.push(response.data.syncRunId);
      syncRunId = response.data.syncRunId;
    })
    //Wait for the sync to finish
    .then(() => sleep(20000))
    .then(() => getSyncRun(orgId, fs, syncRunId))
    .then(syncRun => {
      console.log("syncRun is:", syncRun);
      assert.equal(syncRun.status, 'finished');
    })
  });;

  // Cleanup all created resources
  after(function() {
    if (process.env.SKIP_CLEANUP === 'true') {
      console.log("      Skipping Cleanup, as SKIP_CLEANUP is true");
      console.log(`        orgId is: ${orgId}`);
      return;
    }

    console.log("     Clean Up:");
    console.log(`       Deleting document org/${orgId}`);
    return fs.collection('org').doc(orgId).delete();

    // console.log(`      cleaning up ${syncIds.length} syncs`);
    // syncIds.forEach(syncId => {
    //   return fs.collection('org').doc(orgId).collection('sync').doc(syncId)
    //     .delete();
    // });

    // console.log(`      cleaning up ${syncRunIds.length} syncRuns`);
    // syncRunIds.forEach(syncRunId => {
    //   return fs.collection('org').doc(orgId).collection('syncRun').doc(syncRunId)
    //     .delete();
    // });
  });
});