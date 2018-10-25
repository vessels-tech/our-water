"use strict";

var assert = _interopRequireWildcard(require("assert"));

var _SyncDatatypes = require("./SyncDatatypes");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

describe('SyncDatatype', function () {
  it('throws if the given datatype cannot be found', function () {
    //Act & Assert
    assert.throws(function () {
      (0, _SyncDatatypes.validateDatatype)('blablhaasd');
    }, /^Error: Could not find*/);
  });
  it('finds the datatype', function () {
    (0, _SyncDatatypes.validateDatatype)('reading');
  });
});