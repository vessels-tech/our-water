"use strict";

require("mocha");

var assert = _interopRequireWildcard(require("assert"));

var _OWGeoPoint = _interopRequireDefault(require("../../models/OWGeoPoint"));

var moment = _interopRequireWildcard(require("moment"));

var MockFirebase = _interopRequireWildcard(require("mock-cloud-firestore"));

var _utils = require("../../utils");

var _LegacyMyWellDatasource = _interopRequireDefault(require("./LegacyMyWellDatasource"));

var _ResourceIdType = _interopRequireDefault(require("../../types/ResourceIdType"));

var _Reading = require("../Reading");

var _ResourceType = require("../../enums/ResourceType");

var _Resource = require("../Resource");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var orgId = process.env.ORG_ID;
var myWellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;
describe('pullFromDataSource', function () {
  describe('getGroupData', function () {
    it('creates a diamond from a given LatLng', function () {
      //Arrange
      var _lat$lng = {
        lat: 34.54,
        lng: -115.4342
      },
          lat = _lat$lng.lat,
          lng = _lat$lng.lng;
      var delta = 0.1; //Act

      var coords = (0, _utils.createDiamondFromLatLng)(lat, lng, delta); //Assert

      var expected = [new _OWGeoPoint.default(lat - delta, lng), new _OWGeoPoint.default(lat, lng + delta), new _OWGeoPoint.default(lat + delta, lng), new _OWGeoPoint.default(lat, lng - delta)];
      assert.deepEqual(coords, expected);
    });
    it('transformsLegacyVillagesToGroups', function () {
      //Arrange
      var _lat$lng2 = {
        lat: 34.54,
        lng: -115.4342
      },
          lat = _lat$lng2.lat,
          lng = _lat$lng2.lng;
      var delta = 0.1;
      var legacyVillages = [{
        id: 12,
        name: 'Hinta',
        postcode: 5000,
        coordinates: {
          lat: lat,
          lng: lng
        },
        createdAt: (0, moment)().toISOString(),
        updatedAt: (0, moment)().toISOString()
      }]; //Act

      var transformedVillages = _LegacyMyWellDatasource.default.transformLegacyVillagesToGroups(orgId, legacyVillages); //Assert


      var expected = [{
        name: 'Hinta',
        orgId: orgId,
        type: 'village',
        coords: (0, _utils.createDiamondFromLatLng)(lat, lng, delta),
        externalIds: _ResourceIdType.default.fromLegacyVillageId(5000, 12)
      }];
      assert.deepEqual(transformedVillages, expected);
    });
  });
});
describe('pushDataToDataSource', function () {
  describe('push resources to LegacyMyWell', function () {
    this.timeout(50000);
    var fs = new MockFirebase({}).firestore(); //Careful! We're masking the original fs

    var datasource = new _LegacyMyWellDatasource.default(myWellLegacyBaseUrl, []);
    /* Create 2 resources that haven't yet been synced to LegacyMyWell */

    before(function () {
      var externalIdsA = _ResourceIdType.default.newOWResource(5000).serialize();

      var externalIdsB = _ResourceIdType.default.newOWResource(5000).serialize();

      var resourcesRef = fs.collection('org').doc(orgId).collection('resource');
      var resourceAJson = {
        "resourceType": "well",
        "lastReadingDatetime": (0, moment)("1970-01-01T00:00:00.000Z").valueOf(),
        "id": "00znWgaT83RoYXYXxmvk",
        "createdAt": (0, moment)("2018-08-07T01:58:10.031Z").valueOf(),
        "coords": {
          "_latitude": 23.9172222222222,
          "_longitude": 73.8244444444444
        },
        "lastValue": 22.6,
        "groups": {
          "rhBCmtN16cABh6xSPijR": true,
          "jpKBA75GiZAzpA0gkBi8": true
        },
        "updatedAt": (0, moment)("2018-08-07T01:58:10.031Z").valueOf(),
        "owner": {
          "name": "Khokhariya Ramabhai Sojabhai",
          "createdByUserId": "default"
        },
        "orgId": "test_12345",
        "externalIds": externalIdsA
      };
      var resourceBJson = {
        "resourceType": "well",
        "lastReadingDatetime": (0, moment)("1970-01-01T00:00:00.000Z").valueOf(),
        "id": "00znWgaT83RoYXYXxmvk",
        "createdAt": (0, moment)("2018-08-07T01:58:10.031Z").valueOf(),
        "coords": {
          "_latitude": 23.9172222222222,
          "_longitude": 73.8244444444444
        },
        "lastValue": 22.6,
        "groups": {
          "rhBCmtN16cABh6xSPijR": true,
          "jpKBA75GiZAzpA0gkBi8": true
        },
        "updatedAt": (0, moment)("2018-08-07T01:58:10.031Z").valueOf(),
        "owner": {
          "name": "Khokhariya Ramabhai Sojabhai",
          "createdByUserId": "default"
        },
        "orgId": "test_12345",
        "externalIds": externalIdsB
      };

      var resourceA = _Resource.Resource.deserialize(resourceAJson);

      var resourceB = _Resource.Resource.deserialize(resourceBJson);

      return Promise.all([resourcesRef.add(resourceA.serialize()), resourcesRef.add(resourceB.serialize())]);
    });
    it('converts a list of SyncRunResults to a list of ids and nulls', function () {
      //Arrange
      var resultList = [{
        results: [1],
        warnings: [],
        errors: []
      }, {
        results: [2],
        warnings: [],
        errors: []
      }, {
        results: [],
        warnings: [],
        errors: ['Error saving thingo']
      }]; //Act

      var result = _LegacyMyWellDatasource.default.convertSyncRunResultsToList(resultList); //Assert


      var expected = [1, 2, null];
      assert.deepEqual(result, expected);
    });
    it('updateExistingResources updates resources for a list of ids', _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var oneYearAgo, newResources, ids, result, expected;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              //Arrange
              oneYearAgo = (0, moment)().subtract(1, 'year').valueOf();
              _context.next = 3;
              return datasource.getNewResources(orgId, fs, oneYearAgo);

            case 3:
              newResources = _context.sent;
              ids = [1111, 1112]; //Act

              _context.next = 7;
              return datasource.updateExistingResources(newResources, ids, fs);

            case 7:
              result = _context.sent;
              //Assert
              expected = {
                results: [1111, 1112],
                warnings: [],
                errors: []
              };
              assert.deepEqual(result, expected);

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    })));
    it('updateExistingResources handles null ids', _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      var oneYearAgo, newResources, ids, result;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              //Arrange
              oneYearAgo = (0, moment)().subtract(1, 'year').valueOf();
              _context2.next = 3;
              return datasource.getNewResources(orgId, fs, oneYearAgo);

            case 3:
              newResources = _context2.sent;
              ids = [1111, null]; //Act

              _context2.next = 7;
              return datasource.updateExistingResources(newResources, ids, fs);

            case 7:
              result = _context2.sent;
              //Assert
              assert.equal(result.results.length, 1);
              assert.equal(result.warnings.length, 1);
              assert.equal(result.errors.length, 0);

            case 11:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    })));
  });
  describe('transformReadingsToLegacyMyWell', function () {
    it('transforms a list of Readings to LegacyMyWellReadings', function () {
      //Arrange
      var mockDate = (0, moment)('2018-08-03T00:57:47.957Z');
      var readingA = new _Reading.Reading(orgId, 'readingA', null, _ResourceType.ResourceType.Well, {}, mockDate.toDate(), 100, _ResourceIdType.default.fromLegacyReadingId(123, 5000, 1110));
      var readingB = new _Reading.Reading(orgId, 'readingB', null, _ResourceType.ResourceType.Well, {}, mockDate.toDate(), 100, _ResourceIdType.default.fromLegacyReadingId(124, 5000, 1112));
      readingA.id = 'readingA';
      readingB.id = 'readingB';
      readingA.createdAt = mockDate.toDate();
      readingB.createdAt = mockDate.subtract(1, 'month').toDate();
      readingA.updatedAt = mockDate.toDate();
      readingB.updatedAt = mockDate.subtract(1, 'month').toDate();
      var readings = [readingA, readingB]; //Act

      var transformed = _LegacyMyWellDatasource.default.transformReadingsToLegacyMyWell(readings); //Assert


      var expected = [{
        date: '2018-08-03T00:57:47.957Z',
        value: 100,
        villageId: 11,
        postcode: 5000,
        resourceId: 1110,
        createdAt: '2018-08-03T00:57:47.957Z',
        updatedAt: '2018-07-03T00:57:47.957Z'
      }, {
        date: '2018-08-03T00:57:47.957Z',
        value: 100,
        villageId: 11,
        postcode: 5000,
        resourceId: 1112,
        createdAt: '2018-07-03T00:57:47.957Z',
        updatedAt: '2018-06-03T00:57:47.957Z'
      }];
      assert.deepEqual(expected, transformed);
    });
  });
  describe('getNewResources', function () {
    this.timeout(50000);
    var fs = new MockFirebase({}).firestore(); //Careful! We're masking the original fs

    var datasource = new _LegacyMyWellDatasource.default(myWellLegacyBaseUrl, []);
    before(function () {
      var externalIdsA = _ResourceIdType.default.newOWResource(5000).serialize(); // console.log('externalIdsA', externalIdsA);
      //This one isn't new, it should be filtered out


      var externalIdsB = _ResourceIdType.default.fromLegacyMyWellId(5000, 1111).serialize();

      var resourcesRef = fs.collection('org').doc(orgId).collection('resource');
      var resourceAJson = {
        "resourceType": "well",
        "lastReadingDatetime": (0, moment)("1970-01-01T00:00:00.000Z").valueOf(),
        "id": "00znWgaT83RoYXYXxmvk",
        "createdAt": (0, moment)("2018-08-07T01:58:10.031Z").valueOf(),
        "coords": {
          "_latitude": 23.9172222222222,
          "_longitude": 73.8244444444444
        },
        "lastValue": 22.6,
        "groups": {
          "rhBCmtN16cABh6xSPijR": true,
          "jpKBA75GiZAzpA0gkBi8": true
        },
        "updatedAt": (0, moment)("2018-08-07T01:58:10.031Z").valueOf(),
        "owner": {
          "name": "Khokhariya Ramabhai Sojabhai",
          "createdByUserId": "default"
        },
        "orgId": "test_12345",
        "externalIds": externalIdsA
      };
      var resourceBJson = {
        "resourceType": "well",
        "lastReadingDatetime": (0, moment)("1970-01-01T00:00:00.000Z").valueOf(),
        "id": "00znWgaT83RoYXYXxmvk",
        "createdAt": (0, moment)("2018-08-07T01:58:10.031Z").valueOf(),
        "coords": {
          "_latitude": 23.9172222222222,
          "_longitude": 73.8244444444444
        },
        "lastValue": 22.6,
        "groups": {
          "rhBCmtN16cABh6xSPijR": true,
          "jpKBA75GiZAzpA0gkBi8": true
        },
        "updatedAt": (0, moment)("2018-08-07T01:58:10.031Z").valueOf(),
        "owner": {
          "name": "Khokhariya Ramabhai Sojabhai",
          "createdByUserId": "default"
        },
        "orgId": "test_12345",
        "externalIds": externalIdsB
      };

      var resourceA = _Resource.Resource.deserialize(resourceAJson);

      var resourceB = _Resource.Resource.deserialize(resourceBJson);

      return Promise.all([resourcesRef.add(resourceA.serialize()), resourcesRef.add(resourceB.serialize())]);
    });
    it('gets the latest resources from OW', function () {
      var oneYearAgo = (0, moment)().subtract(1, 'year').valueOf();
      return datasource.getNewResources(orgId, fs, oneYearAgo).then(function (readings) {
        assert.equal(readings.length, 1);
      });
    });
  });
  describe('getNewReadings', function () {
    this.timeout(5000);
    var fs = new MockFirebase({}).firestore(); //Careful! We're masking the original fs

    var datasource = new _LegacyMyWellDatasource.default(myWellLegacyBaseUrl, []); //TODO: tidy up, make helper functions...

    before(function () {
      var readingsRef = fs.collection('org').doc(orgId).collection('reading');
      var readingA = new _Reading.Reading(orgId, 'readingA', null, _ResourceType.ResourceType.Well, {}, (0, moment)().toDate(), 100, _ResourceIdType.default.fromLegacyReadingId(123, 5000, 1110));
      var readingB = new _Reading.Reading(orgId, 'readingB', null, _ResourceType.ResourceType.Well, {}, (0, moment)().toDate(), 100, _ResourceIdType.default.none());
      var readingC = new _Reading.Reading(orgId, 'readingB', null, _ResourceType.ResourceType.Well, {}, (0, moment)().toDate(), 100, _ResourceIdType.default.fromLegacyReadingId(124, 5000, 1112));
      readingA.id = 'readingA';
      readingB.id = 'readingB';
      readingC.id = 'readingC';
      readingA.createdAt = (0, moment)().toDate();
      readingB.createdAt = (0, moment)().subtract(1, 'month').toDate();
      readingC.createdAt = (0, moment)().subtract(2, 'year').toDate();
      readingA.updatedAt = (0, moment)().toDate();
      readingB.updatedAt = (0, moment)().subtract(1, 'month').toDate();
      readingC.updatedAt = (0, moment)().subtract(2, 'year').toDate();
      return Promise.all([readingsRef.add(readingA.serialize()), readingsRef.add(readingB.serialize()), readingsRef.add(readingC.serialize())]);
    });
    it('gets the latest readings from OW', function () {
      var oneYearAgo = (0, moment)().subtract(1, 'year').valueOf();
      return datasource.getNewReadings(orgId, fs, oneYearAgo).then(function (readings) {
        assert.equal(readings.length, 1);
      });
    });
  });
});