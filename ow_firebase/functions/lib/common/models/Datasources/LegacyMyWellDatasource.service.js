"use strict";

var assert = _interopRequireWildcard(require("assert"));

var moment = _interopRequireWildcard(require("moment"));

var chai = _interopRequireWildcard(require("chai"));

var _Firestore = _interopRequireDefault(require("../../apis/Firestore"));

var _LegacyMyWellDatasource = _interopRequireDefault(require("./LegacyMyWellDatasource"));

var _ResourceIdType = _interopRequireDefault(require("../../types/ResourceIdType"));

var _Resource = require("../Resource");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var orgId = process.env.ORG_ID;
var myWellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;
describe('pullFromDataSource', function () {
  describe('getGroupData', function () {
    it.skip('saves new Group Data', _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var _lat$lng, lat, lng, delta, legacyVillages, groups, datasource, result;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this.timeout(5000); //Arrange

              _lat$lng = {
                lat: 34.54,
                lng: -115.4342
              }, lat = _lat$lng.lat, lng = _lat$lng.lng;
              delta = 0.1;
              legacyVillages = [{
                id: 12345,
                name: 'Hinta',
                postcode: 5000,
                coordinates: {
                  lat: lat,
                  lng: lng
                },
                createdAt: (0, moment)().toISOString(),
                updatedAt: (0, moment)().toISOString()
              }];
              groups = _LegacyMyWellDatasource.default.transformLegacyVillagesToGroups(orgId, legacyVillages); //Act

              datasource = new _LegacyMyWellDatasource.default(myWellLegacyBaseUrl, []);
              _context.next = 8;
              return datasource.saveGroups(orgId, _Firestore.default, groups);

            case 8:
              result = _context.sent;
              //Assert
              assert.equal(1, result.results.length);
              assert.equal(0, result.warnings.length);
              assert.equal(0, result.errors.length);

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    })));
  });
});
describe('pushDataToDataSource', function () {
  describe('saveResourcesToLegacyMyWell', function () {
    this.timeout(15000);
    var datasource = new _LegacyMyWellDatasource.default(myWellLegacyBaseUrl, []);
    var newResources;
    var legacyResources;
    /* Create 2 resources that haven't yet been synced to LegacyMyWell */

    before(function () {
      var externalIdsA = _ResourceIdType.default.newOWResource(223456789).serialize();

      var externalIdsB = _ResourceIdType.default.newOWResource(223456789).serialize();

      var resourcesRef = _Firestore.default.collection('org').doc(orgId).collection('resource');

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

      return Promise.all([resourcesRef.add(resourceA.serialize()), resourcesRef.add(resourceB.serialize())]).then(function () {
        var oneYearAgo = (0, moment)().subtract(1, 'year').valueOf();
        return datasource.getNewResources(orgId, _Firestore.default, oneYearAgo);
      }).then(function (_newResources) {
        newResources = _newResources;
        legacyResources = _LegacyMyWellDatasource.default.transformResourcesToLegacyMyWell(newResources);
      });
    }); //TODO: we need a different set of legacyResources that have the external resourceId

    it.skip('saves resources to LegacyMyWell', _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      var result;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return datasource.saveResourcesToLegacyMyWell(legacyResources);

            case 2:
              result = _context2.sent;
              console.log('result is', result); //Assert

              assert.equal(2, result.results.length);
              assert.equal(0, result.warnings.length);
              assert.equal(0, result.errors.length);

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    })));
    it('saves new resources to LegacyMyWell and returns a list of ids', _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3() {
      var result;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return datasource.saveNewResourcesToLegacyMyWell(newResources);

            case 2:
              result = _context3.sent;
              //Assert
              chai.expect(result).to.be.an('array').that.does.not.include(null);

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    })));
  });
  describe('saveReadingsToLegacyMyWell', function () {
    this.timeout(15000);
    var datasource = new _LegacyMyWellDatasource.default(myWellLegacyBaseUrl, []);
    it('formats an error correctly', _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4() {
      var legacyReadings, result;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              //Arrange
              legacyReadings = [{
                date: '2018-08-03T00:57:47.957Z',
                value: 100,
                villageId: 11,
                postcode: 1234567,
                //postcode doesn't exist
                resourceId: 1111,
                createdAt: '2018-08-03T00:57:47.957Z',
                updatedAt: '2018-07-03T00:57:47.957Z'
              }]; //Act

              _context4.next = 3;
              return datasource.saveReadingsToLegacyMyWell(legacyReadings);

            case 3:
              result = _context4.sent;
              //Assert
              assert.equal(0, result.results.length);
              assert.equal(0, result.warnings.length);
              assert.equal(1, result.errors.length);

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    })));
    it('saves a list of readings to LegacyMyWell', _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5() {
      var legacyReadings, result;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              //Arrange
              legacyReadings = [{
                date: '2018-08-03T00:57:47.957Z',
                value: 100,
                villageId: 11,
                postcode: 313603,
                resourceId: 1111,
                createdAt: '2018-08-03T00:57:47.957Z',
                updatedAt: '2018-07-03T00:57:47.957Z'
              }, {
                date: '2018-08-03T00:57:47.957Z',
                value: 100,
                villageId: 11,
                postcode: 313603,
                resourceId: 1112,
                createdAt: '2018-07-03T00:57:47.957Z',
                updatedAt: '2018-06-03T00:57:47.957Z'
              }]; //Act

              _context5.next = 3;
              return datasource.saveReadingsToLegacyMyWell(legacyReadings);

            case 3:
              result = _context5.sent;
              //Assert
              assert.equal(2, result.results.length);
              assert.equal(0, result.warnings.length);
              assert.equal(0, result.errors.length);

            case 7:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    })));
  });
});