"use strict";

var request = _interopRequireWildcard(require("request-promise"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

describe('OrgApi', function () {
  var orgId = process.env.ORG_ID;
  var baseUrl = process.env.BASE_URL;
  it('should get all orgs', function () {
    var options = {
      method: 'GET',
      uri: "".concat(baseUrl, "/org"),
      json: true
    };
    return (0, request)(options).then(function (response) {
      return console.log('res', response);
    }).catch(function (err) {
      console.log('err', err);
      return Promise.reject(err);
    });
  }); //Cleanup all created resources

  after(function () {
    console.log('cleanup');
  });
});