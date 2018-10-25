"use strict";

var _validate = require("./validate");

var Joi = _interopRequireWildcard(require("joi"));

var assert = _interopRequireWildcard(require("assert"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

describe('SyncApi Unit Tests', function () {
  describe('CreateSync', function () {
    it('validates the POST /:orgId method correctly', function () {
      //Arrange
      var input = {
        body: {
          data: {
            isOneTime: false,
            frequency: 'daily',
            datasource: {
              type: "FileDatasource",
              fileUrl: 'file.com',
              dataType: 'Reading',
              fileFormat: 'TSV',
              options: {
                includesHeadings: true,
                usesLegacyMyWellIds: true
              },
              selectedDatatypes: ['reading']
            },
            type: "unknown"
          }
        }
      }; //Act

      var result = Joi.validate(input, _validate.createSyncValidation); //Assert

      assert.equal(null, result.error);
    });
    it('fails the validation with an unknown datatype', function () {
      //Arrange
      var input = {
        body: {
          data: {
            isOneTime: false,
            datasource: {
              type: "FileDatasource",
              fileUrl: 'file.com',
              dataType: 'Reading',
              fileFormat: 'TSV',
              options: {
                includesHeadings: true,
                usesLegacyMyWellIds: true
              },
              selectedDatatypes: ['boobasdasd']
            },
            type: "unknown"
          }
        }
      }; //Act

      var result = Joi.validate(input, _validate.createSyncValidation); //Assert

      var hasError = result.error ? true : false;
      assert.equal(true, hasError);
    });
  });
});