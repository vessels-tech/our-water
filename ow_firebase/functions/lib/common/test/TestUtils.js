"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSyncRun = exports.createNewSync = void 0;

var request = require('request-promise-native');

var baseUrl = process.env.BASE_URL;
var orgId = process.env.ORG_ID;
var mywellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;

var createNewSync = function createNewSync() {
  var data = {
    isOneTime: false,
    datasource: {
      type: "LegacyMyWellDatasource",
      url: mywellLegacyBaseUrl
    },
    type: "unknown",
    selectedDatatypes: ['group', 'resource', 'reading']
  };
  var options = {
    method: 'POST',
    uri: "".concat(baseUrl, "/sync/").concat(orgId),
    json: true,
    body: {
      data: data
    }
  };
  return request(options).then(function (response) {
    console.log("createNewSync response, ", response);
    return response.data.syncId;
  }).catch(function (err) {
    console.log('err', err);
    return Promise.reject(err);
  });
};

exports.createNewSync = createNewSync;

var getSyncRun = function getSyncRun(_orgId, fs, syncRunId) {
  return fs.collection('org').doc(_orgId).collection('syncRun').doc(syncRunId).get().then(function (sn) {
    return sn.data();
  });
};

exports.getSyncRun = getSyncRun;