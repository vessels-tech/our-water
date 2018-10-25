"use strict";

var assert = _interopRequireWildcard(require("assert"));

var chai = _interopRequireWildcard(require("chai"));

var _ResourceIdType = _interopRequireDefault(require("./ResourceIdType"));

var _util = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

describe('ResourceIdTypeTest', function () {
  describe('static initializers', function () {
    it('fromLegacyPincode fills in only MyWellId and pincode', function () {
      //Arrange
      var legacyId = _ResourceIdType.default.fromLegacyPincode(313603); //Act


      var ser = legacyId.serialize(); //Assert

      chai.assert.isNotNull(ser.legacyMyWellId);
      chai.assert.isNotNull(ser.legacyMyWellPincode);
      chai.assert.isTrue(ser.hasLegacyMyWellId);
      chai.assert.isTrue(ser.hasLegacyMyWellPincode);
    });
    it('fromLegacyVillageId fills in MyWellId, Pincode and VillageIds', function () {
      //Arrange
      var legacyId = _ResourceIdType.default.fromLegacyVillageId(313603, 11); //Act


      var ser = legacyId.serialize(); //Assert

      chai.assert.isNotNull(ser.legacyMyWellId);
      chai.assert.isNotNull(ser.legacyMyWellPincode);
      chai.assert.isNotNull(ser.legacyMyWellVillageId);
      chai.assert.isTrue(ser.hasLegacyMyWellId);
      chai.assert.isTrue(ser.hasLegacyMyWellPincode);
      chai.assert.isTrue(ser.hasLegacyMyWellVillageId);
    });
    it('fromLegacyMyWellId fills in MyWellId, Pincode, Village and ResourceIds', function () {
      //Arrange
      var legacyId = _ResourceIdType.default.fromLegacyMyWellId(313603, 1111); //Act


      var ser = legacyId.serialize(); //Assert

      var expected = {
        legacyMyWellId: '313603.1111',
        legacyMyWellPincode: '313603',
        legacyMyWellVillageId: '11',
        legacyMyWellResourceId: '1111',
        hasLegacyMyWellId: true,
        hasLegacyMyWellResourceId: true,
        hasLegacyMyWellVillageId: true,
        hasLegacyMyWellPincode: true
      };
      assert.deepEqual(ser, expected);
    });
    it('fromLegacyReadingId fills in MyWellId, Pincode, Village and ResourceIds', function () {
      //Arrange
      var legacyId = _ResourceIdType.default.fromLegacyReadingId(12345, 313603, 1111); //Act


      var ser = legacyId.serialize(); //Assert

      var expected = {
        legacyMyWellId: '12345',
        legacyMyWellPincode: '313603',
        legacyMyWellVillageId: '11',
        legacyMyWellResourceId: '1111',
        hasLegacyMyWellId: true,
        hasLegacyMyWellResourceId: true,
        hasLegacyMyWellVillageId: true,
        hasLegacyMyWellPincode: true
      };
      assert.deepEqual(ser, expected);
    });
  });
  describe('serialize()', function () {
    it('does not have extra null fields', function () {
      //Arrange
      var legacyId = _ResourceIdType.default.fromLegacyPincode(313603); //Act


      var ser = legacyId.serialize(); //Assert

      var nullCount = Object.keys(ser).map(function (key) {
        return ser[key];
      }).reduce(function (acc, curr) {
        if ((0, _util.isNullOrUndefined)(curr)) {
          acc += 1;
        }

        return acc;
      }, 0);
      assert.equal(nullCount, 0);
    });
    it('adds extra `has` fields', function () {
      //Arrange
      var legacyId = _ResourceIdType.default.fromLegacyVillageId(313603, 11); //Act


      var ser = legacyId.serialize(); //Assert

      var expected = {
        legacyMyWellId: '313603.11',
        legacyMyWellPincode: '313603',
        legacyMyWellVillageId: '11',
        hasLegacyMyWellId: true,
        hasLegacyMyWellResourceId: false,
        hasLegacyMyWellVillageId: true,
        hasLegacyMyWellPincode: true
      };
      assert.deepEqual(expected, ser);
    });
  });
  describe('getResourceId()', function () {
    it('throws when no legacyMyWellResourceId', function () {
      //Arrange
      var resourceId = _ResourceIdType.default.fromLegacyPincode(5000); //Act & Assert


      assert.throws(function () {
        resourceId.getResourceId();
      }, /^Error: tried to getResourceId*/);
    });
    it('returns the correct villageId', function () {
      //Arrange
      var resource = _ResourceIdType.default.fromLegacyReadingId(12345, 5000, 1123); //Act


      var resourceId = resource.getResourceId(); //Assert

      assert.equal(resourceId, 1123);
    });
  });
  describe('getVillageId()', function () {
    /*no longer relevant, as we must have a postcode */
    it('throws when no legacyMyWellResourceId', function () {
      //Arrange
      var resourceId = _ResourceIdType.default.fromLegacyPincode(5000); //Act & Assert


      assert.throws(function () {
        resourceId.getVillageId();
      }, /^Error: tried to getVillageId*/);
    });
    it('returns the correct villageId', function () {
      //Arrange
      var resourceId = _ResourceIdType.default.fromLegacyReadingId(12345, 5000, 1123); //Act


      var villageId = resourceId.getVillageId(); //Assert

      assert.equal(villageId, 11);
    });
  });
  describe('getPostcode', function () {
    it('returns the correct postcode', function () {
      //Arrange
      var resourceId = _ResourceIdType.default.fromLegacyReadingId(12345, 5000, 1123); //Act


      var postcode = resourceId.getPostcode(); //Assert

      assert.equal(postcode, 5000);
    });
  });
});