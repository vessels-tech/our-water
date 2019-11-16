"use strict";

require("mocha");

var assert = _interopRequireWildcard(require("assert"));

var _SearchApi = require("./SearchApi");

var _AppProviderTypes = require("../utils/AppProviderTypes");

var _TestFirebase = require("../test/TestFirebase");

var _requestPromiseNative = _interopRequireDefault(require("request-promise-native"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../test/testConfig.json'),
    orgId = _require.orgId;

describe('Search Api', function () {
  this.timeout(5000);
  describe('Groups', function () {
    var searchApi = new _SearchApi.SearchApi(_TestFirebase.firestore, orgId); // this.beforeAll(async () => {
    // });

    it('searches for a place, an returns the expected response',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var baseUrl, placeName, searchParams, result;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // Arrange
              baseUrl = "https://nominatim.openstreetmap.org/search";
              placeName = "Adelaide";
              searchParams = {
                limit: 10
              }; //Act

              _context.t0 = _AppProviderTypes.unsafeUnwrap;
              _context.next = 6;
              return searchApi.searchForPlaceName(baseUrl, placeName, searchParams, _requestPromiseNative.default);

            case 6:
              _context.t1 = _context.sent;
              result = (0, _context.t0)(_context.t1);
              //Assert
              //This is a little naive, but it's ok for now.
              assert.equal(result.results.length, 10);

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }))); // this.afterAll(async () => {
    // });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvU2VhcmNoQXBpLnNlcnZpY2UudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIm9yZ0lkIiwiZGVzY3JpYmUiLCJ0aW1lb3V0Iiwic2VhcmNoQXBpIiwiU2VhcmNoQXBpIiwiZmlyZXN0b3JlIiwiaXQiLCJiYXNlVXJsIiwicGxhY2VOYW1lIiwic2VhcmNoUGFyYW1zIiwibGltaXQiLCJ1bnNhZmVVbndyYXAiLCJzZWFyY2hGb3JQbGFjZU5hbWUiLCJyZXF1ZXN0IiwicmVzdWx0IiwiYXNzZXJ0IiwiZXF1YWwiLCJyZXN1bHRzIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O2VBSUlBLE9BQU8sQ0FBQyx5QkFBRCxDO0lBRFRDLEssWUFBQUEsSzs7QUFJRkMsUUFBUSxDQUFDLFlBQUQsRUFBZSxZQUFZO0FBQ2pDLE9BQUtDLE9BQUwsQ0FBYSxJQUFiO0FBR0FELEVBQUFBLFFBQVEsQ0FBQyxRQUFELEVBQVcsWUFBWTtBQUU3QixRQUFNRSxTQUFTLEdBQUcsSUFBSUMsb0JBQUosQ0FBY0MsdUJBQWQsRUFBeUJMLEtBQXpCLENBQWxCLENBRjZCLENBSTdCO0FBRUE7O0FBRUFNLElBQUFBLEVBQUUsQ0FBQyx3REFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLDRCQUEyRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDM0Q7QUFDTUMsY0FBQUEsT0FGcUQsR0FFM0MsNENBRjJDO0FBR3JEQyxjQUFBQSxTQUhxRCxHQUd6QyxVQUh5QztBQUlyREMsY0FBQUEsWUFKcUQsR0FJcEI7QUFBQ0MsZ0JBQUFBLEtBQUssRUFBRTtBQUFSLGVBSm9CLEVBTTNEOztBQU4yRCw0QkFPNUNDLDhCQVA0QztBQUFBO0FBQUEscUJBT3pCUixTQUFTLENBQUNTLGtCQUFWLENBQTZCTCxPQUE3QixFQUFzQ0MsU0FBdEMsRUFBaURDLFlBQWpELEVBQStESSw2QkFBL0QsQ0FQeUI7O0FBQUE7QUFBQTtBQU9yREMsY0FBQUEsTUFQcUQ7QUFTM0Q7QUFDQTtBQUNBQyxjQUFBQSxNQUFNLENBQUNDLEtBQVAsQ0FBYUYsTUFBTSxDQUFDRyxPQUFQLENBQWVDLE1BQTVCLEVBQW9DLEVBQXBDOztBQVgyRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUEzRCxHQUFGLENBUjZCLENBc0I3QjtBQUVBO0FBRUQsR0ExQk8sQ0FBUjtBQTJCRCxDQS9CTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdtb2NoYSc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0Jztcbi8vQHRzLWlnbm9yZVxuaW1wb3J0IE1vY2tGaXJlc3RvcmUgZnJvbSAnbW9jay1jbG91ZC1maXJlc3RvcmUnO1xuaW1wb3J0IHsgU2VhcmNoQXBpLCBTZWFyY2hQYWdlUGFyYW1zIH0gZnJvbSAnLi9TZWFyY2hBcGknO1xuaW1wb3J0IHsgdW5zYWZlVW53cmFwIH0gZnJvbSAnLi4vdXRpbHMvQXBwUHJvdmlkZXJUeXBlcyc7XG5pbXBvcnQgeyBmaXJlc3RvcmUgfSBmcm9tICcuLi90ZXN0L1Rlc3RGaXJlYmFzZSc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0LXByb21pc2UtbmF0aXZlJztcblxuY29uc3Qge1xuICBvcmdJZCxcbn0gPSByZXF1aXJlKCcuLi90ZXN0L3Rlc3RDb25maWcuanNvbicpO1xuXG5cbmRlc2NyaWJlKCdTZWFyY2ggQXBpJywgZnVuY3Rpb24gKCkge1xuICB0aGlzLnRpbWVvdXQoNTAwMCk7XG5cblxuICBkZXNjcmliZSgnR3JvdXBzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgY29uc3Qgc2VhcmNoQXBpID0gbmV3IFNlYXJjaEFwaShmaXJlc3RvcmUsIG9yZ0lkKTtcblxuICAgIC8vIHRoaXMuYmVmb3JlQWxsKGFzeW5jICgpID0+IHtcbiAgICBcbiAgICAvLyB9KTtcblxuICAgIGl0KCdzZWFyY2hlcyBmb3IgYSBwbGFjZSwgYW4gcmV0dXJucyB0aGUgZXhwZWN0ZWQgcmVzcG9uc2UnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBiYXNlVXJsID0gXCJodHRwczovL25vbWluYXRpbS5vcGVuc3RyZWV0bWFwLm9yZy9zZWFyY2hcIjtcbiAgICAgIGNvbnN0IHBsYWNlTmFtZSA9IFwiQWRlbGFpZGVcIjtcbiAgICAgIGNvbnN0IHNlYXJjaFBhcmFtczogU2VhcmNoUGFnZVBhcmFtcyA9IHtsaW1pdDogMTB9O1xuXG4gICAgICAvL0FjdFxuICAgICAgY29uc3QgcmVzdWx0ID0gdW5zYWZlVW53cmFwKGF3YWl0IHNlYXJjaEFwaS5zZWFyY2hGb3JQbGFjZU5hbWUoYmFzZVVybCwgcGxhY2VOYW1lLCBzZWFyY2hQYXJhbXMsIHJlcXVlc3QpKTtcblxuICAgICAgLy9Bc3NlcnRcbiAgICAgIC8vVGhpcyBpcyBhIGxpdHRsZSBuYWl2ZSwgYnV0IGl0J3Mgb2sgZm9yIG5vdy5cbiAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQucmVzdWx0cy5sZW5ndGgsIDEwKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMuYWZ0ZXJBbGwoYXN5bmMgKCkgPT4ge1xuICAgICAgXG4gICAgLy8gfSk7XG5cbiAgfSk7XG59KTsiXX0=