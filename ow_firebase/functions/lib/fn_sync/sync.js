"use strict";

var validate = _interopRequireWildcard(require("express-validation"));

var express = _interopRequireWildcard(require("express"));

var cors = _interopRequireWildcard(require("cors"));

var moment = _interopRequireWildcard(require("moment"));

var _SyncMethod = require("../common/enums/SyncMethod");

var _Sync = require("../common/models/Sync");

var _SyncRun = require("../common/models/SyncRun");

var _LegacyMyWellDatasource = _interopRequireDefault(require("../common/models/Datasources/LegacyMyWellDatasource"));

var _DatasourceType = require("../common/enums/DatasourceType");

var _FileDatasource = require("../common/models/Datasources/FileDatasource");

var _FileDatasourceOptions = _interopRequireDefault(require("../common/models/FileDatasourceOptions"));

var _validate = require("./validate");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var keyFilename = "./my-private-api-key-file.json"; //replace this with api key file

var projectId = "our-water";
var bucketName = "".concat(projectId, ".appspot.com");

var gcs = require('@google-cloud/storage')({
  projectId: projectId
});

var bucket = gcs.bucket(bucketName);

var bodyParser = require('body-parser');

var fileUpload = require('express-fileupload');

module.exports = function (functions, admin) {
  var app = (0, express)();
  app.use(fileUpload());
  app.use(bodyParser.json());
  var fs = admin.firestore();
  var storage = admin.storage().bucket();
  /* CORS Configuration */

  var openCors = (0, cors)({
    origin: '*'
  });
  app.use(openCors);
  app.use(function (err, req, res, next) {
    console.log("error", err);

    if (err.status) {
      return res.status(err.status).json(err);
    }

    return res.status(500).json({
      status: 500,
      message: err.message
    });
  });
  /**
   * GET Syncs
   * 
   * Gets all the syncs for an orgId
   */

  app.get('/:orgId', function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(req, res, next) {
      var orgId, syncsJson, syncs;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              orgId = req.params.orgId;
              _context.prev = 1;
              _context.next = 4;
              return _Sync.Sync.getSyncs(orgId, fs);

            case 4:
              syncs = _context.sent;
              syncsJson = syncs.map(function (sync) {
                return sync.serialize();
              });
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](1);
              return _context.abrupt("return", next(_context.t0));

            case 11:
              return _context.abrupt("return", res.json({
                data: syncsJson
              }));

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[1, 8]]);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }());
  /**
   * GET syncRunsForSync
   * 
   * Gets the sync runs for a given sync run
   */

  app.get('/:orgId/syncRuns/:syncId', function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(req, res, next) {
      var _req$params, orgId, syncId, syncRunsJson, syncRuns;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _req$params = req.params, orgId = _req$params.orgId, syncId = _req$params.syncId;
              _context2.prev = 1;
              _context2.next = 4;
              return _SyncRun.SyncRun.getSyncRuns({
                orgId: orgId,
                syncId: syncId,
                fs: fs
              });

            case 4:
              syncRuns = _context2.sent;
              syncRunsJson = syncRuns.map(function (syncRun) {
                return syncRun.serialize();
              });
              _context2.next = 11;
              break;

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](1);
              return _context2.abrupt("return", next(_context2.t0));

            case 11:
              return _context2.abrupt("return", res.json({
                data: syncRunsJson
              }));

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[1, 8]]);
    }));

    return function (_x4, _x5, _x6) {
      return _ref2.apply(this, arguments);
    };
  }());
  /**
   * DELETE sync
   * 
   * Delete the sync for an id
   */

  app.delete('/:orgId/:id', function () {
    var _ref3 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(req, res, next) {
      var _req$params2, orgId, id, sync;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _req$params2 = req.params, orgId = _req$params2.orgId, id = _req$params2.id;
              _context3.prev = 1;
              _context3.next = 4;
              return _Sync.Sync.getSync({
                orgId: orgId,
                id: id,
                fs: fs
              });

            case 4:
              sync = _context3.sent;
              sync.delete({
                fs: fs
              });
              _context3.next = 11;
              break;

            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3["catch"](1);
              return _context3.abrupt("return", next(_context3.t0));

            case 11:
              return _context3.abrupt("return", res.json({
                data: true
              }));

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this, [[1, 8]]);
    }));

    return function (_x7, _x8, _x9) {
      return _ref3.apply(this, arguments);
    };
  }());
  /**
   * createSync
   * 
   * Creates a new sync with the given settings
   */

  var initDatasourceWithOptions = function initDatasourceWithOptions(datasource) {
    console.log("datasource", datasource);

    switch (datasource.type) {
      case _DatasourceType.DatasourceType.LegacyMyWellDatasource:
        return new _LegacyMyWellDatasource.default(datasource.url, datasource.selectedDatatypes);

      case _DatasourceType.DatasourceType.FileDatasource:
        var fileUrl = datasource.fileUrl,
            dataType = datasource.dataType,
            fileFormat = datasource.fileFormat,
            options = datasource.options;
        return new _FileDatasource.FileDatasource(fileUrl, dataType, fileFormat, _FileDatasourceOptions.default.deserialize(options));

      default:
        throw new Error("Tried to initialize Datasource of unknown type: ".concat(datasource.type));
    }
  };

  app.post('/:orgId', (0, validate)(_validate.createSyncValidation), function (req, res, next) {
    var orgId = req.params.orgId;
    var _req$body$data = req.body.data,
        isOneTime = _req$body$data.isOneTime,
        datasource = _req$body$data.datasource,
        type = _req$body$data.type,
        frequency = _req$body$data.frequency;
    var ds = initDatasourceWithOptions(datasource);
    var sync = new _Sync.Sync(isOneTime, ds, orgId, [_SyncMethod.SyncMethod.validate], frequency);
    return sync.create({
      fs: fs
    }).then(function (createdSync) {
      return res.json({
        data: {
          syncId: createdSync.id
        }
      });
    }).catch(function (err) {
      console.log(err);
      next(err);
    });
  });
  /**
   * runSync(orgId, syncId)
   * 
   * runs the sync of the given id.
   * Syncs each have a number of methods:
   * - validate
   * - pushTo
   * - pullFrom
   * 
   * later on
   * - get (returns the given data for the sync)
   * - post (updates the given data for ths sync)
   *
   * //TODO: auth - make admin only
   */

  var runSyncValidation = {
    query: {
      method: _SyncMethod.SyncMethodValidation.required()
    } //TODO: this should probably be get, but httpsCallable seems to only want to do POST
    //refer to this: https://github.com/firebase/firebase-js-sdk/blob/d59b72493fc89ff89c8a17bf142f58517de4c566/packages/functions/src/api/service.ts

  };
  app.post('/:orgId/run/:syncId', (0, validate)(runSyncValidation), function (req, res, next) {
    var _req$params3 = req.params,
        orgId = _req$params3.orgId,
        syncId = _req$params3.syncId;
    var method = req.query.method;
    console.log("getting sync", orgId, syncId);
    return _Sync.Sync.getSync({
      orgId: orgId,
      id: syncId,
      fs: fs
    }).then(function (sync) {
      if (sync.isOneTime && (0, moment)(sync.lastSyncDate).unix() !== 0) {
        throw new Error("Cannot run sync twice. Sync is marked as one time only");
      } //TODO: put in proper email addresses


      var run = new _SyncRun.SyncRun(orgId, syncId, method, ['lewis@vesselstech.com']);
      return run.create({
        fs: fs
      });
    }).then(function (run) {
      //Resolve before we actually process the run
      res.json({
        data: {
          syncRunId: run.id
        }
      });
      return run.run({
        fs: fs
      }).catch(function (err) {
        return console.error("Error running syncRun of id ".concat(run.id, ". Message: ").concat(err.message));
      });
    }).catch(function (err) {
      console.log('error in runSync:', err);
      next(err);
    });
  });
  /**
   * POST uploadFile
   * /:orgId/upload
   */

  app.post('/:orgId/upload', function (req, res, next) {
    var orgId = req.params.orgId;

    if (!req['files']) {
      return res.status(400).send('No files were uploaded.');
    }

    if (!req['files'].readingsFile) {
      return res.status(400).send('file with param readingsFile is required');
    } // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file


    var readingsFile = req['files'].readingsFile; //Save to local first:

    var localFilename = "/tmp/".concat((0, moment)().toISOString(), "_").concat(readingsFile.name);
    var destination = "".concat(orgId, "/sync/").concat(readingsFile.name);
    return readingsFile.mv(localFilename).then(function () {
      //Upload from file to bucket
      return bucket.upload(localFilename, {
        destination: destination,
        public: true,
        metadata: {
          contentType: readingsFile.mimetype
        }
      });
    }).then(function (sn) {
      return res.json({
        fileUrl: "http://storage.googleapis.com/".concat(bucketName, "/").concat(destination)
      });
    }).catch(function (err) {
      console.log('POST uploadFile err', err);
      return next(err);
    });
  });
  return functions.https.onRequest(app);
};