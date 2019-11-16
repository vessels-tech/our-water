"use strict";

require("mocha");

var _ArrayUtils = _interopRequireDefault(require("./ArrayUtils"));

var assert = _interopRequireWildcard(require("assert"));

var _model = require("../model");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

describe('Array Utils', function () {
  it('Merges two arrays of strings', function () {
    //Arrange
    var arr1 = ["abc", "def", "hij"];
    var arr2 = ["hij", "klm", "nop", "qrs"]; //Act

    var result = _ArrayUtils.default.mergeArrays(arr1, arr2, function (s) {
      return s;
    }); //Assert


    assert.strictEqual(result.length, 6);
  });
  it('Merges two arrays of resources', function () {
    //Arrange
    var arr1 = [_objectSpread({}, _model.DefaultMyWellResource, {
      id: "00001"
    }), _objectSpread({}, _model.DefaultMyWellResource, {
      id: "00002"
    }), _objectSpread({}, _model.DefaultMyWellResource, {
      id: "00003"
    })];
    var arr2 = [_objectSpread({}, _model.DefaultMyWellResource, {
      id: "00001"
    }), _objectSpread({}, _model.DefaultMyWellResource, {
      id: "00002"
    }), _objectSpread({}, _model.DefaultMyWellResource, {
      id: "00003"
    }), _objectSpread({}, _model.DefaultMyWellResource, {
      id: "00004"
    }), _objectSpread({}, _model.DefaultMyWellResource, {
      id: "00005"
    })]; //Act

    var result = _ArrayUtils.default.mergeArrays(arr1, arr2, function (s) {
      return s.id;
    }); //Assert


    assert.strictEqual(result.length, 5);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9BcnJheVV0aWxzLnVuaXQudHMiXSwibmFtZXMiOlsiZGVzY3JpYmUiLCJpdCIsImFycjEiLCJhcnIyIiwicmVzdWx0IiwiQXJyYXlVdGlscyIsIm1lcmdlQXJyYXlzIiwicyIsImFzc2VydCIsInN0cmljdEVxdWFsIiwibGVuZ3RoIiwiRGVmYXVsdE15V2VsbFJlc291cmNlIiwiaWQiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFJQUEsUUFBUSxDQUFDLGFBQUQsRUFBZ0IsWUFBVztBQUVqQ0MsRUFBQUEsRUFBRSxDQUFDLDhCQUFELEVBQWlDLFlBQU07QUFDdkM7QUFDQSxRQUFNQyxJQUFJLEdBQUcsQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsQ0FBYjtBQUNBLFFBQU1DLElBQUksR0FBRyxDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixLQUF0QixDQUFiLENBSHVDLENBS3ZDOztBQUNBLFFBQU1DLE1BQU0sR0FBR0Msb0JBQVdDLFdBQVgsQ0FBdUJKLElBQXZCLEVBQTZCQyxJQUE3QixFQUFtQyxVQUFDSSxDQUFEO0FBQUEsYUFBT0EsQ0FBUDtBQUFBLEtBQW5DLENBQWYsQ0FOdUMsQ0FRdkM7OztBQUNBQyxJQUFBQSxNQUFNLENBQUNDLFdBQVAsQ0FBbUJMLE1BQU0sQ0FBQ00sTUFBMUIsRUFBa0MsQ0FBbEM7QUFDRCxHQVZDLENBQUY7QUFhQVQsRUFBQUEsRUFBRSxDQUFDLGdDQUFELEVBQW1DLFlBQU07QUFDekM7QUFDQSxRQUFNQyxJQUFnQixHQUFHLG1CQUNuQlMsNEJBRG1CO0FBQ0lDLE1BQUFBLEVBQUUsRUFBRTtBQURSLDBCQUVuQkQsNEJBRm1CO0FBRUlDLE1BQUFBLEVBQUUsRUFBRTtBQUZSLDBCQUduQkQsNEJBSG1CO0FBR0lDLE1BQUFBLEVBQUUsRUFBRTtBQUhSLE9BQXpCO0FBS0EsUUFBTVQsSUFBZ0IsR0FBRyxtQkFDbkJRLDRCQURtQjtBQUNJQyxNQUFBQSxFQUFFLEVBQUU7QUFEUiwwQkFFbkJELDRCQUZtQjtBQUVJQyxNQUFBQSxFQUFFLEVBQUU7QUFGUiwwQkFHbkJELDRCQUhtQjtBQUdJQyxNQUFBQSxFQUFFLEVBQUU7QUFIUiwwQkFJbkJELDRCQUptQjtBQUlJQyxNQUFBQSxFQUFFLEVBQUU7QUFKUiwwQkFLbkJELDRCQUxtQjtBQUtJQyxNQUFBQSxFQUFFLEVBQUU7QUFMUixPQUF6QixDQVB5QyxDQWV6Qzs7QUFDQSxRQUFNUixNQUFNLEdBQUdDLG9CQUFXQyxXQUFYLENBQXVCSixJQUF2QixFQUE2QkMsSUFBN0IsRUFBbUMsVUFBQ0ksQ0FBRDtBQUFBLGFBQU9BLENBQUMsQ0FBQ0ssRUFBVDtBQUFBLEtBQW5DLENBQWYsQ0FoQnlDLENBa0J6Qzs7O0FBQ0FKLElBQUFBLE1BQU0sQ0FBQ0MsV0FBUCxDQUFtQkwsTUFBTSxDQUFDTSxNQUExQixFQUFrQyxDQUFsQztBQUNELEdBcEJDLENBQUY7QUFzQkQsQ0FyQ08sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnbW9jaGEnO1xuaW1wb3J0IEFycmF5VXRpbHMgZnJvbSBcIi4vQXJyYXlVdGlsc1wiO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBSZXNvdXJjZSwgRGVmYXVsdE15V2VsbFJlc291cmNlIH0gZnJvbSAnLi4vbW9kZWwnO1xuXG5cblxuZGVzY3JpYmUoJ0FycmF5IFV0aWxzJywgZnVuY3Rpb24oKSB7XG5cbiAgaXQoJ01lcmdlcyB0d28gYXJyYXlzIG9mIHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgLy9BcnJhbmdlXG4gICAgY29uc3QgYXJyMSA9IFtcImFiY1wiLCBcImRlZlwiLCBcImhpalwiXTtcbiAgICBjb25zdCBhcnIyID0gW1wiaGlqXCIsIFwia2xtXCIsIFwibm9wXCIsIFwicXJzXCJdO1xuXG4gICAgLy9BY3RcbiAgICBjb25zdCByZXN1bHQgPSBBcnJheVV0aWxzLm1lcmdlQXJyYXlzKGFycjEsIGFycjIsIChzKSA9PiBzKTtcblxuICAgIC8vQXNzZXJ0XG4gICAgYXNzZXJ0LnN0cmljdEVxdWFsKHJlc3VsdC5sZW5ndGgsIDYpO1xuICB9KTtcblxuXG4gIGl0KCdNZXJnZXMgdHdvIGFycmF5cyBvZiByZXNvdXJjZXMnLCAoKSA9PiB7XG4gICAgLy9BcnJhbmdlXG4gICAgY29uc3QgYXJyMTogUmVzb3VyY2VbXSA9IFtcbiAgICAgIHsuLi5EZWZhdWx0TXlXZWxsUmVzb3VyY2UsIGlkOiBcIjAwMDAxXCJ9LFxuICAgICAgey4uLkRlZmF1bHRNeVdlbGxSZXNvdXJjZSwgaWQ6IFwiMDAwMDJcIn0sXG4gICAgICB7Li4uRGVmYXVsdE15V2VsbFJlc291cmNlLCBpZDogXCIwMDAwM1wifSxcbiAgICBdO1xuICAgIGNvbnN0IGFycjI6IFJlc291cmNlW10gPSBbXG4gICAgICB7Li4uRGVmYXVsdE15V2VsbFJlc291cmNlLCBpZDogXCIwMDAwMVwifSxcbiAgICAgIHsuLi5EZWZhdWx0TXlXZWxsUmVzb3VyY2UsIGlkOiBcIjAwMDAyXCJ9LFxuICAgICAgey4uLkRlZmF1bHRNeVdlbGxSZXNvdXJjZSwgaWQ6IFwiMDAwMDNcIn0sXG4gICAgICB7Li4uRGVmYXVsdE15V2VsbFJlc291cmNlLCBpZDogXCIwMDAwNFwifSxcbiAgICAgIHsuLi5EZWZhdWx0TXlXZWxsUmVzb3VyY2UsIGlkOiBcIjAwMDA1XCJ9LFxuICAgIF07XG5cbiAgICAvL0FjdFxuICAgIGNvbnN0IHJlc3VsdCA9IEFycmF5VXRpbHMubWVyZ2VBcnJheXMoYXJyMSwgYXJyMiwgKHMpID0+IHMuaWQpO1xuXG4gICAgLy9Bc3NlcnRcbiAgICBhc3NlcnQuc3RyaWN0RXF1YWwocmVzdWx0Lmxlbmd0aCwgNSk7XG4gIH0pO1xuXG59KTsiXX0=