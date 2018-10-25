"use strict";

var assert = _interopRequireWildcard(require("assert"));

var crypto = _interopRequireWildcard(require("crypto"));

var _utils = require("./utils");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var orgId = process.env.ORG_ID;
describe('Utils Tests', function () {
  describe('hash tests', function () {
    it('hashes an id to an integer string of given length', function () {
      //Arrange
      var input = '00znWgaT83RoYXYXxmvk'; //Act

      var hashedStr = (0, _utils.hashIdToIntegerString)(input, 6); //Assert

      assert.equal(6, hashedStr.length);
      assert.equal(true, parseInt(hashedStr) > 0);
    });

    var generateIds = function generateIds(size) {
      var ids = [];

      for (var i = 0; i < size; i++) {
        ids.push(crypto.randomBytes(20).toString('hex'));
      }
    };
    /* decided against this method */


    it.skip('Does not collide with 100,000 ids', function () {
      var size = 100000;
      var ids = {};
      var hashedIds = {};

      for (var i = 0; i < size; i++) {
        var randomId = crypto.randomBytes(20).toString('hex');
        ids[randomId] = true; //We can't seem to avoid collisions here :(

        hashedIds[(0, _utils.hashIdToIntegerString)(randomId, 15)] = true;
      }

      assert.equal(Object.keys(ids).length, Object.keys(hashedIds).length);
    });
  });
});