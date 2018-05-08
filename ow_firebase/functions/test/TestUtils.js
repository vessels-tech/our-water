const request = require('request-promise-native');
const Group = require('../lib/common/models/Group');

const baseUrl = process.env.BASE_URL;
const orgId = process.env.ORG_ID;

const createNewSync = () => {
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
      return response.syncId;
    })
    .catch(err => {
      console.log('err', err);
      return Promise.reject(err);
    });
};

const getSyncRun = ({orgId, fs, syncRunId}) => {
  return fs.collection('org').doc(orgId).collection('syncRun').doc(syncRunId).get()
    .then(sn => sn.data());
}

module.exports = {
  createNewSync,
  getSyncRun,
}
