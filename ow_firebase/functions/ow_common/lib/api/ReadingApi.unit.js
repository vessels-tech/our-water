"use strict";

require("mocha");

var assert = _interopRequireWildcard(require("assert"));

var _mockCloudFirestore = _interopRequireDefault(require("mock-cloud-firestore"));

var _model = require("../model");

var _utils = require("../utils");

var _ReadingApi = require("./ReadingApi");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../test/testConfig.json'),
    orgId = _require.orgId;

describe('Reading Api', function () {
  this.timeout(5000);
  var firestore = new _mockCloudFirestore.default({}).firestore();
  var readingApi = new _ReadingApi.ReadingApi(firestore, orgId);
  var base64Image = "iVBORw0KGgoAAAANSUhEUgAAACoAAAAiCAYAAAApkEs2AAAMJmlDQ1BJQ0MgUHJvZmlsZQAASImVlwdUk8kWgOcvqSS0QASkhN4EKdKl1wgCUgUbIQkklBgSgogdWVRwLaiIYEVXRWxrAWSxYS + LYO8PRVCUdbFgQ + VNEkBXz3vvvHvO / P + XO3fu3Hsz / 5wZANSiOWJxFqoOQLYoVxITGsCamJTMInUABKBAA + iD0RyuVOwfHR0BoAy9 / ynvbkJrKNfs5L5 + 7v + vosHjS7kAINGQU3lSbjbkQwDgrlyxJBcAQg / Um87IFUMmwiiBlgQGCNlMzulKdpdzqpIjFDZxMYGQUwAg0zgcSToAqvK4WHncdOhHdSlkBxFPKILcBNmHK + DwIH + GPCo7ezpkNSvIVqnf + Un / h8 / UYZ8cTvowK3NRCDlIKBVncWb + n + X435KdJRuawxQ2mkASFiPPWV63zOnhcqZBPi9KjYyCrAn5upCnsJdzl0AWFj9o / 4ErDYQ1A0wAUBqPExQOWR + yiSgrMmJQ75MmDGFDhrVH44S57DjlWJQnmR4z6B / N50uDY4eYI1HMJbcpkWXG + w / 63Cjgs4d8NhYI4hKVcaKtecKESMiqkO9LM2PDB22eFwgCI4dsJLIYeczwP8dAmiQkRmmDmWVLh / LCPAVCduQgR + QK4sKUY7GpXI4iNh3IGXzpxIihOHn8oGBlXlghXxQ / GD9WJs4NiBm03ybOih60x5r4WaFyvQnkFmle7NDY3ly42JT54kCcGx2njA3XyuCMi1bGgNuACBAIggALyGBLBdNBBhC29NT3wF / KnhDAARKQDvjAblAzNCJR0SOCz1hQAP6CxAfS4XEBil4 + yIP6L8Na5dMOpCl68xQjMkEX5GwQDrLgb5lilGh4tgTwBGqEP83OhbFmwSbv + 0nHUhvSEYOJQcQwYgjRGtfDfXAvPAI + /WBzwt1xj6G4vtkTughthMeEG4R2wp1pwkLJD5GzwHjQDmMMGcwu9fvscAvo1QUPwL2hf+gbZ+J6wA4fA2fyx33h3C5Q+32ssuGMv9Vy0BfFgYJSRlD8KFY/RqBqo + oy7EVeqe9roYwrdbhagcM9P + YR + F39ePAd / qMlthg7iJ3DTmIXsCasHrCw41gDdhk7KufhtfFEsTaGZotRxJMJ / Qh / mo8zOKe8alKHWoduh8 + DfSCXn58r / 1gCp4tnSoTpglyWP9yt + Sy2iGs / iuXk4OgBgHzvV24tb5iKPR1hXvymyzkBgEcJVKZ / 03HgHnSkCwDGu28609dw2a8A4GgrVybJU + pw + YMAqEANfim6wBDuXVYwIyfgCryAHwgG40AUiANJYCqsswCuUwmYAWaDBaAYlIIVYA2oBJvAVrAT7AEHQD1oAifBWXAJtIIb4B5cK53gBegF70A / giAkhI4wEF3ECDFHbBEnxB3xQYKRCCQGSUJSkHREhMiQ2chCpBQpQyqRLUgN8jtyBDmJXEDakDvII6QbeY18QjGUhmqhBqgFOhp1R / 3RcDQOnYKmozloAVqELkMr0Gp0N1qHnkQvoTfQdvQF2ocBTAVjYsaYHeaOBWJRWDKWhkmwuVgJVo5VY3uxRvhPX8PasR7sI07EGTgLt4PrNQyPx7l4Dj4XX4pX4jvxOvw0fg1 / hPfiXwl0gj7BluBJYBMmEtIJMwjFhHLCdsJhwhn47XQS3hGJRCbRkugGv70kYgZxFnEpcQNxH / EEsY3YQewjkUi6JFuSNymKxCHlkopJ60i7ScdJV0mdpA9kFbIR2YkcQk4mi8iF5HLyLvIx8lXyU3I / RZ1iTvGkRFF4lJmU5ZRtlEbKFUonpZ + qQbWkelPjqBnUBdQK6l7qGep96hsVFRUTFQ + VCSpClfkqFSr7Vc6rPFL5SNOk2dACaZNpMtoy2g7aCdod2hs6nW5B96Mn03Ppy + g19FP0h / QPqgxVe1W2Kk91nmqVap3qVdWXahQ1czV / talqBWrlagfVrqj1qFPULdQD1Tnqc9Wr1I + o31Lv02BoOGpEaWRrLNXYpXFB45kmSdNCM1iTp1mkuVXzlGYHA2OYMgIZXMZCxjbGGUanFlHLUoutlaFVqrVHq0WrV1tTe4x2gna + dpX2Ue12Jsa0YLKZWczlzAPMm8xPIwxG + I / gj1gyYu + IqyPe64zU8dPh65To7NO5ofNJl6UbrJupu1K3XveBHq5nozdBb4beRr0zej0jtUZ6jeSOLBl5YORdfVTfRj9Gf5b + Vv3L + n0GhgahBmKDdQanDHoMmYZ + hhmGqw2PGXYbMYx8jIRGq42OGz1nabP8WVmsCtZpVq + xvnGYscx4i3GLcb + JpUm8SaHJPpMHplRTd9M009Wmzaa9ZkZm481mm9Wa3TWnmLubC8zXmp8zf29haZFoscii3uKZpY4l27LAstbyvhXdytcqx6ra6ro10drdOtN6g3WrDWrjYiOwqbK5YovautoKbTfYto0ijPIYJRpVPeqWHc3O3y7PrtbukT3TPsK + 0L7e / uVos9HJo1eOPjf6q4OLQ5bDNod7jpqO4xwLHRsdXzvZOHGdqpyuO9OdQ5znOTc4vxpjO4Y / ZuOY2y4Ml / Eui1yaXb64urlKXPe6druZuaW4rXe75a7lHu2 + 1P28B8EjwGOeR5PHR09Xz1zPA55 / e9l5ZXrt8no21nIsf + y2sR3eJt4c7y3e7T4snxSfzT7tvsa + HN9q38d + pn48v + 1 + T / 2t / TP8d / u / DHAIkAQcDngf6Bk4J / BEEBYUGlQS1BKsGRwfXBn8MMQkJD2kNqQ31CV0VuiJMEJYeNjKsFtsAzaXXcPuHec2bs640 + G08NjwyvDHETYRkojG8ej4ceNXjb8faR4piqyPAlHsqFVRD6Ito3Oi / 5hAnBA9oWpCV4xjzOyYc7GM2Gmxu2LfxQXELY + 7F28VL4tvTlBLmJxQk / A + MSixLLF94uiJcyZeStJLEiY1JJOSE5K3J / dNCp60ZlLnZJfJxZNvTrGckj / lwlS9qVlTj05Tm8aZdjCFkJKYsivlMyeKU83pS2Wnrk / t5QZy13Jf8Px4q3ndfG9 + Gf9pmndaWdqzdO / 0VendAl9BuaBHGCisFL7KCMvYlPE + MypzR + ZAVmLWvmxydkr2EZGmKFN0errh9PzpbWJbcbG4PcczZ01OryRcsl2KSKdIG3K14CH7ssxK9ovsUZ5PXlXehxkJMw7ma + SL8i / PtJm5ZObTgpCC32bhs7izmmcbz14w + 9Ec / zlb5iJzU + c2zzOdVzSvc37o / J0LqAsyF / xZ6FBYVvh2YeLCxiKDovlFHb + E / lJbrFosKb61yGvRpsX4YuHiliXOS9Yt + VrCK7lY6lBaXvp5KXfpxV8df634dWBZ2rKW5a7LN64grhCtuLnSd + XOMo2ygrKOVeNX1a1mrS5Z / XbNtDUXyseUb1pLXStb214RUdGwzmzdinWfKwWVN6oCqvat11 + /ZP37DbwNVzf6bdy7yWBT6aZPm4Wbb28J3VJXbVFdvpW4NW9r17aEbed+c/ + tZrve9tLtX3aIdrTvjNl5usatpmaX / q7ltWitrLZ79 + TdrXuC9jTstdu7ZR9zX + l + sF + 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";
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
            return readingApi.readingCol().doc("reading_001").set(_objectSpread({}, _model.DefaultReading, {
              resourceId: "00001",
              timeseriesId: 'default'
            }));

          case 2:
            _context.next = 4;
            return readingApi.readingCol().doc("reading_002").set(_objectSpread({}, _model.DefaultReading, {
              resourceId: "00001",
              timeseriesId: 'default'
            }));

          case 4:
            _context.next = 6;
            return readingApi.readingCol().doc("reading_003").set(_objectSpread({}, _model.DefaultReading, {
              resourceId: "00002",
              timeseriesId: 'default'
            }));

          case 6:
            _context.next = 8;
            return readingApi.readingCol().doc("reading_004").set(_objectSpread({}, _model.DefaultReading, {
              resourceId: "00002",
              timeseriesId: 'default'
            }));

          case 8:
            _context.next = 10;
            return readingApi.readingCol().doc("reading_005").set(_objectSpread({}, _model.DefaultReading, {
              resourceId: "00003",
              timeseriesId: 'default'
            }));

          case 10:
            _context.next = 12;
            return readingApi.readingCol().doc("reading_006").set(_objectSpread({}, _model.DefaultReading, {
              resourceId: "00003",
              timeseriesId: 'default'
            }));

          case 12:
            _context.next = 14;
            return readingApi.readingCol().doc("reading_007").set(_objectSpread({}, _model.DefaultReading, {
              datetime: '2017-01-01T01:11:01Z',
              value: 1,
              resourceId: "00004",
              timeseriesId: 'default'
            }));

          case 14:
            _context.next = 16;
            return readingApi.readingCol().doc("reading_008").set(_objectSpread({}, _model.DefaultReading, {
              datetime: '2017-01-02T01:11:01Z',
              value: 2,
              resourceId: "00004",
              timeseriesId: 'default'
            }));

          case 16:
            _context.next = 18;
            return readingApi.readingCol().doc("reading_009").set(_objectSpread({}, _model.DefaultReading, {
              datetime: '2017-01-03T01:11:01Z',
              value: 3,
              resourceId: "00004",
              timeseriesId: 'default'
            }));

          case 18:
            _context.next = 20;
            return readingApi.readingCol().doc("image_reading_001").set(_objectSpread({}, _model.DefaultReading, {
              id: 'reading_001',
              resourceId: "image_res_1",
              timeseriesId: 'default',
              image: {
                base64Image: base64Image
              }
            }));

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it('gets a list of readings for a resourceId',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var resourceId, params, readings;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            //Arrange
            resourceId = "00001";
            params = {
              limit: 10 //Act

            };
            _context2.t0 = _utils.unsafeUnwrap;
            _context2.next = 5;
            return readingApi.getReadingsForResourceId(resourceId, params);

          case 5:
            _context2.t1 = _context2.sent;
            readings = (0, _context2.t0)(_context2.t1);
            //Assert
            assert.equal(readings.readings.length, 2);

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
  it('gets a list of readings for multiple resourceIds',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var resourceIds, params, readings;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            //Arrange
            resourceIds = ["00001", "00003"];
            params = {
              limit: 10 //Act

            };
            _context3.t0 = _utils.unsafeUnwrap;
            _context3.next = 5;
            return readingApi.getReadingsForResources(resourceIds, params);

          case 5:
            _context3.t1 = _context3.sent;
            readings = (0, _context3.t0)(_context3.t1);
            //Assert
            assert.equal(readings.readings.length, 4);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
  it('obeys the limit for individual resourceIds',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var resourceId, params, readings;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            //Arrange
            resourceId = "00001";
            params = {
              limit: 1 //Act

            };
            _context4.t0 = _utils.unsafeUnwrap;
            _context4.next = 5;
            return readingApi.getReadingsForResourceId(resourceId, params);

          case 5:
            _context4.t1 = _context4.sent;
            readings = (0, _context4.t0)(_context4.t1);
            //Assert
            assert.equal(readings.readings.length, 1);

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  })));
  it('orders the individual query with the newest readings first',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    var resourceId, params, readings;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            //Arrange
            resourceId = "00004";
            params = {
              limit: 100 //Act

            };
            _context5.t0 = _utils.unsafeUnwrap;
            _context5.next = 5;
            return readingApi.getReadingsForResourceId(resourceId, params);

          case 5:
            _context5.t1 = _context5.sent;
            readings = (0, _context5.t0)(_context5.t1);
            //Assert
            assert.equal(readings.readings[0].value, 3);

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  })));
  it('getReadingImage fails if no reading exists',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6() {
    var readingId, result;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            //Arrange
            readingId = "asdasd"; //Act

            _context6.next = 3;
            return readingApi.getReadingImage(readingId);

          case 3:
            result = _context6.sent;
            //Assert
            assert.equal(result.type, _utils.ResultType.ERROR);

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  })));
  it('getReadingImage fails if no image exists on the reading',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7() {
    var readingId, result;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            //Arrange
            readingId = "reading_009"; //Act

            _context7.next = 3;
            return readingApi.getReadingImage(readingId);

          case 3:
            result = _context7.sent;
            //Assert
            assert.equal(result.type, _utils.ResultType.ERROR);

          case 5:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  })));
  it('getReadingImage succeeds',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8() {
    var readingId, result;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            //Arrange
            readingId = "image_reading_001"; //Act

            _context8.t0 = _utils.unsafeUnwrap;
            _context8.next = 4;
            return readingApi.getReadingImage(readingId);

          case 4:
            _context8.t1 = _context8.sent;
            result = (0, _context8.t0)(_context8.t1);
            //Assert
            assert.equal(result, base64Image);

          case 7:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  })));
  this.afterAll(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee9() {
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return readingApi.readingCol().doc("reading_001").delete();

          case 2:
            _context9.next = 4;
            return readingApi.readingCol().doc("reading_002").delete();

          case 4:
            _context9.next = 6;
            return readingApi.readingCol().doc("reading_003").delete();

          case 6:
            _context9.next = 8;
            return readingApi.readingCol().doc("reading_004").delete();

          case 8:
            _context9.next = 10;
            return readingApi.readingCol().doc("reading_005").delete();

          case 10:
            _context9.next = 12;
            return readingApi.readingCol().doc("reading_006").delete();

          case 12:
            _context9.next = 14;
            return readingApi.readingCol().doc("reading_007").delete();

          case 14:
            _context9.next = 16;
            return readingApi.readingCol().doc("reading_008").delete();

          case 16:
            _context9.next = 18;
            return readingApi.readingCol().doc("reading_009").delete();

          case 18:
            _context9.next = 20;
            return readingApi.readingCol().doc("image_reading_001").delete();

          case 20:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  })));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvUmVhZGluZ0FwaS51bml0LnRzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJvcmdJZCIsImRlc2NyaWJlIiwidGltZW91dCIsImZpcmVzdG9yZSIsIk1vY2tGaXJlc3RvcmUiLCJyZWFkaW5nQXBpIiwiUmVhZGluZ0FwaSIsImJhc2U2NEltYWdlIiwiYmVmb3JlQWxsIiwicmVhZGluZ0NvbCIsImRvYyIsInNldCIsIkRlZmF1bHRSZWFkaW5nIiwicmVzb3VyY2VJZCIsInRpbWVzZXJpZXNJZCIsImRhdGV0aW1lIiwidmFsdWUiLCJpZCIsImltYWdlIiwiaXQiLCJwYXJhbXMiLCJsaW1pdCIsInVuc2FmZVVud3JhcCIsImdldFJlYWRpbmdzRm9yUmVzb3VyY2VJZCIsInJlYWRpbmdzIiwiYXNzZXJ0IiwiZXF1YWwiLCJsZW5ndGgiLCJyZXNvdXJjZUlkcyIsImdldFJlYWRpbmdzRm9yUmVzb3VyY2VzIiwicmVhZGluZ0lkIiwiZ2V0UmVhZGluZ0ltYWdlIiwicmVzdWx0IiwidHlwZSIsIlJlc3VsdFR5cGUiLCJFUlJPUiIsImFmdGVyQWxsIiwiZGVsZXRlIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7OztlQUtJQSxPQUFPLENBQUMseUJBQUQsQztJQURUQyxLLFlBQUFBLEs7O0FBSUZDLFFBQVEsQ0FBQyxhQUFELEVBQWdCLFlBQVk7QUFDbEMsT0FBS0MsT0FBTCxDQUFhLElBQWI7QUFDQSxNQUFNQyxTQUFvQixHQUFHLElBQUlDLDJCQUFKLENBQWtCLEVBQWxCLEVBQXNCRCxTQUF0QixFQUE3QjtBQUNBLE1BQU1FLFVBQVUsR0FBRyxJQUFJQyxzQkFBSixDQUFlSCxTQUFmLEVBQTBCSCxLQUExQixDQUFuQjtBQUNBLE1BQU1PLFdBQVcsR0FBRyxnOFNBQXBCO0FBRUEsT0FBS0MsU0FBTDtBQUFBO0FBQUE7QUFBQTtBQUFBLDBCQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7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MkIsTUFBM0MsRUFUTTs7QUFBQTtBQUFBO0FBQUEsbUJBVU5oQyxVQUFVLENBQUNJLFVBQVgsR0FBd0JDLEdBQXhCLENBQTRCLG1CQUE1QixFQUFpRDJCLE1BQWpELEVBVk07O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBZDtBQVlELENBOUhPLENBQVIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ21vY2hhJztcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuLy9AdHMtaWdub3JlXG5pbXBvcnQgTW9ja0ZpcmVzdG9yZSBmcm9tICdtb2NrLWNsb3VkLWZpcmVzdG9yZSc7XG5pbXBvcnQgeyBhZG1pbiB9IGZyb20gJy4uL3Rlc3QvVGVzdEZpcmViYXNlJztcbmltcG9ydCB7IERlZmF1bHRSZWFkaW5nIH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHsgdW5zYWZlVW53cmFwLCBSZXN1bHRUeXBlIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgUmVhZGluZ0FwaSB9IGZyb20gJy4vUmVhZGluZ0FwaSc7XG50eXBlIEZpcmVzdG9yZSA9IGFkbWluLmZpcmVzdG9yZS5GaXJlc3RvcmU7XG5cbmNvbnN0IHtcbiAgb3JnSWQsXG59ID0gcmVxdWlyZSgnLi4vdGVzdC90ZXN0Q29uZmlnLmpzb24nKTtcblxuXG5kZXNjcmliZSgnUmVhZGluZyBBcGknLCBmdW5jdGlvbiAoKSB7XG4gIHRoaXMudGltZW91dCg1MDAwKTtcbiAgY29uc3QgZmlyZXN0b3JlOiBGaXJlc3RvcmUgPSBuZXcgTW9ja0ZpcmVzdG9yZSh7fSkuZmlyZXN0b3JlKCk7XG4gIGNvbnN0IHJlYWRpbmdBcGkgPSBuZXcgUmVhZGluZ0FwaShmaXJlc3RvcmUsIG9yZ0lkKTtcbiAgY29uc3QgYmFzZTY0SW1hZ2UgPSBcImlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFDb0FBQUFpQ0FZQUFBQXBrRXMyQUFBTUptbERRMUJKUTBNZ1VISnZabWxzWlFBQVNJbVZsd2RVazhrV2dPY3ZxU1MwUUFTa2hONEVLZEtsMXdnQ1VnVWJJUWtrbEJnU2dvZ2RXVlJ3TGFpSVlFVlhSV3hyQVdTeFlTICsgTFlPOFBSVkNVZGJGZ1EgKyBWTkVrQlh6M3Z2dkh2TyAvIFAgKyBYTzNmdTNIc3ogLyA1d1pBTlNpT1dKeEZxb09RTFlvVnhJVEdzQ2FtSlRNSW5VQUJLQkFBICsgaUQwUnl1Vk93ZkhSMEJvQXk5IC8geW52YmtKcktOZnM1TDUgKyA3diArIHZvc0hqUzdrQUlOR1FVM2xTYmpia1F3RGdybHl4SkJjQVFnIC8gVW04N0lGVU1td2lpQmxnUUdDTmxNenVsS2RwZHpxcElqRkRaeE1ZR1FVd0FnMHpnY1NUb0Fxdks0V0huY2RPaEhkU2xrQnhGUEtJTGNCTm1ISyArIER3SUggKyBHUENvN2V6cGtOU3ZJVnFuZiArIFVuIC8gaDggLyBVWVo4Y1R2b3dLM05SQ0RsSUtCVm5jV2IgKyBuICsgWDQzNUtkSlJ1YXd4UTJta0FTRmlQUFdWNjN6T25oY3FaQlBpOUtqWXlDckFuNXVwQ25zSmR6bDBBV0ZqOW8gLyA0RXJEWVExQTB3QVVCcVBFeFFPV1IgKyB5aVNnck1tSlE3NU1tREdGRGhyVkg0NFM1N0RqbFdKUW5tUjR6NkIgLyBONTB1RFk0ZVlJMUhNSmJjcGtXWEcgKyB3IC8gNjNDamdzNGQ4TmhZSTRoS1ZjYUt0ZWNLRVNNaXFrTzlMTTJQREIyMmVGd2dDSTRkc0pMSVllY3p3UDhkQW1pUWtSbW1EbVdWTGggLyBMQ1BBVkNkdVFnUiArIFFLNHNLVVk3R3BYSTRpTmgzSUdYenB4SWloT0huOG9HQmxYbGdoWHhRIC8gR0Q5V0pzNE5pQm0wM3liT2loNjB4NXI0V2FGeXZRbmtGbWxlN05EWTNseTQySlQ1NGtDY0d4Mm5qQTNYeXVDTWkxYkdnTnVBQ0JBSWdnQUx5R0JMQmROQkJoQzI5TlQzd0YgLyBLbmhEQUFSS1FEdmpBYmxBek5DSlIwU09DejFoUUFQNkN4QWZTNFhFQmlsNCArIHlJUDZMOE5hNWRNT3BDbDY4eFFqTWtFWDVHd1FEckxnYjVsaWxHaDR0Z1R3QkdxRVA4M09oYkZtd1NidiArIDBuSFVodlNFWU9KUWNRd1lnalJHdGZEZlhBdlBBSSArIC9XQnp3dDF4ajZHNHZ0a1R1Z2h0aE1lRUc0UjJ3cDFwd2tMSkQ1R3p3SGpRRG1NTUdjd3U5ZnZzY0F2bzFRVVB3TDJoZitnYlorSjZ3QTRmQTJmeXgzM2gzQzVRKzMyc3N1R012OVZ5MEJmRmdZSlNSbEQ4S0ZZL1JxQnFvICsgb3k3RVZlcWU5cm9Zd3JkYmhhZ2NNOVAgKyBZUiArIEYzOWVQQWQgLyBxTWx0aGc3aUozRFRtSVhzQ2FzSHJDdzQxZ0RkaGs3S3VmaHRmRkVzVGFHWm90UnhKTUogLyBRaCAvIG1vOHpPS2U4YWxLSFdvZHVoOCArIERmU0NYbjU4ciAvIDFnQ3A0dG5Tb1RwZ2x5V1A5eXQgKyBTeTJpR3MgLyBpdVhrNE9nQmdIenZWMjR0YjVpS1BSMWhYdnlteXprQmdFY0pWS1ogLyAwM0hnSG5Ta0N3REd1Mjg2MDlkdzJhOEE0R2dyVnliSlUgKyBwdyArIFlNQXFFQU5maW02d0JEdVhWWXdJeWZnQ3J5QUh3Z0c0MEFVaUFOSllDcXNzd0N1VXdtWUFXYURCYUFZbElJVllBMm9CSnZBVnJBVDdBRUhRRDFvQWlmQldYQUp0SUliNEI1Y0s1M2dCZWdGNzBBIC8gZ2lBa2hJNHdFRjNFQ0RGSGJCRW54QjN4UVlLUkNDUUdTVUpTa0hSRWhNaVEyY2hDcEJRcFF5cVJMVWdOOGp0eUJEbUpYRURha0R2SUk2UWJlWTE4UWpHVWhtcWhCcWdGT2hwMVIgLyAzUmNEUU9uWUttb3psb0FWcUVMa01yMEdwME4xcUhua1F2b1RmUWR2UUYyb2NCVEFWallzYVlIZWFPQldKUldES1doa213dVZnSlZvNVZZM3V4UnZoUFg4UGFzUjdzSTA3RUdUZ0x0NFByTlF5UHg3bDREajRYWDRwWDRqdnhPdncwZmcxIC8gaFBmaVh3bDBnajdCbHVCSllCTW1FdElKTXdqRmhITENkc0pod2huNDdYUVMzaEdKUkNiUmt1Z0d2NzBrWWdaeEZuRXBjUU54SCAvIEVFc1kzWVFld2prVWk2SkZ1U055bUt4Q0hsa29wSjYwaTdTY2RKVjBtZHBBOWtGYklSMllrY1FrNG1pOGlGNUhMeUx2SXg4bFh5VTNJIC8gUloxaVR2R2tSRkY0bEptVTVaUnRsRWJLRlVvbnBaICsgcVFiV2tlbFBqcUJuVUJkUUs2bDdxR2VwOTZoc1ZGUlVURlEgKyBWQ1NwQ2xma3FGU3I3VmM2clBGTDVTTk9rMmRBQ2FaTnBNdG95Mmc3YUNkb2QyaHM2blc1Qjk2TW4wM1BweSArIGcxOUZQMGggLyBRUHFneFZlMVcyS2s5MW5tcVZhcDNxVmRXWGFoUTFjelYgLyB0YWxxQldybGFnZlZycWoxcUZQVUxkUUQxVG5xYzlXcjFJICsgbzMxTHYwMkJvT0dwRWFXUnJMTlhZcFhGQjQ1a21TZE5DTTFpVHAxbWt1Vlh6bEdZSEEyT1lNZ0laWE1aQ3hqYkdHVWFuRmxITFVvdXRsYUZWcXJWSHEwV3JWMXRUZTR4MmduYSArIGRwWDJVZTEySnNhMFlMS1pXY3psekFQTW04eFBJd3hHICsgSSAvIGdqMWd5WXUgKyBJcXlQZTY0elU4ZFBoNjVUbzdOTzVvZk5KbDZVYnJKdXB1MUszWHZlQkhxNW5vemRCYjRiZVJyMHplajBqdFVaNmplU09MQmw1WU9SZGZWVGZSajlHZjViICsgVnYzTCArIG4wR2hnYWhCbUtEZFFhbkRIb01tWVogKyBoaG1HcXcyUEdYWWJNWXg4aklSR3E0Mk9HejFuYWJQOFdWbXNDdFpwVnEgKyB4dm5HWXNjeDRpM0dMY2IgKyBKcFVtOFNhSEpQcE1IcGxSVGQ5TTAwOVdtemFhOVprWm00ODFtbTlXYTNUV25tTHViQzh6WG1wOHpmMjloYVpGb3NjaWkzdUtacFk0bDI3TEFzdGJ5dmhYZHl0Y3F4NnJhNnJvMTBkcmRPdE42ZzNXckRXcmpZaU93cWJLNVlvdmF1dG9LYlRmWXRvMGlqUElZSlJwVlBlcVdIYzNPM3k3UHJ0YnVrVDNUUHNLICsgMEw3ZSAvIHVWb3M5SEpvMWVPUGpmNnE0T0xRNWJETm9kN2pwcU80eHdMSFJzZFh6dlpPSEdkcXB5dU85T2RRNXpuT1RjNHZ4cGpPNFkgLyBadU9ZMnk0TWwgLyBFdWkxeWFYYjY0dXJsS1hQZTZkcnVadWFXNHJYZTc1YTdsSHUyICsgMVAyOEI4RWp3R09lUjVQSFIwOVh6MXpQQTU1IC8gZTlsNVpYcnQ4bm8yMW5Jc2YgKyB5MnNSM2VKdDRjN3kzZTdUNHNueFNmelQ3dHZzYSArIEhOOXEzOGQgKyBwbjQ4diArIDEgKyBUIC8gMnQgLyBUUDhkIC8gdSAvIERIQUlrQVFjRG5nZjZCazRKIC8gQkVFQllVR2xRUzFCS3NHUndmWEJuOE1NUWtKRDJrTnFRMzFDVjBWdWlKTUVKWWVOaktzRnRzQXphWFhjUHVIZWMyYnM2NDAgKyBHMDhOand5dkRIRVRZUmtvakc4ZWo0Y2VOWGpiOGZhUjRwaXF5UEFsSHNxRlZSRDZJdG8zT2kgLyA1aEFuQkE5b1dwQ1Y0eGp6T3lZYzdHTTJHbXh1MkxmeFFYRUxZICsgN0YyOFZMNHR2VGxCTG1KeFFrIC8gQSArIE1TaXhMTEY5NHVpSmN5WmVTdEpMRWlZMUpKT1NFNUszSiAvIGROQ3A2MFpsTG5aSmZKeFpOdlRyR2NraiAvIGx3bFM5cVZsVGowNVRtOGFaZGpDRmtKS1lzaXZsTXllS1U4M3BTMlducmsgLyB0NVFaeTEzSmY4UHg0cTNuZGZHOSArIEdmOXBtbmRhV2RxemRPIC8gMFZlbmRBbDlCdWFCSEdDaXNGTDdLQ012WWxQRSArIE15cHpSICsgWkFWbUxXdm14eWRrcjJFWkdtS0ZOMGVycmg5UHpwYldKYmNiRzRQY2N6WjAxT3J5UmNzbDJLU0tkSUczSzE0Q0g3c3N4SzlvdnNVWjVQWGxYZWh4a0pNdzdtYSArIFNMOGkgLyBQdEptNVpPYlRncENDMzJiaHM3aXptbWNiejE0dyArIDlFYyAvIHpsYjVpSnpVICsgYzJ6ek9kVnpTdmMzN28gLyBKMExxQXN5RiAvIHhaNkZCWVZ2aDJZZUxDeGlLRG92bEZIYiArIEUgLyBsSmJyRm9zS2I2MXlHdlJwc1g0WXVIaWxpWE9TOVl0ICsgVnJDSzdsWTZsQmFYdnA1S1hmcHhWOGRmNjM0ZFdCWjJyS1c1YTdMTjY0Z3JoQ3R1TG5TZCArIFhPTW8yeWdyS09WZU5YMWExbXJTNVogLyBYYk50RFVYeXNlVWIxcExYU3RiMjE0UlVkR3d6bXpkaW5XZkt3V1ZONm9DcXZhdDExICsgL1pQMzdEYndOVnpmNmJkeTd5V0JUNmFaUG00V2JiMjhKM1ZKWGJWRmR2cFc0Tlc5cjE3YUViZWQrYy8gKyB0WnJ2ZTl0THRYM2FJZHJUdmpObDV1c2F0cG1hWCAvIHE3bHRXaXRyTFo3OSArIFRkclh1QzlqVHN0ZHU3WlI5elggKyBsICsgc0YgKyAyLy9udktiL2ZQQkIrb1BtZys4RzloOHdQclQvTU9GeFNoOVROck91dEY5UzNOeVExdEIwWmQ2UzUwYXZ4OEIvMmYreG9NbTZxT3FwOWRQa3g2ckdpWXdQSEM0NzNuUkNmNkRtWmZyS2plVnJ6dlZNVFQxMC9QZUYweTVud00rZlBocHc5ZGM3LzNQSHozdWViTG5oZU9ITFIvV0w5SmRkTGRaZGRMaC8rMCtYUHd5MnVMWFZYM0s0MHRIcTBOcmFOYlR0MjFmZnF5V3RCMTg1ZVoxKy9kQ1B5UnR2TitKdTNiMDIrMVg2YmQvdlpuYXc3cis3bTNlMi9OLzgrNFg3SkEvVUg1US8xSDFiL3kvcGYrOXBkMjQ4K0NucDArWEhzNDNzZDNJNFhUNlJQUG5jV2RkRzd5cDhhUGExNTV2U3NxVHVrdS9YNXBPZWRMOFF2K251Sy85TDRhLzFMcTVlSC92YjcrM0x2eE43T1Y1SlhBNitYdnRGOXMrUHRtTGZOZmRGOUQ5OWx2K3QvWC9KQjk4UE9qKzRmejMxSy9QUzBmOFpuMHVlS0w5WmZHcitHZjcwL2tEMHdJT1pJT0lxakFBWWJtcFlHd09zZEFOQ1Q0Tm1oRlFEcUpPWGRUQ0dJOGo2cElQQ2ZXSGwvVTRnckFEdjhBSWlmRDBBRVBLTnNoTTBjTWcyKzVVZndPRCtBT2pzUHQwR1Jwams3S1gzUjRJMkY4R0ZnNEkwQkFLUkdBTDVJQmdiNk53d01mTmtHZzcwRHdJa2M1WjFRTHZJNzZHWjdPYlYydmdRL3lyOEJ6ejV4UVg1RHBKUUFBQUFKY0VoWmN3QUFGaVVBQUJZbEFVbFNKUEFBQUFHYmFWUllkRmhOVERwamIyMHVZV1J2WW1VdWVHMXdBQUFBQUFBOGVEcDRiWEJ0WlhSaElIaHRiRzV6T25nOUltRmtiMkpsT201ek9tMWxkR0V2SWlCNE9uaHRjSFJyUFNKWVRWQWdRMjl5WlNBMUxqUXVNQ0krQ2lBZ0lEeHlaR1k2VWtSR0lIaHRiRzV6T25Ka1pqMGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNVGs1T1M4d01pOHlNaTF5WkdZdGMzbHVkR0Y0TFc1ekl5SStDaUFnSUNBZ0lEeHlaR1k2UkdWelkzSnBjSFJwYjI0Z2NtUm1PbUZpYjNWMFBTSWlDaUFnSUNBZ0lDQWdJQ0FnSUhodGJHNXpPbVY0YVdZOUltaDBkSEE2THk5dWN5NWhaRzlpWlM1amIyMHZaWGhwWmk4eExqQXZJajRLSUNBZ0lDQWdJQ0FnUEdWNGFXWTZVR2w0Wld4WVJHbHRaVzV6YVc5dVBqUXlQQzlsZUdsbU9sQnBlR1ZzV0VScGJXVnVjMmx2Ymo0S0lDQWdJQ0FnSUNBZ1BHVjRhV1k2VUdsNFpXeFpSR2x0Wlc1emFXOXVQak0wUEM5bGVHbG1PbEJwZUdWc1dVUnBiV1Z1YzJsdmJqNEtJQ0FnSUNBZ1BDOXlaR1k2UkdWelkzSnBjSFJwYjI0K0NpQWdJRHd2Y21SbU9sSkVSajRLUEM5NE9uaHRjRzFsZEdFK0NrQTQzL0VBQUFBY2FVUlBWQUFBQUFJQUFBQUFBQUFBRVFBQUFDZ0FBQUFSQUFBQUVRQUFCcWpEbG9GM0FBQUdkRWxFUVZSWUNZeVdTVzhjeHhYSC8xWGQwN053SkM0amlxWWxpaHg1SVNOWkVpVXZrQlhhY0FUTENHRGtraGorREw3NDVPUm1HZkRCZ1EvK0J2a0F1UVhJSWJrRU9kaUgySWczZUJGZ1czRmllbEdzVUJGTmtTSm5wcGZ5NzlWd0tObFFnRFNtcDd1clg5WDcxZis5ZXRYdU4zLytWM2o0a2NQYTJFNzAvZ2RyZXZ2ZHIzWGpwcE5QV3FxbFRmbkt5eFdsc3REVFJLMnY3clRUVXo4OXFMTW5wdFZ3VHZVa2NGYmlOaDVoZU5IdTQ5NVZlM2ZETnk0YWNoOUdscnNkN1RJYTVMWjc5OEtmdmdqSFRoN1VwY3M5WGZwMFE5LzhlMHVEZ1ZQaU13QWFFWlFHcWZlZEZqcGVqeDZmMU1ycEtTM090NVRncE9ZcTFRQk43dURQL093QjJVTTh6SEJrelBWT29HWjNPNnoxZU80UHEySHU2S1JlZit1cXZyd3lrUGQxaGNvSi84cGNLbDg2aFVGZjVlYWFscnN0L2ZKOFZ5ZnZiV3Q2bk1uZ3g2dVN4emhoTVArL25KcmpDRGNDakEwL2FydEZkdXR1WkVmdlozNzNUV2hQdGZYT3BTdTZ2bGxvck5VV2VFcEt3c21wSEpBeVZ6TnNhK1dCZlhyMnlUa2R2YXVwWmdxWU4xOGxDT1d3VDZEQnZQeUE1d2NQdHp6djNZM2U0MnYzdUNQbzQ2OStSWkkxOU9XMWRmV0FhdGFicXBOd0tYQyt5RlVOY2pVSTdUMnpkVDF4YWtJWHprenBybjAxMUF4RWpjSGpHVVNMMG9DdUl5OGovNlBuRVFYdHNXbVlFN3R6b3VVMk93dk1iWS8wREhJblh2b3M1QzVSSDAxS0ZQRllaRURXZzUwRllkOVdaNS8wMU1vaG5UdmVVWGVpcHZITXdsNnFVQjdkSno2Sm9INmtxTFgrWDZBV0RRNmppbWxEUkdnd2JmZWE0aDEyaXk5ZkRyMGk4REpqNWFaS0t3UXUrcXFYTzJxcXAzYWFhK0h1dXA0K3Y2RGxlNlkwam1oTmJ6a0phRlhReHhaZVFwNE9KMmtPQTIxb1lBanhzTW5ic1pmQ0ZnVThCc1p3Z1pjMndjSXJZT0RJSjhNSFNlRHdYR0tIbjZPdi9ETU1ja0NMWWVnYU5EZUtuaHI1cHNiY2x1Wm5NaTB2VGVuY2c3TTZPdHRXQXhlMjBuMG9WVlhrTVlQN0NHb29kamhiWHJ1d1BPRXdwakp2ZG5scEJKTCswZ0JycGhSU0lzZkVTa3Boa2dEcFFjT3N4bDlpb0xuY3pNWEx3WU9ldVlZeUptcHFOdk9iYWxXYm1xenY2T3lwQTNxTU9qcy9PNmI5RFJTblcySW8wU3ZMeUVha1gwSUp3SWU1UlJGOFJsV3RFZ3hCYVlySHNCdi9nSWF3WTFPeTdKYkxtVTdKQUV3NjBFcXhVV1hqZVlzYW9MTVhWME9ka3BTUlpiVThWOXEvb2ZwZ1F6TmpBeTNmMzlLanAyZDBhbkZhN1FiRDBYa1lLc2dNZ0RBRksxK2tTK3BOV1FzN1VRU3A0R3BRWEtLaWtaSS9hNHZ0Z0xyUTV5d0FGWXVYOUVGWmk3ZUJXdm9ZTExzTjRjZnUzcGYvR3pKZUpGYUdldHVxRGI3VGZyZWhueHlwNlJjWHVscnFUbWlpWlpEa2o4V1JYMG5aS29BTHRzcVJMOEFOSTFDRUhRbEhvRFRIUG14ZThiQkx2TVhXbEt5bnBpYTF1OHFKcUVjcWxPWGZRSWtSNDNNeE5YMVBidW5pV2tnR2hWSktVWTJRajZjM2RXYXhRY2duZFhLeG93UGpxQTJnVFE0MldXa3RHV0ZuRUhSOVhicXhXU3J2bDFTQm9hSVZ0b1hCY3ExMlM1ZG5KdGJmcG1JTHhkSGVvSExNZEpxYWFKSnVUQzBqZjlBVFFSTGVvNnFKWUwwQ3V5STEzQjMvOVdwdy9XMjFtZmFCc1pKaUxwMC9PNk1ISCtob0xQUGlGL1BNSm1jcmNhZW90SDVqUjFmWCtscTk0blJ0dlZCdkIxQlVTRW1GaWxWYVVCVnlGb0dCR3BxcE53d0c3d0d4cEI0RGNJNk5venZiMHFGT0EvLzJQY0YyekJnKzJxQW95ampVZHRXTzNQTHpINFFtVmZUUVZGT25sL2FqNUg1MUQ3VTAyU1pyTFVRMktRQ3RZaUtpMXJmNit2djdYK21kRDlkMGJhT2hyWDVOZWM1Q3N0VVBRQVJsZ3pEWXluWXRZRzFCT1ZaeUlBZEJBWjROZ2tYU2J2VDAwSW1PbmpoN1JJY242MVFacXlnVzlLSFR3TWVRUlNObExQZXIzMzRjN2p0YzE1SHBsdTZmYSt1K0k2enVab0tTNUEvMjFxY0V3a0EzKzlMcWYzcjZ5eHVmNm0vdmZhdXRZb0wyTnM0elFDM3ZVSEZYMFJMWW9hS01RN280QzJWVmk3YVd5NTZ2TVY5YzF3bkV1YkF5cjVQZHRtWW5VcVpob0dhUG1oR1VoV3FwOStMdi94R2VQSGMzUmpXS3U0L2JaNFpsaG1jUExDWXhlQVo2ZGFQU1I1OXY2Njl2ZnE1M1A3bW12aitva0k1VFF2aks0cjE5bkppS0pYMUx1d2ZhMURSUUgydE5SbmpZV09Mc3R4WDZhNXFiOFhxRU5Idjh6S1NPTGZCcGFlTUFhZW5DV3VQazNqYVcxLzc0V1hqNlp3dWFidGZZTW9jdktMbEF4alVidDlVY05VcHlZUFZxWDI5OXRLRTNQL3hXbjN4OVU3MmtveUtDOHNWRmlPdzBGVXZvN0l5bEgwZHBCS1dZbzZpQnhrbXg4L255dXFiR2VscWFyK25uSzdONjZGZ25MbHhSc3F5VTJEZUhUY3RYcGI0SEFBRC8vK0M5Q200QUFBYmJTVVJCVkUyVzYzTlZWeG5HbjMwN2w1eUVjSEtsaE5KQ3VBUktwRkswb2xOMFVyLzRRY2ZXdjhwYUxmNGIxZzhTdjhoWXJkSnBtVjZtanAxQ3VHVVVNcVVCUW02UW5PdmUyOSt6VHBneFo5YlpKMnV2L2E3Zis3eVh0YU5MaXpmS1g3eDVUT05EbWFvcWxDcFh6RkNacStSWHYwalY5MndjYWVWeFIxL2MyTlpILy9wR04rNC9VenNiVno4YlVTL2l5U0xpYVlrTGEwdXVwVHlURnJreWJpU1lUTW9FdTVuaUVzdEZpN0d1cVgwOW5UN2EwRTkvTUsxWFR6UlZpV3lsejdwQzFTaFdwZVM1b2xEMDN1TFg1Uy9mUEE1b0JWQWo5ZGpBb0d4V3hDb3dYRVNaOGlqU1JxdlFuWlZkWGZsNFdaOWVmNlRkYkovYWNVTWQxYmhmVXhsN2JjSnZQMTZJWDBEMkdOak4rUjh2WW45OHIyd3BLemMxZTdpaDE4L082TFZUbzNwcE9nVzB6NHFDRVNsakpIWXF4K25mQXZvV29CT0ExZ0pvbDlzbEcvR05taVhiV1ZsODBpNk9QdHpxNjh1YmEvcjg1aVBkZnJpdWg4OXlQY3VyS3RPbWxJNEFpN3VJVWdDWDRYU1d0NVgyZDVYME8wSGRCQ2VTc3F0R3RkQ2hxWWJtNTZaMDdwVVhkR1M2b3VZUXUxanBtRFU0bmZDSjhEb3k2RzhXcjVkdkF6b1pRbS9qL1QxUVZwZUFscjRhWGVyeXRjUFg2amJLUHRqU1o3ZnU2dDZUcHlpZGFXMm5nU1A3VkNZTklKMER1V3JFdTFucE1IWUlZUnZBbmxKQ20zSWRiYVE2Y2VTZzVvNU5hZmJGRVkwTlNSVjFWZUpVRkNlS2t5cnlvR25PL2daOWh4eDlteHcxS0FFazlKYmVvYk9pTWFuS0FOWmVNaFZnZDR0U0c1MCthdTVvdmRQVHlucFBIM3kycVp2M0lFejNzUlpiU1l4Q2liNXpOTkg1azVIMjE1ei94QWRuTTJDcjVQeFFwYWI5dzFVMWgyTlZreDRwMFFHVWlNYXBvcVFPQmRjK0cvY0IvZlhpRXFDem12by9VRllNVkRTb3F3UENHTU1SZWVyODZ6TmFMTm5DVXl2NjFmS0dQdnh5VzdjZjRIdzByRGdpalF4YWxWNC9QYVNGODhNNlBKbG91T0t3TTNnMndTZlhUWWF0Q3Y4a1FLcm9NcndnazJJV2srOWhNNE8rc3djNkNQMUEwWklFWnJsVE9ZQkdCZ1VTMGpCdjJCWnpUN3FGcmwxZjBZZGYzTmZkeDVuVzJ3MzFpaUVpa0ZKQXBScFJSOStkSGRaUHpvMXIvbWhGVTgyWXNBOWdZNHVQdFJSYkxxNklvbk82bElTZHVJZFJVdldocnFtTjZGMUEzMExSaWIwY1RRaDl3WVBZSVFXUW5tODZUY0QySkQ2b1FOMGV1YkRSelhYbDJpMzk2ZW9kcmJaSDFJckdBYTJ6YVJvS3A1YnZhdTVnWFQ4OE02WUw4eU9hbmFrTzFNUkdqQ05SN2xZNFVIalEzTGdSZ1kvOUV2dGhXMyt4Yi9RN2d5NE1RQ3RBSmxScUR6ZnlnRWhTNDFYczVQUndyNlJ6UFFkOW12ZTFlSFZKNy8vMXB0YUtNZldxRTREV3NKR3A0djdaM2RieDZib3V2REt1Tjg2TzZ0aWhBV2hxT0xlL1BxQlcxbWxsWXZiMGNNUUdHY2Y4ODlsTGwyK2c2S0RoR3pTbThnenEybzlRMUNFUG9RL0swcWF3MHNPNG05aFREb1UvZjNSTGYvamdyamEwWC8wNnNBV1F0S2lxZTJWblU2Y09OdlRqc3dmMHZWTU52VWllQmpCQzVMQTdIMmxBaEg4QWhCcDdCVnVxaHlPaCtybm5CaG45L3ZMMTBFZkg2MndBWUJ4WjBUSW82djdweHUxNHB5UjI2R3QwZ0I3dWt2cmFSclhGZjk3UiszOWJEcUM5ZWxOZHdsNUpPRHg0THUxczZQUk1YUmNCUFgvU0JlVlRpWG0zS0N2bGJzTEhCZWJzOTNBM05HVFBJVWZtaEZQT1NSQmR1dngxNktNVHRRb0I0MFRBU0o4YkZCcUpSS2lkNEl5VUJNK0F0V0duaFJYZDZLSG8xV1g5OGUvL0lmU2o2bGFhYkpBQmtnSkt6K3l1YTI2bW9vdnprL3IrNmFaZVB1RFE1d3pVWmcvWFFFeG5pUUR6c2Vvd2UwOTNGZS9oYkF2SExldWo5MUEwTlB4YXhwSEdZc0xTNW1neGFKYUJoWWZoeU9QQjhHRytKQndHWGV2aytzdTEvK3J5UCs3cFFXdFU3V1FNSjRIaGZwYTNsSFFmQTVyb2pWY25kZUhNaEY1K29RNGEvVElNN0NLTlFaMENMaTRZbVNTOUxGQklXaWJzQkVKUlREVDhCUm8rb0g0QjhOb3U1N0pmU1ZLRCtsbm0zZnNjbXBCSFlhdEk2emowOGI5WGRlV1RiN1cwS2c0QldoT04yam1YRmp1S1dxdDY3V1JEUC92UlljMGZhMnBxUDJDNDZKZzRuTHh5b0thUFNYNWJKSVpwUThWanc2N2dCVjJFOFM2Z3Z3SjBBdERxSGxDSnFxNjZRRTJLK2dnYjVJcm4zR01IV3ozRDhOSzlwL3JrcTNWOXVyU3ArMnUwTnQ2a3Foem8xYWlOcXV1NmVHNVNQOGYrb1ltR0ttNmlRYzNCUzBkb2Z3WmwycEFScWxwQlJ5eklhd2FMUTE3VDhBbjlBbWM5b0RXbVE1S3p3UG5oUHpkL25PSzV2UndLcWhJZWpMbWduanpyYWZuYlhYMSthNHNqZEV1Ym03c2NqK0wxcmFLWER0UjVkUnZUbWVOakdxbTdKN3MvMDkvQzVrNGtSNHlDWVNiQTdvSDZZTm1iWUdVUkJrY29iMDhMSnpSSjFkZGdxckRHZ2o4SDVXY1ExbGQ3R3paaHh2ZTlaUitqbTYxY3Q3OXBhM2xsVTQvV25wQ2xwV2JHUnpSM1pGb0hKNFkwVWlNVm9IRXMvSjdxSUpuSlJ0eWUvRWJsdGhWdWVONmlPTjhpSnlDREF2OGZtTDBGWm56Yytnb0FBQUFBU1VWT1JLNUNZSUk9XCI7XG5cbiAgdGhpcy5iZWZvcmVBbGwoYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IHJlYWRpbmdBcGkucmVhZGluZ0NvbCgpLmRvYyhcInJlYWRpbmdfMDAxXCIpLnNldCh7Li4uRGVmYXVsdFJlYWRpbmcsIHJlc291cmNlSWQ6IFwiMDAwMDFcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCd9KVxuICAgIGF3YWl0IHJlYWRpbmdBcGkucmVhZGluZ0NvbCgpLmRvYyhcInJlYWRpbmdfMDAyXCIpLnNldCh7Li4uRGVmYXVsdFJlYWRpbmcsIHJlc291cmNlSWQ6IFwiMDAwMDFcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCd9KVxuICAgIGF3YWl0IHJlYWRpbmdBcGkucmVhZGluZ0NvbCgpLmRvYyhcInJlYWRpbmdfMDAzXCIpLnNldCh7Li4uRGVmYXVsdFJlYWRpbmcsIHJlc291cmNlSWQ6IFwiMDAwMDJcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCd9KVxuICAgIGF3YWl0IHJlYWRpbmdBcGkucmVhZGluZ0NvbCgpLmRvYyhcInJlYWRpbmdfMDA0XCIpLnNldCh7Li4uRGVmYXVsdFJlYWRpbmcsIHJlc291cmNlSWQ6IFwiMDAwMDJcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCd9KVxuICAgIGF3YWl0IHJlYWRpbmdBcGkucmVhZGluZ0NvbCgpLmRvYyhcInJlYWRpbmdfMDA1XCIpLnNldCh7Li4uRGVmYXVsdFJlYWRpbmcsIHJlc291cmNlSWQ6IFwiMDAwMDNcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCd9KVxuICAgIGF3YWl0IHJlYWRpbmdBcGkucmVhZGluZ0NvbCgpLmRvYyhcInJlYWRpbmdfMDA2XCIpLnNldCh7Li4uRGVmYXVsdFJlYWRpbmcsIHJlc291cmNlSWQ6IFwiMDAwMDNcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCd9KVxuICAgIGF3YWl0IHJlYWRpbmdBcGkucmVhZGluZ0NvbCgpLmRvYyhcInJlYWRpbmdfMDA3XCIpLnNldCh7Li4uRGVmYXVsdFJlYWRpbmcsIGRhdGV0aW1lOiAnMjAxNy0wMS0wMVQwMToxMTowMVonLCB2YWx1ZTogMSwgcmVzb3VyY2VJZDogXCIwMDAwNFwiLCB0aW1lc2VyaWVzSWQ6ICdkZWZhdWx0J30pXG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDhcIikuc2V0KHsuLi5EZWZhdWx0UmVhZGluZywgZGF0ZXRpbWU6ICcyMDE3LTAxLTAyVDAxOjExOjAxWicsIHZhbHVlOiAyLCByZXNvdXJjZUlkOiBcIjAwMDA0XCIsIHRpbWVzZXJpZXNJZDogJ2RlZmF1bHQnfSlcbiAgICBhd2FpdCByZWFkaW5nQXBpLnJlYWRpbmdDb2woKS5kb2MoXCJyZWFkaW5nXzAwOVwiKS5zZXQoey4uLkRlZmF1bHRSZWFkaW5nLCBkYXRldGltZTogJzIwMTctMDEtMDNUMDE6MTE6MDFaJywgdmFsdWU6IDMsIHJlc291cmNlSWQ6IFwiMDAwMDRcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCd9KVxuXG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwiaW1hZ2VfcmVhZGluZ18wMDFcIikuc2V0KHsgLi4uRGVmYXVsdFJlYWRpbmcsIGlkOiAncmVhZGluZ18wMDEnLCByZXNvdXJjZUlkOiBcImltYWdlX3Jlc18xXCIsIHRpbWVzZXJpZXNJZDogJ2RlZmF1bHQnLCBpbWFnZTogeyBiYXNlNjRJbWFnZSB9IH0pXG4gIH0pO1xuXG5cbiAgaXQoJ2dldHMgYSBsaXN0IG9mIHJlYWRpbmdzIGZvciBhIHJlc291cmNlSWQnLCBhc3luYyAoKSA9PiB7XG4gICAgLy9BcnJhbmdlXG4gICAgY29uc3QgcmVzb3VyY2VJZCA9IFwiMDAwMDFcIjtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBsaW1pdDogMTAsXG4gICAgfVxuXG4gICAgLy9BY3RcbiAgICBjb25zdCByZWFkaW5ncyA9IHVuc2FmZVVud3JhcChhd2FpdCByZWFkaW5nQXBpLmdldFJlYWRpbmdzRm9yUmVzb3VyY2VJZChyZXNvdXJjZUlkLCBwYXJhbXMpKTtcblxuICAgIC8vQXNzZXJ0XG4gICAgYXNzZXJ0LmVxdWFsKHJlYWRpbmdzLnJlYWRpbmdzLmxlbmd0aCwgMik7XG4gIH0pO1xuXG5cbiAgaXQoJ2dldHMgYSBsaXN0IG9mIHJlYWRpbmdzIGZvciBtdWx0aXBsZSByZXNvdXJjZUlkcycsICBhc3luYyAoKSA9PiB7XG4gICAgLy9BcnJhbmdlXG4gICAgY29uc3QgcmVzb3VyY2VJZHMgPSBbXCIwMDAwMVwiLCBcIjAwMDAzXCJdO1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIGxpbWl0OiAxMCxcbiAgICB9XG5cbiAgICAvL0FjdFxuICAgIGNvbnN0IHJlYWRpbmdzID0gdW5zYWZlVW53cmFwKGF3YWl0IHJlYWRpbmdBcGkuZ2V0UmVhZGluZ3NGb3JSZXNvdXJjZXMocmVzb3VyY2VJZHMsIHBhcmFtcykpO1xuXG4gICAgLy9Bc3NlcnRcbiAgICBhc3NlcnQuZXF1YWwocmVhZGluZ3MucmVhZGluZ3MubGVuZ3RoLCA0KTtcbiAgfSk7XG5cblxuICBpdCgnb2JleXMgdGhlIGxpbWl0IGZvciBpbmRpdmlkdWFsIHJlc291cmNlSWRzJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vQXJyYW5nZVxuICAgIGNvbnN0IHJlc291cmNlSWQgPSBcIjAwMDAxXCI7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgbGltaXQ6IDFcbiAgICB9XG5cbiAgICAvL0FjdFxuICAgIGNvbnN0IHJlYWRpbmdzID0gdW5zYWZlVW53cmFwKGF3YWl0IHJlYWRpbmdBcGkuZ2V0UmVhZGluZ3NGb3JSZXNvdXJjZUlkKHJlc291cmNlSWQsIHBhcmFtcykpO1xuXG4gICAgLy9Bc3NlcnRcbiAgICBhc3NlcnQuZXF1YWwocmVhZGluZ3MucmVhZGluZ3MubGVuZ3RoLCAxKTtcbiAgfSk7XG5cbiAgaXQoJ29yZGVycyB0aGUgaW5kaXZpZHVhbCBxdWVyeSB3aXRoIHRoZSBuZXdlc3QgcmVhZGluZ3MgZmlyc3QnLCBhc3luYyAoKSA9PiB7XG4gICAgLy9BcnJhbmdlXG4gICAgY29uc3QgcmVzb3VyY2VJZCA9IFwiMDAwMDRcIjtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBsaW1pdDogMTAwXG4gICAgfVxuXG4gICAgLy9BY3RcbiAgICBjb25zdCByZWFkaW5ncyA9IHVuc2FmZVVud3JhcChhd2FpdCByZWFkaW5nQXBpLmdldFJlYWRpbmdzRm9yUmVzb3VyY2VJZChyZXNvdXJjZUlkLCBwYXJhbXMpKTtcblxuICAgIC8vQXNzZXJ0XG4gICAgYXNzZXJ0LmVxdWFsKHJlYWRpbmdzLnJlYWRpbmdzWzBdLnZhbHVlLCAzKTtcbiAgfSk7XG5cbiAgaXQoJ2dldFJlYWRpbmdJbWFnZSBmYWlscyBpZiBubyByZWFkaW5nIGV4aXN0cycsIGFzeW5jICgpID0+IHtcbiAgICAvL0FycmFuZ2VcbiAgICBjb25zdCByZWFkaW5nSWQgPSBcImFzZGFzZFwiO1xuICBcbiAgICAvL0FjdFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlYWRpbmdBcGkuZ2V0UmVhZGluZ0ltYWdlKHJlYWRpbmdJZCk7XG5cbiAgICAvL0Fzc2VydFxuICAgIGFzc2VydC5lcXVhbChyZXN1bHQudHlwZSwgUmVzdWx0VHlwZS5FUlJPUik7XG4gIH0pO1xuXG4gIGl0KCdnZXRSZWFkaW5nSW1hZ2UgZmFpbHMgaWYgbm8gaW1hZ2UgZXhpc3RzIG9uIHRoZSByZWFkaW5nJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vQXJyYW5nZVxuICAgIGNvbnN0IHJlYWRpbmdJZCA9IFwicmVhZGluZ18wMDlcIjtcblxuICAgIC8vQWN0XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVhZGluZ0FwaS5nZXRSZWFkaW5nSW1hZ2UocmVhZGluZ0lkKTtcblxuICAgIC8vQXNzZXJ0XG4gICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC50eXBlLCBSZXN1bHRUeXBlLkVSUk9SKTtcbiAgfSk7XG5cbiAgaXQoJ2dldFJlYWRpbmdJbWFnZSBzdWNjZWVkcycsIGFzeW5jICgpID0+IHtcbiAgICAvL0FycmFuZ2VcbiAgICBjb25zdCByZWFkaW5nSWQgPSBcImltYWdlX3JlYWRpbmdfMDAxXCI7XG5cbiAgICAvL0FjdFxuICAgIGNvbnN0IHJlc3VsdCA9IHVuc2FmZVVud3JhcChhd2FpdCByZWFkaW5nQXBpLmdldFJlYWRpbmdJbWFnZShyZWFkaW5nSWQpKTtcblxuICAgIC8vQXNzZXJ0XG4gICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgYmFzZTY0SW1hZ2UpO1xuICB9KTtcblxuXG5cbiAgdGhpcy5hZnRlckFsbChhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDFcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDJcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDNcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDRcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDVcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDZcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDdcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDhcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwicmVhZGluZ18wMDlcIikuZGVsZXRlKCk7XG4gICAgYXdhaXQgcmVhZGluZ0FwaS5yZWFkaW5nQ29sKCkuZG9jKFwiaW1hZ2VfcmVhZGluZ18wMDFcIikuZGVsZXRlKCk7XG4gIH0pO1xufSk7Il19