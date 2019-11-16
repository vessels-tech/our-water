"use strict";

require("mocha");

var assert = _interopRequireWildcard(require("assert"));

var _mockCloudFirestore = _interopRequireDefault(require("mock-cloud-firestore"));

var _SearchApi = require("./SearchApi");

var _AppProviderTypes = require("../utils/AppProviderTypes");

var _model = require("../model");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../test/testConfig.json'),
    orgId = _require.orgId;

describe('Search Api', function () {
  this.timeout(5000);
  describe('Groups', function () {
    var firestore = new _mockCloudFirestore.default({}).firestore();
    var searchApi = new _SearchApi.SearchApi(firestore, orgId);
    this.beforeAll(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00001").set(_objectSpread({}, _model.DefaultMyWellResource, {
                id: "00001",
                groups: {
                  country: "IN",
                  pincode: "313603"
                }
              }));

            case 2:
              _context.next = 4;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00002").set(_objectSpread({}, _model.DefaultMyWellResource, {
                id: "00002",
                groups: {
                  country: "IN",
                  pincode: "313603"
                }
              }));

            case 4:
              _context.next = 6;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00003").set(_objectSpread({}, _model.DefaultMyWellResource, {
                id: "00003",
                groups: {
                  country: "AU",
                  pincode: "5016"
                }
              }));

            case 6:
              _context.next = 8;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00004").set(_objectSpread({}, _model.DefaultMyWellResource, {
                id: "00004",
                groups: {
                  country: "AU",
                  pincode: "5063"
                }
              }));

            case 8:
              _context.next = 10;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00005").set(_objectSpread({}, _model.DefaultMyWellResource, {
                id: "00005",
                groups: {
                  country: "IL",
                  pincode: "5555"
                }
              }));

            case 10:
              _context.next = 12;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00006").set(_objectSpread({}, _model.DefaultMyWellResource, {
                id: "00006",
                groups: {
                  country: "IL",
                  pincode: "313604"
                }
              }));

            case 12:
              _context.next = 14;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00007").set(_objectSpread({}, _model.DefaultMyWellResource, {
                id: "00007",
                groups: {
                  country: "IL",
                  pincode: "313605"
                }
              }));

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    })));
    it('searches for resources within the pincode group',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      var searchQuery, result;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // Arrange
              searchQuery = "313"; //Act

              _context2.t0 = _AppProviderTypes.unsafeUnwrap;
              _context2.next = 4;
              return searchApi.searchForResourceInGroup(searchQuery, 'pincode', {
                limit: 10
              });

            case 4:
              _context2.t1 = _context2.sent;
              result = (0, _context2.t0)(_context2.t1);
              //Assert
              assert.equal(result.results.length, 4);

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    })));
    it('searches for resources with a full pincode',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3() {
      var searchQuery, result;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // Arrange
              searchQuery = "313603"; //Act

              _context3.t0 = _AppProviderTypes.unsafeUnwrap;
              _context3.next = 4;
              return searchApi.searchForResourceInGroup(searchQuery, 'pincode', {
                limit: 10
              });

            case 4:
              _context3.t1 = _context3.sent;
              result = (0, _context3.t0)(_context3.t1);
              //Assert
              assert.equal(result.results.length, 2);

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    })));
    it('searches for resources within the country group',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4() {
      var searchQuery, result;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              // Arrange
              searchQuery = "I"; //Act

              _context4.t0 = _AppProviderTypes.unsafeUnwrap;
              _context4.next = 4;
              return searchApi.searchForResourceInGroup(searchQuery, 'country', {
                limit: 10
              });

            case 4:
              _context4.t1 = _context4.sent;
              result = (0, _context4.t0)(_context4.t1);
              //Assert
              assert.equal(result.results.length, 5);

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    })));
    it('searches for resources within the country group with an exact match',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5() {
      var searchQuery, result;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              // Arrange
              searchQuery = "IL"; //Act

              _context5.t0 = _AppProviderTypes.unsafeUnwrap;
              _context5.next = 4;
              return searchApi.searchForResourceInGroup(searchQuery, 'country', {
                limit: 10
              });

            case 4:
              _context5.t1 = _context5.sent;
              result = (0, _context5.t0)(_context5.t1);
              //Assert
              assert.equal(result.results.length, 3);

            case 7:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }))); //Pagination doesn't work correctly for mock-cloud-firestore
    //This test passes against live firebase

    it.skip('paginates correctly',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6() {
      var searchQuery, searchParams, searchResultA, searchResultB;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              // Arrange
              searchQuery = "I";
              searchParams = {
                limit: 2
              }; //Act

              _context6.t0 = _AppProviderTypes.unsafeUnwrap;
              _context6.next = 5;
              return searchApi.searchForResourceInGroup(searchQuery, 'country', searchParams);

            case 5:
              _context6.t1 = _context6.sent;
              searchResultA = (0, _context6.t0)(_context6.t1);
              searchParams = searchResultA.params;
              _context6.t2 = _AppProviderTypes.unsafeUnwrap;
              _context6.next = 11;
              return searchApi.searchForResourceInGroup(searchQuery, 'country', searchParams);

            case 11:
              _context6.t3 = _context6.sent;
              searchResultB = (0, _context6.t2)(_context6.t3);
              //Assert
              assert.equal(searchResultA.results.length, 2);
              assert.equal(searchResultB.results.length, 2);

            case 15:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    })));
    this.afterAll(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee7() {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00001").delete();

            case 2:
              _context7.next = 4;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00002").delete();

            case 4:
              _context7.next = 6;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00003").delete();

            case 6:
              _context7.next = 8;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00004").delete();

            case 8:
              _context7.next = 10;
              return _SearchApi.SearchApi.resourceCol(firestore, orgId).doc("00005").delete();

            case 10:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    })));
  });
  describe('ShortId', function () {
    var firestore = new _mockCloudFirestore.default({}).firestore();
    var searchApi = new _SearchApi.SearchApi(firestore, orgId);
    this.beforeAll(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee8() {
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _SearchApi.SearchApi.shortIdCol(firestore, orgId).doc("000100001").set(_objectSpread({}, _model.DefaultShortId, {
                id: '000100001',
                shortId: '000100001'
              }));

            case 2:
              _context8.next = 4;
              return _SearchApi.SearchApi.shortIdCol(firestore, orgId).doc("000100002").set(_objectSpread({}, _model.DefaultShortId, {
                id: '000100002',
                shortId: '000100002'
              }));

            case 4:
              _context8.next = 6;
              return _SearchApi.SearchApi.shortIdCol(firestore, orgId).doc("000100003").set(_objectSpread({}, _model.DefaultShortId, {
                id: '000100003',
                shortId: '000100003'
              }));

            case 6:
              _context8.next = 8;
              return _SearchApi.SearchApi.shortIdCol(firestore, orgId).doc("000100004").set(_objectSpread({}, _model.DefaultShortId, {
                id: '000100004',
                shortId: '000100004'
              }));

            case 8:
              _context8.next = 10;
              return _SearchApi.SearchApi.shortIdCol(firestore, orgId).get();

            case 10:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    })));
    it('transforms shortId strings into valid shortId lookup ranges', function () {
      var inputs = ["100-000", "100--000", "100 100 000 ", "100", "1001", "00010001"];
      var expected = [["000100000", "000100000"], ["000100000", "000100000"], ["100100000", "100100000"], ["000100000", "000101000"], ["000100100", "000100200"], ["000100010", "000100020"]];
      inputs.forEach(function (input, idx) {
        return assert.deepEqual((0, _AppProviderTypes.unsafeUnwrap)(_SearchApi.SearchApi.rangeFromShortIdString(input)), expected[idx]);
      });
    });
    it('performs a basic search',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee9() {
      var shortId, result;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              //Arrange
              shortId = "100-001"; //Act

              _context9.t0 = _AppProviderTypes.unsafeUnwrap;
              _context9.next = 4;
              return searchApi.searchByShortId(shortId, {
                limit: 10
              });

            case 4:
              _context9.t1 = _context9.sent;
              result = (0, _context9.t0)(_context9.t1);
              //Assert
              assert.equal(result.results.length, 1);

            case 7:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }))); //Pagination doesn't work correctly for mock-cloud-firestore
    //This test passes against live firebase

    it.skip('performs a paginated search',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee10() {
      var query, searchParams, searchResultA, searchResultB;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              //Arrange
              //This test assumes onlt 4 shortIds
              query = "100";
              searchParams = {
                limit: 3
              }; //Act

              _context10.t0 = _AppProviderTypes.unsafeUnwrap;
              _context10.next = 5;
              return searchApi.searchByShortId(query, searchParams);

            case 5:
              _context10.t1 = _context10.sent;
              searchResultA = (0, _context10.t0)(_context10.t1);
              searchParams = searchResultA.params;
              _context10.t2 = _AppProviderTypes.unsafeUnwrap;
              _context10.next = 11;
              return searchApi.searchByShortId(query, searchParams);

            case 11:
              _context10.t3 = _context10.sent;
              searchResultB = (0, _context10.t2)(_context10.t3);
              //Assert
              assert.equal(searchResultA.results.length, 3);
              assert.equal(searchResultB.results.length, 1);

            case 15:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    })));
    this.afterAll(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee11() {
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _SearchApi.SearchApi.shortIdCol(firestore, orgId).doc("000100001").delete();

            case 2:
              _context11.next = 4;
              return _SearchApi.SearchApi.shortIdCol(firestore, orgId).doc("000100002").delete();

            case 4:
              _context11.next = 6;
              return _SearchApi.SearchApi.shortIdCol(firestore, orgId).doc("000100003").delete();

            case 6:
              _context11.next = 8;
              return _SearchApi.SearchApi.shortIdCol(firestore, orgId).doc("000100004").delete();

            case 8:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    })));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvU2VhcmNoQXBpLnVuaXQudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIm9yZ0lkIiwiZGVzY3JpYmUiLCJ0aW1lb3V0IiwiZmlyZXN0b3JlIiwiTW9ja0ZpcmVzdG9yZSIsInNlYXJjaEFwaSIsIlNlYXJjaEFwaSIsImJlZm9yZUFsbCIsInJlc291cmNlQ29sIiwiZG9jIiwic2V0IiwiRGVmYXVsdE15V2VsbFJlc291cmNlIiwiaWQiLCJncm91cHMiLCJjb3VudHJ5IiwicGluY29kZSIsIml0Iiwic2VhcmNoUXVlcnkiLCJ1bnNhZmVVbndyYXAiLCJzZWFyY2hGb3JSZXNvdXJjZUluR3JvdXAiLCJsaW1pdCIsInJlc3VsdCIsImFzc2VydCIsImVxdWFsIiwicmVzdWx0cyIsImxlbmd0aCIsInNraXAiLCJzZWFyY2hQYXJhbXMiLCJzZWFyY2hSZXN1bHRBIiwicGFyYW1zIiwic2VhcmNoUmVzdWx0QiIsImFmdGVyQWxsIiwiZGVsZXRlIiwic2hvcnRJZENvbCIsIkRlZmF1bHRTaG9ydElkIiwic2hvcnRJZCIsImdldCIsImlucHV0cyIsImV4cGVjdGVkIiwiZm9yRWFjaCIsImlucHV0IiwiaWR4IiwiZGVlcEVxdWFsIiwicmFuZ2VGcm9tU2hvcnRJZFN0cmluZyIsInNlYXJjaEJ5U2hvcnRJZCIsInF1ZXJ5Il0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7OztlQUtJQSxPQUFPLENBQUMseUJBQUQsQztJQURUQyxLLFlBQUFBLEs7O0FBSUZDLFFBQVEsQ0FBQyxZQUFELEVBQWUsWUFBWTtBQUNqQyxPQUFLQyxPQUFMLENBQWEsSUFBYjtBQUdBRCxFQUFBQSxRQUFRLENBQUMsUUFBRCxFQUFXLFlBQVk7QUFDN0IsUUFBTUUsU0FBb0IsR0FBRyxJQUFJQywyQkFBSixDQUFrQixFQUFsQixFQUFzQkQsU0FBdEIsRUFBN0I7QUFDQSxRQUFNRSxTQUFTLEdBQUcsSUFBSUMsb0JB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ICdhc3NlcnQnO1xuLy9AdHMtaWdub3JlXG5pbXBvcnQgTW9ja0ZpcmVzdG9yZSBmcm9tICdtb2NrLWNsb3VkLWZpcmVzdG9yZSc7XG5pbXBvcnQgeyBTZWFyY2hBcGksIFNlYXJjaFBhZ2VQYXJhbXMgfSBmcm9tICcuL1NlYXJjaEFwaSc7XG5pbXBvcnQgeyB1bnNhZmVVbndyYXAgfSBmcm9tICcuLi91dGlscy9BcHBQcm92aWRlclR5cGVzJztcbmltcG9ydCB7IGFkbWluIH0gZnJvbSAnLi4vdGVzdC9UZXN0RmlyZWJhc2UnO1xuaW1wb3J0IHsgRGVmYXVsdFNob3J0SWQsIERlZmF1bHRNeVdlbGxSZXNvdXJjZSB9IGZyb20gJy4uL21vZGVsJztcbnR5cGUgRmlyZXN0b3JlID0gYWRtaW4uZmlyZXN0b3JlLkZpcmVzdG9yZTtcblxuY29uc3Qge1xuICBvcmdJZCxcbn0gPSByZXF1aXJlKCcuLi90ZXN0L3Rlc3RDb25maWcuanNvbicpO1xuXG5cbmRlc2NyaWJlKCdTZWFyY2ggQXBpJywgZnVuY3Rpb24gKCkge1xuICB0aGlzLnRpbWVvdXQoNTAwMCk7XG5cblxuICBkZXNjcmliZSgnR3JvdXBzJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGZpcmVzdG9yZTogRmlyZXN0b3JlID0gbmV3IE1vY2tGaXJlc3RvcmUoe30pLmZpcmVzdG9yZSgpO1xuICAgIGNvbnN0IHNlYXJjaEFwaSA9IG5ldyBTZWFyY2hBcGkoZmlyZXN0b3JlLCBvcmdJZCk7XG5cbiAgICB0aGlzLmJlZm9yZUFsbChhc3luYyAoKSA9PiB7XG4gICAgICAvL1RPRE86IEFkZCBhIGJ1bmNoIG9mIHNob3J0SWRzXG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDFcIikuc2V0KHsuLi5EZWZhdWx0TXlXZWxsUmVzb3VyY2UsIGlkOiBcIjAwMDAxXCIsIGdyb3VwczogeyBjb3VudHJ5OiBcIklOXCIsIHBpbmNvZGU6IFwiMzEzNjAzXCJ9fSk7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDJcIikuc2V0KHsuLi5EZWZhdWx0TXlXZWxsUmVzb3VyY2UsIGlkOiBcIjAwMDAyXCIsIGdyb3VwczogeyBjb3VudHJ5OiBcIklOXCIsIHBpbmNvZGU6IFwiMzEzNjAzXCJ9fSk7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDNcIikuc2V0KHsuLi5EZWZhdWx0TXlXZWxsUmVzb3VyY2UsIGlkOiBcIjAwMDAzXCIsIGdyb3VwczogeyBjb3VudHJ5OiBcIkFVXCIsIHBpbmNvZGU6IFwiNTAxNlwifX0pO1xuICAgICAgYXdhaXQgU2VhcmNoQXBpLnJlc291cmNlQ29sKGZpcmVzdG9yZSwgb3JnSWQpLmRvYyhcIjAwMDA0XCIpLnNldCh7Li4uRGVmYXVsdE15V2VsbFJlc291cmNlLCBpZDogXCIwMDAwNFwiLCBncm91cHM6IHsgY291bnRyeTogXCJBVVwiLCBwaW5jb2RlOiBcIjUwNjNcIn19KTtcbiAgICAgIGF3YWl0IFNlYXJjaEFwaS5yZXNvdXJjZUNvbChmaXJlc3RvcmUsIG9yZ0lkKS5kb2MoXCIwMDAwNVwiKS5zZXQoey4uLkRlZmF1bHRNeVdlbGxSZXNvdXJjZSwgaWQ6IFwiMDAwMDVcIiwgZ3JvdXBzOiB7IGNvdW50cnk6IFwiSUxcIiwgcGluY29kZTogXCI1NTU1XCJ9fSk7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDZcIikuc2V0KHsuLi5EZWZhdWx0TXlXZWxsUmVzb3VyY2UsIGlkOiBcIjAwMDA2XCIsIGdyb3VwczogeyBjb3VudHJ5OiBcIklMXCIsIHBpbmNvZGU6IFwiMzEzNjA0XCJ9fSk7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDdcIikuc2V0KHsuLi5EZWZhdWx0TXlXZWxsUmVzb3VyY2UsIGlkOiBcIjAwMDA3XCIsIGdyb3VwczogeyBjb3VudHJ5OiBcIklMXCIsIHBpbmNvZGU6IFwiMzEzNjA1XCJ9fSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2VhcmNoZXMgZm9yIHJlc291cmNlcyB3aXRoaW4gdGhlIHBpbmNvZGUgZ3JvdXAnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBzZWFyY2hRdWVyeSA9IFwiMzEzXCI7XG5cbiAgICAgIC8vQWN0XG4gICAgICBjb25zdCByZXN1bHQgPSB1bnNhZmVVbndyYXAoYXdhaXQgc2VhcmNoQXBpLnNlYXJjaEZvclJlc291cmNlSW5Hcm91cChzZWFyY2hRdWVyeSwgJ3BpbmNvZGUnLCB7IGxpbWl0OiAxMCB9KSk7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnJlc3VsdHMubGVuZ3RoLCA0KTtcbiAgICB9KTtcblxuICAgIGl0KCdzZWFyY2hlcyBmb3IgcmVzb3VyY2VzIHdpdGggYSBmdWxsIHBpbmNvZGUnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBzZWFyY2hRdWVyeSA9IFwiMzEzNjAzXCI7XG5cbiAgICAgIC8vQWN0XG4gICAgICBjb25zdCByZXN1bHQgPSB1bnNhZmVVbndyYXAoYXdhaXQgc2VhcmNoQXBpLnNlYXJjaEZvclJlc291cmNlSW5Hcm91cChzZWFyY2hRdWVyeSwgJ3BpbmNvZGUnLCB7IGxpbWl0OiAxMCB9KSk7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnJlc3VsdHMubGVuZ3RoLCAyKTtcbiAgICB9KTtcblxuICAgIGl0KCdzZWFyY2hlcyBmb3IgcmVzb3VyY2VzIHdpdGhpbiB0aGUgY291bnRyeSBncm91cCcsIGFzeW5jICgpID0+IHtcbiAgICAgIC8vIEFycmFuZ2VcbiAgICAgIGNvbnN0IHNlYXJjaFF1ZXJ5ID0gXCJJXCI7XG5cbiAgICAgIC8vQWN0XG4gICAgICBjb25zdCByZXN1bHQgPSB1bnNhZmVVbndyYXAoYXdhaXQgc2VhcmNoQXBpLnNlYXJjaEZvclJlc291cmNlSW5Hcm91cChzZWFyY2hRdWVyeSwgJ2NvdW50cnknLCB7IGxpbWl0OiAxMCB9KSk7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnJlc3VsdHMubGVuZ3RoLCA1KTtcbiAgICB9KTtcblxuICAgIGl0KCdzZWFyY2hlcyBmb3IgcmVzb3VyY2VzIHdpdGhpbiB0aGUgY291bnRyeSBncm91cCB3aXRoIGFuIGV4YWN0IG1hdGNoJywgYXN5bmMgKCkgPT4ge1xuICAgICAgLy8gQXJyYW5nZVxuICAgICAgY29uc3Qgc2VhcmNoUXVlcnkgPSBcIklMXCI7XG5cbiAgICAgIC8vQWN0XG4gICAgICBjb25zdCByZXN1bHQgPSB1bnNhZmVVbndyYXAoYXdhaXQgc2VhcmNoQXBpLnNlYXJjaEZvclJlc291cmNlSW5Hcm91cChzZWFyY2hRdWVyeSwgJ2NvdW50cnknLCB7IGxpbWl0OiAxMCB9KSk7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnJlc3VsdHMubGVuZ3RoLCAzKTtcbiAgICB9KTtcblxuICAgIC8vUGFnaW5hdGlvbiBkb2Vzbid0IHdvcmsgY29ycmVjdGx5IGZvciBtb2NrLWNsb3VkLWZpcmVzdG9yZVxuICAgIC8vVGhpcyB0ZXN0IHBhc3NlcyBhZ2FpbnN0IGxpdmUgZmlyZWJhc2VcbiAgICBpdC5za2lwKCdwYWdpbmF0ZXMgY29ycmVjdGx5JywgYXN5bmMgKCkgPT4ge1xuICAgICAgLy8gQXJyYW5nZVxuICAgICAgY29uc3Qgc2VhcmNoUXVlcnkgPSBcIklcIjtcbiAgICAgIGxldCBzZWFyY2hQYXJhbXM6IFNlYXJjaFBhZ2VQYXJhbXMgPSB7IGxpbWl0OiAyIH07XG5cblxuICAgICAgLy9BY3RcbiAgICAgIGNvbnN0IHNlYXJjaFJlc3VsdEEgPSB1bnNhZmVVbndyYXAoYXdhaXQgc2VhcmNoQXBpLnNlYXJjaEZvclJlc291cmNlSW5Hcm91cChzZWFyY2hRdWVyeSwgJ2NvdW50cnknLCBzZWFyY2hQYXJhbXMpKTtcbiAgICAgIHNlYXJjaFBhcmFtcyA9IHNlYXJjaFJlc3VsdEEucGFyYW1zO1xuICAgICAgY29uc3Qgc2VhcmNoUmVzdWx0QiA9IHVuc2FmZVVud3JhcChhd2FpdCBzZWFyY2hBcGkuc2VhcmNoRm9yUmVzb3VyY2VJbkdyb3VwKHNlYXJjaFF1ZXJ5LCAnY291bnRyeScsIHNlYXJjaFBhcmFtcykpO1xuXG4gICAgICAvL0Fzc2VydFxuICAgICAgYXNzZXJ0LmVxdWFsKHNlYXJjaFJlc3VsdEEucmVzdWx0cy5sZW5ndGgsIDIpO1xuICAgICAgYXNzZXJ0LmVxdWFsKHNlYXJjaFJlc3VsdEIucmVzdWx0cy5sZW5ndGgsIDIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5hZnRlckFsbChhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDFcIikuZGVsZXRlKCk7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDJcIikuZGVsZXRlKCk7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDNcIikuZGVsZXRlKCk7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDRcIikuZGVsZXRlKCk7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkucmVzb3VyY2VDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMDVcIikuZGVsZXRlKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdTaG9ydElkJywgZnVuY3Rpb24gKCkge1xuXG4gICAgY29uc3QgZmlyZXN0b3JlOiBGaXJlc3RvcmUgPSBuZXcgTW9ja0ZpcmVzdG9yZSh7fSkuZmlyZXN0b3JlKCk7XG4gICAgY29uc3Qgc2VhcmNoQXBpID0gbmV3IFNlYXJjaEFwaShmaXJlc3RvcmUsIG9yZ0lkKTtcblxuICAgIHRoaXMuYmVmb3JlQWxsKGFzeW5jICgpID0+IHtcbiAgICAgIC8vVE9ETzogQWRkIGEgYnVuY2ggb2Ygc2hvcnRJZHNcbiAgICAgIGF3YWl0IFNlYXJjaEFwaS5zaG9ydElkQ29sKGZpcmVzdG9yZSwgb3JnSWQpLmRvYyhcIjAwMDEwMDAwMVwiKS5zZXQoeyAuLi5EZWZhdWx0U2hvcnRJZCwgaWQ6ICcwMDAxMDAwMDEnLCBzaG9ydElkOiAnMDAwMTAwMDAxJ30pO1xuICAgICAgYXdhaXQgU2VhcmNoQXBpLnNob3J0SWRDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMTAwMDAyXCIpLnNldCh7IC4uLkRlZmF1bHRTaG9ydElkLCBpZDogJzAwMDEwMDAwMicsIHNob3J0SWQ6ICcwMDAxMDAwMDInfSk7XG4gICAgICBhd2FpdCBTZWFyY2hBcGkuc2hvcnRJZENvbChmaXJlc3RvcmUsIG9yZ0lkKS5kb2MoXCIwMDAxMDAwMDNcIikuc2V0KHsgLi4uRGVmYXVsdFNob3J0SWQsIGlkOiAnMDAwMTAwMDAzJywgc2hvcnRJZDogJzAwMDEwMDAwMyd9KTtcbiAgICAgIGF3YWl0IFNlYXJjaEFwaS5zaG9ydElkQ29sKGZpcmVzdG9yZSwgb3JnSWQpLmRvYyhcIjAwMDEwMDAwNFwiKS5zZXQoeyAuLi5EZWZhdWx0U2hvcnRJZCwgaWQ6ICcwMDAxMDAwMDQnLCBzaG9ydElkOiAnMDAwMTAwMDA0J30pO1xuXG4gICAgICBhd2FpdCBTZWFyY2hBcGkuc2hvcnRJZENvbChmaXJlc3RvcmUsIG9yZ0lkKS5nZXQoKTtcbiAgICB9KTtcblxuICAgIGl0KCd0cmFuc2Zvcm1zIHNob3J0SWQgc3RyaW5ncyBpbnRvIHZhbGlkIHNob3J0SWQgbG9va3VwIHJhbmdlcycsICgpID0+IHtcbiAgICAgIGNvbnN0IGlucHV0cyA9IFtcbiAgICAgICAgXCIxMDAtMDAwXCIsXG4gICAgICAgIFwiMTAwLS0wMDBcIixcbiAgICAgICAgXCIxMDAgMTAwIDAwMCBcIixcbiAgICAgICAgXCIxMDBcIixcbiAgICAgICAgXCIxMDAxXCIsXG4gICAgICAgIFwiMDAwMTAwMDFcIixcbiAgICAgIF07XG5cbiAgICAgIGNvbnN0IGV4cGVjdGVkID0gW1xuICAgICAgICBbXCIwMDAxMDAwMDBcIiwgXCIwMDAxMDAwMDBcIl0sXG4gICAgICAgIFtcIjAwMDEwMDAwMFwiLCBcIjAwMDEwMDAwMFwiXSxcbiAgICAgICAgW1wiMTAwMTAwMDAwXCIsIFwiMTAwMTAwMDAwXCJdLFxuICAgICAgICBbXCIwMDAxMDAwMDBcIiwgXCIwMDAxMDEwMDBcIl0sXG4gICAgICAgIFtcIjAwMDEwMDEwMFwiLCBcIjAwMDEwMDIwMFwiXSxcbiAgICAgICAgW1wiMDAwMTAwMDEwXCIsIFwiMDAwMTAwMDIwXCJdLFxuICAgICAgXTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goKGlucHV0LCBpZHgpID0+IGFzc2VydC5kZWVwRXF1YWwoXG4gICAgICAgIHVuc2FmZVVud3JhcChTZWFyY2hBcGkucmFuZ2VGcm9tU2hvcnRJZFN0cmluZyhpbnB1dCkpLCBcbiAgICAgICAgZXhwZWN0ZWRbaWR4XVxuICAgICAgKSk7XG4gICAgfSk7XG5cbiAgICBpdCgncGVyZm9ybXMgYSBiYXNpYyBzZWFyY2gnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvL0FycmFuZ2VcbiAgICAgIGNvbnN0IHNob3J0SWQgPSBcIjEwMC0wMDFcIjtcblxuICAgICAgLy9BY3RcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHVuc2FmZVVud3JhcChhd2FpdCBzZWFyY2hBcGkuc2VhcmNoQnlTaG9ydElkKHNob3J0SWQsIHtsaW1pdDogMTB9KSk7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnJlc3VsdHMubGVuZ3RoLCAxKTtcbiAgICB9KTtcblxuICAgIC8vUGFnaW5hdGlvbiBkb2Vzbid0IHdvcmsgY29ycmVjdGx5IGZvciBtb2NrLWNsb3VkLWZpcmVzdG9yZVxuICAgIC8vVGhpcyB0ZXN0IHBhc3NlcyBhZ2FpbnN0IGxpdmUgZmlyZWJhc2VcbiAgICBpdC5za2lwKCdwZXJmb3JtcyBhIHBhZ2luYXRlZCBzZWFyY2gnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvL0FycmFuZ2VcbiAgICAgIC8vVGhpcyB0ZXN0IGFzc3VtZXMgb25sdCA0IHNob3J0SWRzXG4gICAgICBjb25zdCBxdWVyeSA9IFwiMTAwXCI7XG4gICAgICBsZXQgc2VhcmNoUGFyYW1zOiBTZWFyY2hQYWdlUGFyYW1zID0geyBsaW1pdDogMyB9O1xuXG4gICAgICAvL0FjdFxuICAgICAgY29uc3Qgc2VhcmNoUmVzdWx0QSA9IHVuc2FmZVVud3JhcChhd2FpdCBzZWFyY2hBcGkuc2VhcmNoQnlTaG9ydElkKHF1ZXJ5LCBzZWFyY2hQYXJhbXMpKTtcbiAgICAgIHNlYXJjaFBhcmFtcyA9IHNlYXJjaFJlc3VsdEEucGFyYW1zO1xuICAgICAgY29uc3Qgc2VhcmNoUmVzdWx0QiA9IHVuc2FmZVVud3JhcChhd2FpdCBzZWFyY2hBcGkuc2VhcmNoQnlTaG9ydElkKHF1ZXJ5LCBzZWFyY2hQYXJhbXMpKTtcblxuICAgICAgLy9Bc3NlcnRcbiAgICAgIGFzc2VydC5lcXVhbChzZWFyY2hSZXN1bHRBLnJlc3VsdHMubGVuZ3RoLCAzKTtcbiAgICAgIGFzc2VydC5lcXVhbChzZWFyY2hSZXN1bHRCLnJlc3VsdHMubGVuZ3RoLCAxKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWZ0ZXJBbGwoYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgU2VhcmNoQXBpLnNob3J0SWRDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMTAwMDAxXCIpLmRlbGV0ZSgpO1xuICAgICAgYXdhaXQgU2VhcmNoQXBpLnNob3J0SWRDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMTAwMDAyXCIpLmRlbGV0ZSgpO1xuICAgICAgYXdhaXQgU2VhcmNoQXBpLnNob3J0SWRDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMTAwMDAzXCIpLmRlbGV0ZSgpO1xuICAgICAgYXdhaXQgU2VhcmNoQXBpLnNob3J0SWRDb2woZmlyZXN0b3JlLCBvcmdJZCkuZG9jKFwiMDAwMTAwMDA0XCIpLmRlbGV0ZSgpO1xuICAgIH0pO1xuICB9KTtcbn0pOyJdfQ==