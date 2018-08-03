
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

/**
 * Creates a new Sync between OurWater and MyWell
 */
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

/**
 * Runs the sync of a given id
 */
const runSync = (syncId, method) => {
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

const getResources = () => {
  const options = {
    method: 'GET',
    json: true,
    uri: `${baseUrl}/resource/${orgId}`,
  };

  return request(options);
}

/**
 * Insert readings into our water
 */
const insertReadings = (resourceId) => {
  const options = {
    method: 'POST',
    json: true,
    uri: `${baseUrl}/reading/${orgId}/${resourceId}/reading`,
    body: {
      data: {
        datetime: "2018-04-28T09:40:38.460Z",
        value: "123",
      }
    }
  };

  return request(options);
}


let syncId;

return createSync()
.then(_syncId => {
  syncId = _syncId;
  console.log("createdSync with id:", syncId);
  return runSync(syncId, 'pullFrom');
})
.then(syncRunId => {
  console.log("hopefully finished running sync with id:", syncRunId);
})
.then(() => getResources())
.then(res => {
  console.log("getResources found: ", res.length);
  console.log('Creating new reading for resource:', res[0]);
  return res[0].id;
})
.then(resourceId => insertReadings(resourceId))
.then(() => {
  console.log("saved reading");
  console.log("running pushTo sync");
})
.then(() => runSync(syncId, 'pushTo'));