"use strict";

require("mocha");

var assert = _interopRequireWildcard(require("assert"));

var _mockCloudFirestore = _interopRequireDefault(require("mock-cloud-firestore"));

var _ResourceApi = require("./ResourceApi");

var _model = require("../model");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../test/testConfig.json'),
    orgId = _require.orgId;

describe('Resource Api', function () {
  this.timeout(5000);
  var firestore = new _mockCloudFirestore.default({}).firestore();
  var resourceApi = new _ResourceApi.ResourceApi(firestore, orgId);
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
            return resourceApi.resourceRef("00001").set(_objectSpread({}, _model.DefaultResource, {
              id: "00001",
              groups: {
                country: "IN",
                pincode: "313603"
              }
            }));

          case 2:
            _context.next = 4;
            return resourceApi.resourceRef("00002").set(_objectSpread({}, _model.DefaultResource, {
              id: "00002",
              groups: {
                country: "IN",
                pincode: "313603"
              }
            }));

          case 4:
            _context.next = 6;
            return resourceApi.resourceRef("00003").set(_objectSpread({}, _model.DefaultResource, {
              id: "00003",
              groups: {
                country: "IN",
                pincode: "313603"
              }
            }));

          case 6:
            _context.next = 8;
            return resourceApi.resourceRef("00004").set(_objectSpread({}, _model.DefaultResource, {
              id: "00004",
              groups: {
                country: "IN",
                pincode: "313603"
              }
            }));

          case 8:
            _context.next = 10;
            return resourceApi.resourceRef("00005").set(_objectSpread({}, _model.DefaultResource, {
              id: "00005",
              groups: {
                country: "IN",
                pincode: "313603"
              }
            }));

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it('gets a resource for an id',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var resourceId, resource;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            //Arrange
            resourceId = "00001"; //Act

            _context2.t0 = _utils.unsafeUnwrap;
            _context2.next = 4;
            return resourceApi.getResourceForId(resourceId);

          case 4:
            _context2.t1 = _context2.sent;
            resource = (0, _context2.t0)(_context2.t1);
            //Assert
            assert.equal(resource.id, resourceId);

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
  it('gets a list of resources from a list of ids',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var resourceIds, resources;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            //Arrange
            resourceIds = ["00001", "00002", "00003", "00005"]; //Act

            _context3.t0 = _utils.unsafeUnwrap;
            _context3.next = 4;
            return resourceApi.getResourcesForIds(resourceIds);

          case 4:
            _context3.t1 = _context3.sent;
            resources = (0, _context3.t0)(_context3.t1);
            //Assert
            assert.equal(resources.length, resourceIds.length);

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
  this.afterAll(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return resourceApi.resourceRef("00001").delete();

          case 2:
            _context4.next = 4;
            return resourceApi.resourceRef("00002").delete();

          case 4:
            _context4.next = 6;
            return resourceApi.resourceRef("00003").delete();

          case 6:
            _context4.next = 8;
            return resourceApi.resourceRef("00004").delete();

          case 8:
            _context4.next = 10;
            return resourceApi.resourceRef("00005").delete();

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  })));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvUmVzb3VyY2VBcGkudW5pdC50cyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwib3JnSWQiLCJkZXNjcmliZSIsInRpbWVvdXQiLCJmaXJlc3RvcmUiLCJNb2NrRmlyZXN0b3JlIiwicmVzb3VyY2VBcGkiLCJSZXNvdXJjZUFwaSIsImJlZm9yZUFsbCIsInJlc291cmNlUmVmIiwic2V0IiwiRGVmYXVsdFJlc291cmNlIiwiaWQiLCJncm91cHMiLCJjb3VudHJ5IiwicGluY29kZSIsIml0IiwicmVzb3VyY2VJZCIsInVuc2FmZVVud3JhcCIsImdldFJlc291cmNlRm9ySWQiLCJyZXNvdXJjZSIsImFzc2VydCIsImVxdWFsIiwicmVzb3VyY2VJZHMiLCJnZXRSZXNvdXJjZXNGb3JJZHMiLCJyZXNvdXJjZXMiLCJsZW5ndGgiLCJhZnRlckFsbCIsImRlbGV0ZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFJQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7ZUFNSUEsT0FBTyxDQUFDLHlCQUFELEM7SUFEVEMsSyxZQUFBQSxLOztBQUlGQyxRQUFRLENBQUMsY0FBRCxFQUFpQixZQUFZO0FBQ25DLE9BQUtDLE9BQUwsQ0FBYSxJQUFiO0FBQ0EsTUFBTUMsU0FBb0IsR0FBRyxJQUFJQywyQkFBSixDQUFrQixFQUFsQixFQUFzQkQsU0FBdEIsRUFBN0I7QUFDQSxNQUFNRSxXQUFXLEdBQUcsSUFBSUMsd0JBQUosQ0FBZ0JILFNBQWhCLEVBQTJCSCxLQUEzQixDQUFwQjtBQUdBLE9BQUtPLFNBQUw7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQkFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFFUEYsV0FBVyxDQUFDRyxXQUFaLENBQXdCLE9BQXhCLEVBQWlDQyxHQUFqQyxtQkFBMENDLHNCQUExQztBQUEyREMsY0FBQUEsRUFBRSxFQUFFLE9BQS9EO0FBQXdFQyxjQUFBQSxNQUFNLEVBQUU7QUFBRUMsZ0JBQUFBLE9B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RyxXQUFaLENBQXdCLE9BQXhCLEVBQWlDbUIsTUFBakMsRUFGTTs7QUFBQTtBQUFBO0FBQUEsbUJBR050QixXQUFXLENBQUNHLFdBQVosQ0FBd0IsT0FBeEIsRUFBaUNtQixNQUFqQyxFQUhNOztBQUFBO0FBQUE7QUFBQSxtQkFJTnRCLFdBQVcsQ0FBQ0csV0FBWixDQUF3QixPQUF4QixFQUFpQ21CLE1BQWpDLEVBSk07O0FBQUE7QUFBQTtBQUFBLG1CQUtOdEIsV0FBVyxDQUFDRyxXQUFaLENBQXdCLE9BQXhCLEVBQWlDbUIsTUFBakMsRUFMTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFkO0FBT0QsQ0FsRE8sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnbW9jaGEnO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG4vL0B0cy1pZ25vcmVcbmltcG9ydCBNb2NrRmlyZXN0b3JlIGZyb20gJ21vY2stY2xvdWQtZmlyZXN0b3JlJztcbmltcG9ydCB7IFJlc291cmNlQXBpIH0gZnJvbSAnLi9SZXNvdXJjZUFwaSc7XG4vLyBpbXBvcnQgeyBTZWFyY2hBcGksIFNlYXJjaFBhZ2VQYXJhbXMgfSBmcm9tICcuL1NlYXJjaEFwaSc7XG4vLyBpbXBvcnQgeyB1bnNhZmVVbndyYXAgfSBmcm9tICcuLi91dGlscy9BcHBQcm92aWRlclR5cGVzJztcbmltcG9ydCB7IGFkbWluIH0gZnJvbSAnLi4vdGVzdC9UZXN0RmlyZWJhc2UnO1xuaW1wb3J0IHsgRGVmYXVsdFJlc291cmNlIH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHsgdW5zYWZlVW53cmFwIH0gZnJvbSAnLi4vdXRpbHMnO1xuLy8gaW1wb3J0IHsgRGVmYXVsdFNob3J0SWQsIERlZmF1bHRNeVdlbGxSZXNvdXJjZSB9IGZyb20gJy4uL21vZGVsJztcbnR5cGUgRmlyZXN0b3JlID0gYWRtaW4uZmlyZXN0b3JlLkZpcmVzdG9yZTtcblxuY29uc3Qge1xuICBvcmdJZCxcbn0gPSByZXF1aXJlKCcuLi90ZXN0L3Rlc3RDb25maWcuanNvbicpO1xuXG5cbmRlc2NyaWJlKCdSZXNvdXJjZSBBcGknLCBmdW5jdGlvbiAoKSB7XG4gIHRoaXMudGltZW91dCg1MDAwKTtcbiAgY29uc3QgZmlyZXN0b3JlOiBGaXJlc3RvcmUgPSBuZXcgTW9ja0ZpcmVzdG9yZSh7fSkuZmlyZXN0b3JlKCk7XG4gIGNvbnN0IHJlc291cmNlQXBpID0gbmV3IFJlc291cmNlQXBpKGZpcmVzdG9yZSwgb3JnSWQpO1xuXG5cbiAgdGhpcy5iZWZvcmVBbGwoYXN5bmMgKCkgPT4ge1xuICAgIC8vVE9ETzogQWRkIGEgYnVuY2ggb2Ygc2hvcnRJZHNcbiAgICBhd2FpdCByZXNvdXJjZUFwaS5yZXNvdXJjZVJlZihcIjAwMDAxXCIpLnNldCh7IC4uLkRlZmF1bHRSZXNvdXJjZSwgaWQ6IFwiMDAwMDFcIiwgZ3JvdXBzOiB7IGNvdW50cnk6IFwiSU5cIiwgcGluY29kZTogXCIzMTM2MDNcIiB9IH0pO1xuICAgIGF3YWl0IHJlc291cmNlQXBpLnJlc291cmNlUmVmKFwiMDAwMDJcIikuc2V0KHsgLi4uRGVmYXVsdFJlc291cmNlLCBpZDogXCIwMDAwMlwiLCBncm91cHM6IHsgY291bnRyeTogXCJJTlwiLCBwaW5jb2RlOiBcIjMxMzYwM1wiIH0gfSk7XG4gICAgYXdhaXQgcmVzb3VyY2VBcGkucmVzb3VyY2VSZWYoXCIwMDAwM1wiKS5zZXQoeyAuLi5EZWZhdWx0UmVzb3VyY2UsIGlkOiBcIjAwMDAzXCIsIGdyb3VwczogeyBjb3VudHJ5OiBcIklOXCIsIHBpbmNvZGU6IFwiMzEzNjAzXCIgfSB9KTtcbiAgICBhd2FpdCByZXNvdXJjZUFwaS5yZXNvdXJjZVJlZihcIjAwMDA0XCIpLnNldCh7IC4uLkRlZmF1bHRSZXNvdXJjZSwgaWQ6IFwiMDAwMDRcIiwgZ3JvdXBzOiB7IGNvdW50cnk6IFwiSU5cIiwgcGluY29kZTogXCIzMTM2MDNcIiB9IH0pO1xuICAgIGF3YWl0IHJlc291cmNlQXBpLnJlc291cmNlUmVmKFwiMDAwMDVcIikuc2V0KHsgLi4uRGVmYXVsdFJlc291cmNlLCBpZDogXCIwMDAwNVwiLCBncm91cHM6IHsgY291bnRyeTogXCJJTlwiLCBwaW5jb2RlOiBcIjMxMzYwM1wiIH0gfSk7XG4gIH0pO1xuXG5cbiAgaXQoJ2dldHMgYSByZXNvdXJjZSBmb3IgYW4gaWQnLCBhc3luYyAoKSA9PiB7XG4gICAgLy9BcnJhbmdlXG4gICAgY29uc3QgcmVzb3VyY2VJZCA9IFwiMDAwMDFcIjtcblxuICAgIC8vQWN0XG4gICAgY29uc3QgcmVzb3VyY2UgPSB1bnNhZmVVbndyYXAoYXdhaXQgcmVzb3VyY2VBcGkuZ2V0UmVzb3VyY2VGb3JJZChyZXNvdXJjZUlkKSk7XG5cbiAgICAvL0Fzc2VydFxuICAgIGFzc2VydC5lcXVhbChyZXNvdXJjZS5pZCwgcmVzb3VyY2VJZCk7XG4gIH0pO1xuXG4gIGl0KCdnZXRzIGEgbGlzdCBvZiByZXNvdXJjZXMgZnJvbSBhIGxpc3Qgb2YgaWRzJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vQXJyYW5nZVxuICAgIGNvbnN0IHJlc291cmNlSWRzID0gW1xuICAgICAgXCIwMDAwMVwiLCBcbiAgICAgIFwiMDAwMDJcIiwgXG4gICAgICBcIjAwMDAzXCIsIFxuICAgICAgXCIwMDAwNVwiLCBcbiAgICBdXG5cbiAgICAvL0FjdFxuICAgIGNvbnN0IHJlc291cmNlcyA9IHVuc2FmZVVud3JhcChhd2FpdCByZXNvdXJjZUFwaS5nZXRSZXNvdXJjZXNGb3JJZHMocmVzb3VyY2VJZHMpKTtcblxuICAgIC8vQXNzZXJ0XG4gICAgYXNzZXJ0LmVxdWFsKHJlc291cmNlcy5sZW5ndGgsIHJlc291cmNlSWRzLmxlbmd0aCk7XG4gIH0pO1xuXG4gIHRoaXMuYWZ0ZXJBbGwoYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IHJlc291cmNlQXBpLnJlc291cmNlUmVmKFwiMDAwMDFcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVzb3VyY2VBcGkucmVzb3VyY2VSZWYoXCIwMDAwMlwiKS5kZWxldGUoKTtcbiAgICBhd2FpdCByZXNvdXJjZUFwaS5yZXNvdXJjZVJlZihcIjAwMDAzXCIpLmRlbGV0ZSgpO1xuICAgIGF3YWl0IHJlc291cmNlQXBpLnJlc291cmNlUmVmKFwiMDAwMDRcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVzb3VyY2VBcGkucmVzb3VyY2VSZWYoXCIwMDAwNVwiKS5kZWxldGUoKTtcbiAgfSk7XG59KTsiXX0=