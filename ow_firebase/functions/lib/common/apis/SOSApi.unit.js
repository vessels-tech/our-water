"use strict";

require("mocha");

var _SOSApi = _interopRequireDefault(require("./SOSApi"));

var assert = _interopRequireWildcard(require("assert"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('SOSApi Unit Tests', function () {
  describe('GetCapabilities', function () {
    it.only('handles the default request', function () {
      //Arrange
      var request = {};
      var expected = ''; //Act

      var response = _SOSApi.default.getCapabilities(); //Assert


      assert.equal(response, expected);
    });
  });
});