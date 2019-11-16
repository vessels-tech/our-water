"use strict";

require("mocha");

var assert = _interopRequireWildcard(require("assert"));

var _TestFirebase = require("../test/TestFirebase");

var _utils = require("../utils");

var _ReadingApi = require("./ReadingApi");

var _model = require("../model");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('../test/testConfig.json'),
    orgId = _require.orgId;

describe('Reading Api', function () {
  this.timeout(5000);
  var readingApi = new _ReadingApi.ReadingApi(_TestFirebase.firestore, orgId);
  var readings = [_objectSpread({}, _model.DefaultReading, {
    datetime: '2017-01-01T01:11:01Z',
    resourceId: "00001",
    timeseriesId: 'default'
  }), _objectSpread({}, _model.DefaultReading, {
    datetime: '2017-01-01T01:12:01Z',
    resourceId: "00001",
    timeseriesId: 'default'
  }), _objectSpread({}, _model.DefaultReading, {
    datetime: '2017-01-01T01:13:01Z',
    resourceId: "00002",
    timeseriesId: 'default'
  }), _objectSpread({}, _model.DefaultReading, {
    datetime: '2017-01-01T01:14:01Z',
    resourceId: "00002",
    timeseriesId: 'default'
  }), _objectSpread({}, _model.DefaultReading, {
    datetime: '2017-01-01T01:15:01Z',
    resourceId: "00003",
    timeseriesId: 'default'
  }), _objectSpread({}, _model.DefaultReading, {
    datetime: '2017-01-01T01:16:01Z',
    resourceId: "00003",
    timeseriesId: 'default'
  }), _objectSpread({}, _model.DefaultReading, {
    datetime: '2017-01-01T01:17:01Z',
    value: 1,
    resourceId: "00004",
    timeseriesId: 'default'
  }), _objectSpread({}, _model.DefaultReading, {
    datetime: '2017-01-02T01:18:01Z',
    value: 2,
    resourceId: "00004",
    timeseriesId: 'default'
  }), _objectSpread({}, _model.DefaultReading, {
    datetime: '2017-01-03T01:19:01Z',
    value: 3,
    resourceId: "00004",
    timeseriesId: 'default'
  })]; // const readingIds = readings.map(r => ReadingApi.hashReadingId(r.resourceId, r.timeseriesId, new Date(r.datetime)));

  it('Saves many readings in a batch',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var batchSize, batchUploadResults;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            //Arrange
            batchSize = 3; //Act

            _context.t0 = _utils.unsafeUnwrap;
            _context.next = 4;
            return readingApi.bulkUploadReadings(readings, batchSize);

          case 4:
            _context.t1 = _context.sent;
            batchUploadResults = (0, _context.t0)(_context.t1);
            //Assert
            assert.equal(batchUploadResults.length, readings.length);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  this.afterAll(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvUmVhZGluZ0FwaS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJvcmdJZCIsImRlc2NyaWJlIiwidGltZW91dCIsInJlYWRpbmdBcGkiLCJSZWFkaW5nQXBpIiwiZmlyZXN0b3JlIiwicmVhZGluZ3MiLCJEZWZhdWx0UmVhZGluZyIsImRhdGV0aW1lIiwicmVzb3VyY2VJZCIsInRpbWVzZXJpZXNJZCIsInZhbHVlIiwiaXQiLCJiYXRjaFNpemUiLCJ1bnNhZmVVbndyYXAiLCJidWxrVXBsb2FkUmVhZGluZ3MiLCJiYXRjaFVwbG9hZFJlc3VsdHMiLCJhc3NlcnQiLCJlcXVhbCIsImxlbmd0aCIsImFmdGVyQWxsIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7ZUFJSUEsT0FBTyxDQUFDLHlCQUFELEM7SUFEVEMsSyxZQUFBQSxLOztBQUdGQyxRQUFRLENBQUMsYUFBRCxFQUFnQixZQUFZO0FBQ2xDLE9BQUtDLE9BQUwsQ0FBYSxJQUFiO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUlDLHNCQUFKLENBQWVDLHVCQUFmLEVBQTBCTCxLQUExQixDQUFuQjtBQUNBLE1BQU1NLFFBQW1CLEdBQUcsbUJBQ3JCQyxxQkFEcUI7QUFDTEMsSUFBQUEsUUFBUSxFQUFFLHNCQURMO0FBQzZCQyxJQUFBQSxVQUFVLEVBQUUsT0FEekM7QUFDa0RDLElBQUFBLFlBQVksRUFBRTtBQURoRSx3QkFFckJILHFCQUZxQjtBQUVMQyxJQUFBQSxRQUFRLEVBQUUsc0JBRkw7QUFFNkJDLElBQUFBLFVBQVUsRUFBRSxPQUZ6QztBQUVrREMsSUFBQUEsWUFBWSxFQUFFO0FBRmhFLHdCQUdyQkgscUJBSHFCO0FBR0xDLElBQUFBLFFBQVEsRUFBRSxzQkFITDtBQUc2QkMsSUFBQUEsVUFBVSxFQUFFLE9BSHpDO0FBR2tEQyxJQUFBQSxZQUFZLEVBQUU7QUFIaEUsd0JBSXJCSCxxQkFKcUI7QUFJTEMsSUFBQUEsUUFBUSxFQUFFLHNCQUpMO0FBSTZCQyxJQUFBQSxVQUFVLEVBQUUsT0FKekM7QUFJa0RDLElBQUFBLFlBQVksRUFBRTtBQUpoRSx3QkFLckJILHFCQUxxQjtBQUtMQyxJQUFBQSxRQUFRLEVBQUUsc0JBTEw7QUFLNkJDLElBQUFBLFVBQVUsRUFBRSxPQUx6QztBQUtrREMsSUFBQUEsWUFBWSxFQUFFO0FBTGhFLHdCQU1yQkgscUJBTnFCO0FBTUxDLElBQUFBLFFBQVEsRUFBRSxzQkFOTDtBQU02QkMsSUFBQUEsVUFBVSxFQUFFLE9BTnpDO0FBTWtEQyxJQUFBQSxZQUFZLEVBQUU7QUFOaEUsd0JBT3JCSCxxQkFQcUI7QUFPTEMsSUFBQUEsUUFBUSxFQUFFLHNCQVBMO0FBTzZCRyxJQUFBQSxLQUFLLEVBQUUsQ0FQcEM7QUFPdUNGLElBQUFBLFVBQVUsRUFBRSxPQVBuRDtBQU80REMsSUFBQUEsWUFBWSxFQUFFO0FBUDFFLHdCQVFyQkgscUJBUnFCO0FBUUxDLElBQUFBLFFBQVEsRUFBRSxzQkFSTDtBQVE2QkcsSUFBQUEsS0FBSyxFQUFFLENBUnBDO0FBUXVDRixJQUFBQSxVQUFVLEVBQUUsT0FSbkQ7QUFRNERDLElBQUFBLFlBQVksRUFBRTtBQVIxRSx3QkFTckJILHFCQVRxQjtBQVNMQyxJQUFBQSxRQUFRLEVBQUUsc0JBVEw7QUFTNkJHLElBQUFBLEtBQUssRUFBRSxDQVRwQztBQVN1Q0YsSUFBQUEsVUFBVSxFQUFFLE9BVG5EO0FBUzREQyxJQUFBQSxZQUFZLEVBQUU7QUFUMUUsS0FBNUIsQ0FIa0MsQ0FjbEM7O0FBRUFFLEVBQUFBLEVBQUUsQ0FBQyxnQ0FBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLDBCQUFtQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbkM7QUFFTUMsWUFBQUEsU0FINkIsR0FHakIsQ0FIaUIsRUFNbkM7O0FBTm1DLDBCQU9SQyxtQkFQUTtBQUFBO0FBQUEsbUJBT1dYLFVBQVUsQ0FBQ1ksa0JBQVgsQ0FBOEJULFFBQTlCLEVBQXdDTyxTQUF4QyxDQVBYOztBQUFBO0FBQUE7QUFPN0JHLFlBQUFBLGtCQVA2QjtBQVNuQztBQUNBQyxZQUFBQSxNQUFNLENBQUNDLEtBQVAsQ0FBYUYsa0JBQWtCLENBQUNHLE1BQWhDLEVBQXdDYixRQUFRLENBQUNhLE1BQWpEOztBQVZtQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFuQyxHQUFGO0FBZUEsT0FBS0MsUUFBTDtBQUFBO0FBQUE7QUFBQTtBQUFBLDBCQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBZDtBQUlELENBbkNPLENBQVIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ21vY2hhJztcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuLy9AdHMtaWdub3JlXG5pbXBvcnQgTW9ja0ZpcmVzdG9yZSBmcm9tICdtb2NrLWNsb3VkLWZpcmVzdG9yZSc7XG5pbXBvcnQgeyBmaXJlc3RvcmUgfSBmcm9tICcuLi90ZXN0L1Rlc3RGaXJlYmFzZSc7XG5pbXBvcnQgeyB1bnNhZmVVbndyYXAgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBSZWFkaW5nQXBpIH0gZnJvbSAnLi9SZWFkaW5nQXBpJztcbmltcG9ydCB7IFJlYWRpbmcsIERlZmF1bHRSZWFkaW5nIH0gZnJvbSAnLi4vbW9kZWwnO1xuXG5jb25zdCB7XG4gIG9yZ0lkLFxufSA9IHJlcXVpcmUoJy4uL3Rlc3QvdGVzdENvbmZpZy5qc29uJyk7XG5cbmRlc2NyaWJlKCdSZWFkaW5nIEFwaScsIGZ1bmN0aW9uICgpIHtcbiAgdGhpcy50aW1lb3V0KDUwMDApO1xuICBjb25zdCByZWFkaW5nQXBpID0gbmV3IFJlYWRpbmdBcGkoZmlyZXN0b3JlLCBvcmdJZCk7XG4gIGNvbnN0IHJlYWRpbmdzOiBSZWFkaW5nW10gPSBbXG4gICAgeyAuLi5EZWZhdWx0UmVhZGluZywgZGF0ZXRpbWU6ICcyMDE3LTAxLTAxVDAxOjExOjAxWicsIHJlc291cmNlSWQ6IFwiMDAwMDFcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCcgfSxcbiAgICB7IC4uLkRlZmF1bHRSZWFkaW5nLCBkYXRldGltZTogJzIwMTctMDEtMDFUMDE6MTI6MDFaJywgcmVzb3VyY2VJZDogXCIwMDAwMVwiLCB0aW1lc2VyaWVzSWQ6ICdkZWZhdWx0JyB9LFxuICAgIHsgLi4uRGVmYXVsdFJlYWRpbmcsIGRhdGV0aW1lOiAnMjAxNy0wMS0wMVQwMToxMzowMVonLCByZXNvdXJjZUlkOiBcIjAwMDAyXCIsIHRpbWVzZXJpZXNJZDogJ2RlZmF1bHQnIH0sXG4gICAgeyAuLi5EZWZhdWx0UmVhZGluZywgZGF0ZXRpbWU6ICcyMDE3LTAxLTAxVDAxOjE0OjAxWicsIHJlc291cmNlSWQ6IFwiMDAwMDJcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCcgfSxcbiAgICB7IC4uLkRlZmF1bHRSZWFkaW5nLCBkYXRldGltZTogJzIwMTctMDEtMDFUMDE6MTU6MDFaJywgcmVzb3VyY2VJZDogXCIwMDAwM1wiLCB0aW1lc2VyaWVzSWQ6ICdkZWZhdWx0JyB9LFxuICAgIHsgLi4uRGVmYXVsdFJlYWRpbmcsIGRhdGV0aW1lOiAnMjAxNy0wMS0wMVQwMToxNjowMVonLCByZXNvdXJjZUlkOiBcIjAwMDAzXCIsIHRpbWVzZXJpZXNJZDogJ2RlZmF1bHQnIH0sXG4gICAgeyAuLi5EZWZhdWx0UmVhZGluZywgZGF0ZXRpbWU6ICcyMDE3LTAxLTAxVDAxOjE3OjAxWicsIHZhbHVlOiAxLCByZXNvdXJjZUlkOiBcIjAwMDA0XCIsIHRpbWVzZXJpZXNJZDogJ2RlZmF1bHQnIH0sXG4gICAgeyAuLi5EZWZhdWx0UmVhZGluZywgZGF0ZXRpbWU6ICcyMDE3LTAxLTAyVDAxOjE4OjAxWicsIHZhbHVlOiAyLCByZXNvdXJjZUlkOiBcIjAwMDA0XCIsIHRpbWVzZXJpZXNJZDogJ2RlZmF1bHQnIH0sXG4gICAgeyAuLi5EZWZhdWx0UmVhZGluZywgZGF0ZXRpbWU6ICcyMDE3LTAxLTAzVDAxOjE5OjAxWicsIHZhbHVlOiAzLCByZXNvdXJjZUlkOiBcIjAwMDA0XCIsIHRpbWVzZXJpZXNJZDogJ2RlZmF1bHQnIH0sXG4gIF07XG4gIC8vIGNvbnN0IHJlYWRpbmdJZHMgPSByZWFkaW5ncy5tYXAociA9PiBSZWFkaW5nQXBpLmhhc2hSZWFkaW5nSWQoci5yZXNvdXJjZUlkLCByLnRpbWVzZXJpZXNJZCwgbmV3IERhdGUoci5kYXRldGltZSkpKTtcblxuICBpdCgnU2F2ZXMgbWFueSByZWFkaW5ncyBpbiBhIGJhdGNoJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vQXJyYW5nZVxuICAgIFxuICAgIGNvbnN0IGJhdGNoU2l6ZSA9IDM7XG5cblxuICAgIC8vQWN0XG4gICAgY29uc3QgYmF0Y2hVcGxvYWRSZXN1bHRzID0gdW5zYWZlVW53cmFwKGF3YWl0IHJlYWRpbmdBcGkuYnVsa1VwbG9hZFJlYWRpbmdzKHJlYWRpbmdzLCBiYXRjaFNpemUpKTtcblxuICAgIC8vQXNzZXJ0XG4gICAgYXNzZXJ0LmVxdWFsKGJhdGNoVXBsb2FkUmVzdWx0cy5sZW5ndGgsIHJlYWRpbmdzLmxlbmd0aClcbiAgfSk7XG5cblxuXG4gIHRoaXMuYWZ0ZXJBbGwoYXN5bmMgKCkgPT4ge1xuICAgIC8vRGVsZXRlIGFsbCByZWFkaW5nc1xuICAgIC8vIGF3YWl0IFByb21pc2UuYWxsKHJlYWRpbmdJZHMubWFwKGFzeW5jIGlkID0+IGF3YWl0IHJlYWRpbmdBcGkucmVhZGluZ0NvbCgpLmRvYyhpZCkuZGVsZXRlKCkpKVxuICB9KTtcbn0pOyJdfQ==