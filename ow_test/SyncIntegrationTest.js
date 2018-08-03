
/**
 * SyncIntegrationTest
 * 
 * 
 */
const assert = require('assert');
const request = require('request-promise-native');
const sleep = require('thread-sleep');

const baseUrl = process.env.BASE_URL;
const orgId = process.env.ORG_ID;
const mywellLegacyAccessToken = process.env.MYWELL_LEGACY_ACCESS_TOKEN;
const mywellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;

//Create a new sync
//Run the sync, to get Resources from LegacyMyWell
//Create a new reading in OurWater
//Run the sync again

const createSync = () => {
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

  return request(createSyncOptions)
  .then(response => {
    return response.data.syncId;
  });
};

    //   const runSyncOptions = {
    //     method: 'POST',
    //     uri: `${baseUrl}/sync/${orgId}/run/${syncId}?method=pullFrom`
    //   }

    //   return request(runSyncOptions);
    // })
    // .then(response => JSON.parse(response)) //json:true only applies to posts I think 
    // .then(response => {
    //   //TODO: we might need to wait a little while 
    //   sleep(20000);

    //   syncRunId = response.data.syncRunId;
    //   syncRunIds.push(syncRunId)
    //   return getSyncRun({ orgId, fs, syncRunId });
    // })
    // .then(syncRun => {
    //   console.log('syncRun: ', syncRun);
    //   assert.equal(syncRun.status, 'finished');
    // });

const runSync = (syncId) => {
  const runSyncOptions = {
    method: 'POST',
    uri: `${baseUrl}/sync/${orgId}/run/${syncId}?method=pullFrom`
  };

  return request(runSyncOptions)
  .then(response => JSON.parse(response)) //json:true only applies to posts I think 
  .then(response => {
    //we might need to wait a little while, we should probably poll instead
    sleep(20000);
    return response.data.syncRunId;
  });
}

/**
 * Insert readings into our water
 */
const insertReadings = () => {

}



// return createSync()
// .then(syncId => {
//   console.log("createdSync with id:", syncId);
//   return runSync(syncId);
// })
// .then(syncRunId => {
//   console.log("hopefully finished running sync with id:", syncRunId);
// })

return insertReadings();