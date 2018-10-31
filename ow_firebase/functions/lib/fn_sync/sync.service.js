"use strict";

require("mocha");

var sleep = _interopRequireWildcard(require("thread-sleep"));

var assert = _interopRequireWildcard(require("assert"));

var request = _interopRequireWildcard(require("request-promise"));

var _TestUtils = require("../common/test/TestUtils");

var _Firestore = _interopRequireDefault(require("../common/apis/Firestore"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var baseUrl = process.env.BASE_URL;
var orgId = process.env.ORG_ID;
var mywellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;
describe('SyncAPI', function () {
  this.timeout(30000); //Objects to clean up later

  var syncIds = [];
  var syncRunIds = [];
  describe('CSV Pull', function () {
    it('creates a new csv sync, and pulls the data correctly', function () {
      var syncId = null;
      var syncRunId = null;
      var fileUrl = 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2017.xlsx%20-%20B-Well.tsv?alt=media&token=1e17d48f-5404-4f27-90f3-fb6a76a6dc45';
      var data = {
        isOneTime: false,
        datasource: {
          type: "FileDatasource",
          fileUrl: fileUrl,
          dataType: 'Reading',
          fileFormat: 'TSV',
          //ignored for now
          options: {
            includesHeadings: true,
            usesLegacyMyWellIds: true
          }
        },
        type: "unknown",
        selectedDatatypes: ['reading']
      };
      var createSyncOptions = {
        method: 'POST',
        uri: "".concat(baseUrl, "/sync/").concat(orgId),
        json: true,
        body: {
          data: data
        }
      };
      return (0, request)(createSyncOptions).then(function (response) {
        syncId = response.data.syncId;
        syncIds.push(syncId);
        var runSyncOptions = {
          method: 'POST',
          uri: "".concat(baseUrl, "/sync/").concat(orgId, "/run/").concat(syncId, "?method=validate")
        };
        return (0, request)(runSyncOptions);
      }).then(function (response) {
        return JSON.parse(response);
      }) //json:true only applies to posts I think 
      .then(function (response) {
        //TODO: we might need to wait a little while 
        (0, sleep)(10000);
        syncRunId = response.data.syncRunId;
        syncRunIds.push(syncRunId);
        return (0, _TestUtils.getSyncRun)(orgId, _Firestore.default, syncRunId);
      }).then(function (syncRun) {
        console.log('syncRun: ', syncRun);
        assert.equal(syncRun.status, 'finished');
      });
    });
  });
  describe.only('MyWell Pull', function () {
    it('creates a new legacy sync, and pulls the data correctly', function () {
      var syncId = null;
      var syncRunId = null;
      var data = {
        isOneTime: false,
        frequency: 'daily',
        datasource: {
          type: "LegacyMyWellDatasource",
          url: mywellLegacyBaseUrl,
          selectedDatatypes: ['Group', 'Resource', 'Reading']
        },
        type: "unknown"
      };
      var createSyncOptions = {
        method: 'POST',
        uri: "".concat(baseUrl, "/sync/").concat(orgId),
        json: true,
        body: {
          data: data
        }
      };
      console.log("createSyncOptions", createSyncOptions);
      return (0, request)(createSyncOptions).then(function (response) {
        syncId = response.data.syncId;
        syncIds.push(syncId);
        var runSyncOptions = {
          method: 'POST',
          uri: "".concat(baseUrl, "/sync/").concat(orgId, "/run/").concat(syncId, "?method=pullFrom")
        };
        return (0, request)(runSyncOptions);
      }).then(function (response) {
        return JSON.parse(response);
      }) //json:true only applies to posts I think 
      .then(function (response) {
        //TODO: we might need to wait a little while 
        (0, sleep)(20000);
        syncRunId = response.data.syncRunId;
        syncRunIds.push(syncRunId);
        return (0, _TestUtils.getSyncRun)(orgId, _Firestore.default, syncRunId);
      }).then(function (syncRun) {
        console.log('syncRun: ', syncRun);
        assert.equal(syncRun.status, 'finished');
      });
    });
  });
  it('should create a new Sync', function () {
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
    return (0, request)(options).then(function (response) {
      syncIds.push(response.data.syncId);
    }).catch(function (err) {
      console.log('err', err);
      return Promise.reject(err);
    });
  });
  it('should create and run the sync', function () {
    var syncRunId = null;
    return (0, _TestUtils.createNewSync)().then(function (syncId) {
      syncIds.push(syncId);
      var options = {
        method: 'POST',
        uri: "".concat(baseUrl, "/sync/").concat(orgId, "/run/").concat(syncId, "?method=pullFrom")
      };
      return (0, request)(options);
    }).then(function (response) {
      return JSON.parse(response);
    }) //json:true only applies to posts I think 
    .then(function (response) {
      syncRunIds.push(response.data.syncRunId);
      syncRunId = response.data.syncRunId;
    }) //Wait for the sync to finish
    .then(function () {
      return (0, sleep)(20000);
    }).then(function () {
      return (0, _TestUtils.getSyncRun)(orgId, _Firestore.default, syncRunId);
    }).then(function (syncRun) {
      console.log("syncRun is:", syncRun);
      assert.equal(syncRun.status, 'finished');
    });
  });
  ; // Cleanup all created resources

  after(function () {
    if (process.env.SKIP_CLEANUP === 'true') {
      console.log("      Skipping Cleanup, as SKIP_CLEANUP is true");
      console.log("        orgId is: ".concat(orgId));
      return;
    }

    console.log("     Clean Up:");
    console.log("       Deleting document org/".concat(orgId));
    return _Firestore.default.collection('org').doc(orgId).delete(); // console.log(`      cleaning up ${syncIds.length} syncs`);
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