"use strict";

require("mocha");

var assert = _interopRequireWildcard(require("assert"));

var _model = require("../model");

var _ExportApi = require("./ExportApi");

var _firestore = require("@google-cloud/firestore");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// const {
//   orgId,
// } = require('../test/testConfig.json');
describe('Export Api', function () {
  this.timeout(5000); // const firestore: Firestore = new MockFirestore({}).firestore();

  this.beforeAll(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it('formats a reading with a tab',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var reading, format, expected, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            //Arrange
            reading = _objectSpread({}, _model.DefaultReading, {
              id: "00001"
            });
            format = _ExportApi.ExportFormat.TSV;
            expected = "00001\t2017-01-01T01:11:01Z\tno_resource_id\twell\tno_timeseries_id\t0\t\t\t"; //Act

            result = _ExportApi.ExportApi.formatReading(reading, format); //Assert

            assert.equal(result, expected);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
  it('formats a reading with a comma',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var reading, format, expected, result;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            //Arrange
            reading = _objectSpread({}, _model.DefaultReading, {
              id: "00001"
            });
            format = _ExportApi.ExportFormat.CSV;
            expected = "00001,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,"; //Act

            result = _ExportApi.ExportApi.formatReading(reading, format); //Assert

            assert.equal(result, expected);

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
  it('formats many readings',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var readings, format, expected, result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            //Arrange
            readings = [_objectSpread({}, _model.DefaultReading, {
              id: "00001"
            }), _objectSpread({}, _model.DefaultReading, {
              id: "00002"
            }), _objectSpread({}, _model.DefaultReading, {
              id: "00003"
            }), _objectSpread({}, _model.DefaultReading, {
              id: "00004"
            })];
            format = _ExportApi.ExportFormat.CSV;
            expected = "00001,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,\n00002,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,\n00003,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,\n00004,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,\n"; //Act

            result = _ExportApi.ExportApi.readingsToExport(readings, format); //Assert

            assert.equal(result, expected);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  })));
  it('deserializes a legacy timestamp correctly',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    var timestamp, reading, format, expected, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            //Arrange
            timestamp = new _firestore.Timestamp(1483233061, 0);
            reading = _objectSpread({}, _model.DefaultReading, {
              datetime: timestamp,
              id: "00001"
            });
            format = _ExportApi.ExportFormat.TSV;
            expected = "00001\t2017-01-01T01:11:01.000Z\tno_resource_id\twell\tno_timeseries_id\t0\t\t\t"; //Act
            // @ts-ignore

            result = _ExportApi.ExportApi.formatReading(reading, format); //Assert

            assert.equal(result, expected);

          case 6:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  })));
  this.afterAll(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6() {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  })));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvRXhwb3J0QXBpLnVuaXQudHMiXSwibmFtZXMiOlsiZGVzY3JpYmUiLCJ0aW1lb3V0IiwiYmVmb3JlQWxsIiwiaXQiLCJyZWFkaW5nIiwiRGVmYXVsdFJlYWRpbmciLCJpZCIsImZvcm1hdCIsIkV4cG9ydEZvcm1hdCIsIlRTViIsImV4cGVjdGVkIiwicmVzdWx0IiwiRXhwb3J0QXBpIiwiZm9ybWF0UmVhZGluZyIsImFzc2VydCIsImVxdWFsIiwiQ1NWIiwicmVhZGluZ3MiLCJyZWFkaW5nc1RvRXhwb3J0IiwidGltZXN0YW1wIiwiVGltZXN0YW1wIiwiZGF0ZXRpbWUiLCJhZnRlckFsbCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFJQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBR0FBLFFBQVEsQ0FBQyxZQUFELEVBQWUsWUFBWTtBQUNqQyxPQUFLQyxPQUFMLENBQWEsSUFBYixFQURpQyxDQUVqQzs7QUFFQSxPQUFLQyxTQUFMO0FBQUE7QUFBQTtBQUFBO0FBQUEsMEJBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFmO0FBS0FDLEVBQUFBLEVBQUUsQ0FBQyw4QkFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLDBCQUFpQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDakM7QUFDTUMsWUFBQUEsT0FGMkIscUJBRVpDLHFCQUZZO0FBRUlDLGNBQUFBLEVBQUUsRUFBRTtBQUZSO0FBRzNCQyxZQUFBQSxNQUgyQixHQUdsQkMsd0JBQWFDLEdBSEs7QUFJM0JDLFlBQUFBLFFBSjJCLG1GQU1qQzs7QUFDTUMsWUFBQUEsTUFQMkIsR0FPbEJDLHFCQUFVQyxhQUFWLENBQXdCVCxPQUF4QixFQUFpQ0csTUFBakMsQ0FQa0IsRUFTakM7O0FBQ0FPLFlBQUFBLE1BQU0sQ0FBQ0MsS0FBUCxDQUFhSixNQUFiLEVBQXFCRCxRQUFyQjs7QUFWaUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBakMsR0FBRjtBQWFBUCxFQUFBQSxFQUFFLENBQUMsZ0NBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQkFBbUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ25DO0FBQ01DLFlBQUFBLE9BRjZCLHFCQUVkQyxxQkFGYztBQUVFQyxjQUFBQSxFQUFFLEVBQUU7QUFGTjtBQUc3QkMsWUFBQUEsTUFINkIsR0FHcEJDLHdCQUFhUSxHQUhPO0FBSTdCTixZQUFBQSxRQUo2QiwyRUFNbkM7O0FBQ01DLFlBQUFBLE1BUDZCLEdBT3BCQyxxQkFBVUMsYUFBVixDQUF3QlQsT0FBeEIsRUFBaUNHLE1BQWpDLENBUG9CLEVBU25DOztBQUNBTyxZQUFBQSxNQUFNLENBQUNDLEtBQVAsQ0FBYUosTUFBYixFQUFxQkQsUUFBckI7O0FBVm1DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQW5DLEdBQUY7QUFhQVAsRUFBQUEsRUFBRSxDQUFDLHVCQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsMEJBQTBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMxQjtBQUNNYyxZQUFBQSxRQUZvQixHQUVULG1CQUNWWixxQkFEVTtBQUNNQyxjQUFBQSxFQUFFLEVBQUU7QUFEVixrQ0FFVkQscUJBRlU7QUFFTUMsY0FBQUEsRUFBRSxFQUFFO0FBRlYsa0NBR1ZELHFCQUhVO0FBR01DLGNBQUFBLEVBQUUsRUFBRTtBQUhWLGtDQUlWRCxxQkFKVTtBQUlNQyxjQUFBQSxFQUFFLEVBQUU7QUFKVixlQUZTO0FBUXBCQyxZQUFBQSxNQVJvQixHQVFYQyx3QkFBYVEsR0FSRjtBQVN0Qk4sWUFBQUEsUUFUc0IsK1JBZTFCOztBQUNNQyxZQUFBQSxNQWhCb0IsR0FnQlhDLHFCQUFVTSxnQkFBVixDQUEyQkQsUUFBM0IsRUFBcUNWLE1BQXJDLENBaEJXLEVBa0IxQjs7QUFDQU8sWUFBQUEsTUFBTSxDQUFDQyxLQUFQLENBQWFKLE1BQWIsRUFBcUJELFFBQXJCOztBQW5CMEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBMUIsR0FBRjtBQXNCQVAsRUFBQUEsRUFBRSxDQUFDLDJDQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsMEJBQThDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUM5QztBQUNNZ0IsWUFBQUEsU0FGd0MsR0FFNUIsSUFBSUMsb0JBQUosQ0FBYyxVQUFkLEVBQTBCLENBQTFCLENBRjRCO0FBR3hDaEIsWUFBQUEsT0FId0MscUJBR3pCQyxxQkFIeUI7QUFHVGdCLGNBQUFBLFFBQVEsRUFBRUYsU0FIRDtBQUdZYixjQUFBQSxFQUFFLEVBQUU7QUFIaEI7QUFJeENDLFlBQUFBLE1BSndDLEdBSS9CQyx3QkFBYUMsR0FKa0I7QUFLeENDLFlBQUFBLFFBTHdDLHVGQU85QztBQUNBOztBQUNNQyxZQUFBQSxNQVR3QyxHQVMvQkMscUJBQVVDLGFBQVYsQ0FBd0JULE9BQXhCLEVBQWlDRyxNQUFqQyxDQVQrQixFQVc5Qzs7QUFDQU8sWUFBQUEsTUFBTSxDQUFDQyxLQUFQLENBQWFKLE1BQWIsRUFBcUJELFFBQXJCOztBQVo4QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUE5QyxHQUFGO0FBZ0JBLE9BQUtZLFFBQUw7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQkFBYztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQWQ7QUFHRCxDQTVFTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdtb2NoYSc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0Jztcbi8vQHRzLWlnbm9yZVxuaW1wb3J0IE1vY2tGaXJlc3RvcmUgZnJvbSAnbW9jay1jbG91ZC1maXJlc3RvcmUnO1xuXG5pbXBvcnQgeyBEZWZhdWx0UmVhZGluZyB9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7IEV4cG9ydEFwaSwgRXhwb3J0Rm9ybWF0IH0gZnJvbSAnLi9FeHBvcnRBcGknO1xuaW1wb3J0IHsgVGltZXN0YW1wIH0gZnJvbSAnQGdvb2dsZS1jbG91ZC9maXJlc3RvcmUnO1xuXG4vLyBjb25zdCB7XG4vLyAgIG9yZ0lkLFxuLy8gfSA9IHJlcXVpcmUoJy4uL3Rlc3QvdGVzdENvbmZpZy5qc29uJyk7XG5cblxuZGVzY3JpYmUoJ0V4cG9ydCBBcGknLCBmdW5jdGlvbiAoKSB7XG4gIHRoaXMudGltZW91dCg1MDAwKTtcbiAgLy8gY29uc3QgZmlyZXN0b3JlOiBGaXJlc3RvcmUgPSBuZXcgTW9ja0ZpcmVzdG9yZSh7fSkuZmlyZXN0b3JlKCk7XG5cbiAgdGhpcy5iZWZvcmVBbGwoYXN5bmMgKCkgPT4ge1xuICBcbiAgfSk7XG5cblxuICBpdCgnZm9ybWF0cyBhIHJlYWRpbmcgd2l0aCBhIHRhYicsIGFzeW5jICgpID0+IHtcbiAgICAvL0FycmFuZ2VcbiAgICBjb25zdCByZWFkaW5nID0geyAuLi5EZWZhdWx0UmVhZGluZywgaWQ6IFwiMDAwMDFcIiB9O1xuICAgIGNvbnN0IGZvcm1hdCA9IEV4cG9ydEZvcm1hdC5UU1Y7XG4gICAgY29uc3QgZXhwZWN0ZWQgPSBgMDAwMDFcXHQyMDE3LTAxLTAxVDAxOjExOjAxWlxcdG5vX3Jlc291cmNlX2lkXFx0d2VsbFxcdG5vX3RpbWVzZXJpZXNfaWRcXHQwXFx0XFx0XFx0YDtcblxuICAgIC8vQWN0XG4gICAgY29uc3QgcmVzdWx0ID0gRXhwb3J0QXBpLmZvcm1hdFJlYWRpbmcocmVhZGluZywgZm9ybWF0KTtcbiAgICBcbiAgICAvL0Fzc2VydFxuICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIGV4cGVjdGVkKTtcbiAgfSk7XG5cbiAgaXQoJ2Zvcm1hdHMgYSByZWFkaW5nIHdpdGggYSBjb21tYScsIGFzeW5jICgpID0+IHtcbiAgICAvL0FycmFuZ2VcbiAgICBjb25zdCByZWFkaW5nID0geyAuLi5EZWZhdWx0UmVhZGluZywgaWQ6IFwiMDAwMDFcIiB9O1xuICAgIGNvbnN0IGZvcm1hdCA9IEV4cG9ydEZvcm1hdC5DU1Y7XG4gICAgY29uc3QgZXhwZWN0ZWQgPSBgMDAwMDEsMjAxNy0wMS0wMVQwMToxMTowMVosbm9fcmVzb3VyY2VfaWQsd2VsbCxub190aW1lc2VyaWVzX2lkLDAsLCxgO1xuXG4gICAgLy9BY3RcbiAgICBjb25zdCByZXN1bHQgPSBFeHBvcnRBcGkuZm9ybWF0UmVhZGluZyhyZWFkaW5nLCBmb3JtYXQpO1xuICAgIFxuICAgIC8vQXNzZXJ0XG4gICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgZXhwZWN0ZWQpO1xuICB9KTtcblxuICBpdCgnZm9ybWF0cyBtYW55IHJlYWRpbmdzJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vQXJyYW5nZVxuICAgIGNvbnN0IHJlYWRpbmdzID0gW1xuICAgICAgeyAuLi5EZWZhdWx0UmVhZGluZywgaWQ6IFwiMDAwMDFcIiB9LFxuICAgICAgeyAuLi5EZWZhdWx0UmVhZGluZywgaWQ6IFwiMDAwMDJcIiB9LFxuICAgICAgeyAuLi5EZWZhdWx0UmVhZGluZywgaWQ6IFwiMDAwMDNcIiB9LFxuICAgICAgeyAuLi5EZWZhdWx0UmVhZGluZywgaWQ6IFwiMDAwMDRcIiB9LFxuICAgIF1cbiAgICBjb25zdCBmb3JtYXQgPSBFeHBvcnRGb3JtYXQuQ1NWO1xuICBjb25zdCBleHBlY3RlZCA9IGAwMDAwMSwyMDE3LTAxLTAxVDAxOjExOjAxWixub19yZXNvdXJjZV9pZCx3ZWxsLG5vX3RpbWVzZXJpZXNfaWQsMCwsLFxuMDAwMDIsMjAxNy0wMS0wMVQwMToxMTowMVosbm9fcmVzb3VyY2VfaWQsd2VsbCxub190aW1lc2VyaWVzX2lkLDAsLCxcbjAwMDAzLDIwMTctMDEtMDFUMDE6MTE6MDFaLG5vX3Jlc291cmNlX2lkLHdlbGwsbm9fdGltZXNlcmllc19pZCwwLCwsXG4wMDAwNCwyMDE3LTAxLTAxVDAxOjExOjAxWixub19yZXNvdXJjZV9pZCx3ZWxsLG5vX3RpbWVzZXJpZXNfaWQsMCwsLFxuYFxuXG4gICAgLy9BY3RcbiAgICBjb25zdCByZXN1bHQgPSBFeHBvcnRBcGkucmVhZGluZ3NUb0V4cG9ydChyZWFkaW5ncywgZm9ybWF0KTtcbiAgICBcbiAgICAvL0Fzc2VydFxuICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIGV4cGVjdGVkKTtcbiAgfSk7XG5cbiAgaXQoJ2Rlc2VyaWFsaXplcyBhIGxlZ2FjeSB0aW1lc3RhbXAgY29ycmVjdGx5JywgYXN5bmMgKCkgPT4ge1xuICAgIC8vQXJyYW5nZVxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBUaW1lc3RhbXAoMTQ4MzIzMzA2MSwgMCk7XG4gICAgY29uc3QgcmVhZGluZyA9IHsgLi4uRGVmYXVsdFJlYWRpbmcsIGRhdGV0aW1lOiB0aW1lc3RhbXAsIGlkOiBcIjAwMDAxXCIgfTtcbiAgICBjb25zdCBmb3JtYXQgPSBFeHBvcnRGb3JtYXQuVFNWO1xuICAgIGNvbnN0IGV4cGVjdGVkID0gYDAwMDAxXFx0MjAxNy0wMS0wMVQwMToxMTowMS4wMDBaXFx0bm9fcmVzb3VyY2VfaWRcXHR3ZWxsXFx0bm9fdGltZXNlcmllc19pZFxcdDBcXHRcXHRcXHRgO1xuXG4gICAgLy9BY3RcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgcmVzdWx0ID0gRXhwb3J0QXBpLmZvcm1hdFJlYWRpbmcocmVhZGluZywgZm9ybWF0KTtcblxuICAgIC8vQXNzZXJ0XG4gICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgZXhwZWN0ZWQpO1xuXG4gIH0pO1xuXG4gIHRoaXMuYWZ0ZXJBbGwoYXN5bmMgKCkgPT4ge1xuICAgXG4gIH0pO1xufSk7Il19