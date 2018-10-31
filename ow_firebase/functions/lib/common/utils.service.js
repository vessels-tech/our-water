"use strict";

var assert = _interopRequireWildcard(require("assert"));

var _Firestore = _interopRequireDefault(require("./apis/Firestore"));

var _utils = require("./utils");

var _ResourceIdType = _interopRequireDefault(require("./types/ResourceIdType"));

var _OWGeoPoint = _interopRequireDefault(require("../common/models/OWGeoPoint"));

var _Group = require("./models/Group");

var _GroupType = require("./enums/GroupType");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var orgId = process.env.ORG_ID;
describe('Misc Tests', function () {
  var _this = this;

  describe('csv utils', function () {
    this.timeout(10000);
    it('downloads and parses file', function () {
      //TODO: this will break. We should upload it beforehand
      var url = 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2017.xlsx%20-%20B-Well.tsv?alt=media&token=1e17d48f-5404-4f27-90f3-fb6a76a6dc45';
      return (0, _utils.downloadAndParseCSV)(url);
    });
  });
  describe('serializer utils', function () {
    it('serializes a map', function () {
      var input = new Map();
      input.set('abc', true);
      input.set('def', false);
      var result = (0, _utils.serializeMap)(input);
      console.log(result);
      assert.deepEqual(result, {
        abc: true,
        def: false
      });
    });
    it('converts an object to a map', function () {
      var input = {
        abc: true,
        def: false
      };
      var result = (0, _utils.anyToMap)(input);
      var expected = new Map();
      expected.set('abc', true);
      expected.set('def', false);
      assert.deepEqual(result, expected);
    });
  });
  describe('getLegacyGroups', function () {
    _this.timeout(10000);

    var groupIdsToCleanup = [];
    before(function () {
      this.timeout(10000); //Create 3 groups, 2 of which are legacy

      var coords = new _OWGeoPoint.default(); // const group1 = new Group("group1", orgId, "village", coords, utils.anyToMap({ 'mywell.12345.1':true }));

      var group1 = new _Group.Group("group1", orgId, _GroupType.GroupType.Village, coords, _ResourceIdType.default.fromLegacyVillageId(12345, 1));
      var group2 = new _Group.Group("group2", orgId, _GroupType.GroupType.Pincode, coords, _ResourceIdType.default.fromLegacyPincode(12345));
      var group3 = new _Group.Group("group3", orgId, _GroupType.GroupType.Village, coords, new _ResourceIdType.default());
      return Promise.all([group1.create({
        fs: _Firestore.default
      }).then(function (group) {
        return groupIdsToCleanup.push(group.id);
      }), group2.create({
        fs: _Firestore.default
      }).then(function (group) {
        return groupIdsToCleanup.push(group.id);
      }), group3.create({
        fs: _Firestore.default
      }).then(function (group) {
        return groupIdsToCleanup.push(group.id);
      })]);
    });
    after(function () {
      this.timeout(5000);
      console.log("cleaning up ".concat(groupIdsToCleanup.length, " groups"));
      groupIdsToCleanup.forEach(function (id) {
        return _Firestore.default.collection('org').doc(orgId).collection('group').doc(id).delete();
      });
    }); //TODO: we need to make sure each test is siloed first...

    it.skip('getLegacyGroups gets legacy groups in the correct format', _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var legacyGroups;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _utils.getLegacyMyWellGroups)(orgId, _Firestore.default);

            case 2:
              legacyGroups = _context.sent;
              //Make sure there are only 2
              assert.equal(2, Object.keys((0, _utils.serializeMap)(legacyGroups)).length);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    })));
  });
});