"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExportApi = exports.ExportFormat = void 0;

var _util = require("util");

var _utils = require("../utils");

var _ReadingApi = require("./ReadingApi");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ExportFormat;
/**
 * Saftely get a key from the resource
 */

exports.ExportFormat = ExportFormat;

(function (ExportFormat) {
  ExportFormat["TSV"] = "TSV";
  ExportFormat["CSV"] = "CSV";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));

function safeGet(key, reading) {
  // TODO: handle nested values
  var value = reading[key];

  if ((0, _util.isNullOrUndefined)(value)) {
    return "";
  }

  return "".concat(value);
}

var ExportApi =
/*#__PURE__*/
function () {
  function ExportApi() {
    _classCallCheck(this, ExportApi);
  }

  _createClass(ExportApi, null, [{
    key: "exportReadingImages",

    /**
     * exportReadingImages
     * 
     * Export a set of images attached to a reading as an array of base64 strings
     */
    value: function exportReadingImages(readings) {
      var readingImages = [];
      readings.forEach(function (r) {
        var image = (0, _utils.safeGetNested)(r, ['image']);

        if ((0, _utils.isDefined)(image)) {
          readingImages.push({
            //TODO: timezones may make this buggy, and make hashed ids maligned
            id: _ReadingApi.ReadingApi.hashReadingId(r.resourceId, r.timeseriesId, new Date(r.datetime)),
            base64: image.base64Image
          });
        }
      });
      return readingImages;
    }
    /**
     * readingsToExport
     * 
     * Format a set of readings for a given export format
     */

  }, {
    key: "readingsToExport",
    value: function readingsToExport(readings, format) {
      var _this = this;

      return readings.reduce(function (acc, curr) {
        return acc + _this.formatReading(curr, format) + '\n';
      }, '');
    }
  }, {
    key: "formatReading",
    value: function formatReading(reading, format) {
      var separator = ",";

      if (format === ExportFormat.TSV) {
        separator = '\t';
      }

      var eligibleKeys = [{
        id: 'id',
        accessor: function accessor(id) {
          return safeGet(id, reading);
        }
      }, //Handle legacy timestamps from Firestore
      {
        id: 'datetime',
        accessor: function accessor(id) {
          //@ts-ignore
          var dateRaw = reading[id];

          if ((0, _util.isNullOrUndefined)(dateRaw)) {
            return "";
          } // @ts-ignore


          if (dateRaw.toDate) {
            // @ts-ignore
            var jsDate = dateRaw.toDate();
            return jsDate.toISOString();
          }

          return dateRaw;
        }
      }, {
        id: 'resourceId',
        accessor: function accessor(id) {
          return safeGet(id, reading);
        }
      }, {
        id: 'resourceType',
        accessor: function accessor(id) {
          return safeGet(id, reading);
        }
      }, {
        id: 'timeseriesId',
        accessor: function accessor(id) {
          return safeGet(id, reading);
        }
      }, {
        id: 'value',
        accessor: function accessor(id) {
          return safeGet(id, reading);
        }
      }, //Mywell fields:
      {
        id: 'image',
        accessor: function accessor(id) {
          return safeGet(id, reading);
        }
      }, {
        id: 'location',
        accessor: function accessor(id) {
          return safeGet(id, reading);
        }
      }];
      var formatted = eligibleKeys.reduce(function (acc, curr) {
        return acc + curr.accessor(curr.id) + separator;
      }, '');
      return formatted;
    }
  }]);

  return ExportApi;
}();

exports.ExportApi = ExportApi;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvRXhwb3J0QXBpLnRzIl0sIm5hbWVzIjpbIkV4cG9ydEZvcm1hdCIsInNhZmVHZXQiLCJrZXkiLCJyZWFkaW5nIiwidmFsdWUiLCJFeHBvcnRBcGkiLCJyZWFkaW5ncyIsInJlYWRpbmdJbWFnZXMiLCJmb3JFYWNoIiwiciIsImltYWdlIiwicHVzaCIsImlkIiwiUmVhZGluZ0FwaSIsImhhc2hSZWFkaW5nSWQiLCJyZXNvdXJjZUlkIiwidGltZXNlcmllc0lkIiwiRGF0ZSIsImRhdGV0aW1lIiwiYmFzZTY0IiwiYmFzZTY0SW1hZ2UiLCJmb3JtYXQiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwiZm9ybWF0UmVhZGluZyIsInNlcGFyYXRvciIsIlRTViIsImVsaWdpYmxlS2V5cyIsImFjY2Vzc29yIiwiZGF0ZVJhdyIsInRvRGF0ZSIsImpzRGF0ZSIsInRvSVNPU3RyaW5nIiwiZm9ybWF0dGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0lBR1lBLFk7QUFLWjs7Ozs7O1dBTFlBLFk7QUFBQUEsRUFBQUEsWTtBQUFBQSxFQUFBQSxZO0dBQUFBLFksNEJBQUFBLFk7O0FBUVosU0FBU0MsT0FBVCxDQUFpQkMsR0FBakIsRUFBOEJDLE9BQTlCLEVBQXdEO0FBRXREO0FBRUEsTUFBSUMsS0FBVSxHQUFHRCxPQUFPLENBQUNELEdBQUQsQ0FBeEI7O0FBQ0EsTUFBSSw2QkFBa0JFLEtBQWxCLENBQUosRUFBOEI7QUFDNUIsV0FBTyxFQUFQO0FBQ0Q7O0FBRUQsbUJBQVVBLEtBQVY7QUFDRDs7SUFFWUMsUzs7Ozs7Ozs7OztBQUVYOzs7Ozt3Q0FLa0NDLFEsRUFBNEQ7QUFDNUYsVUFBTUMsYUFBb0QsR0FBRyxFQUE3RDtBQUVBRCxNQUFBQSxRQUFRLENBQUNFLE9BQVQsQ0FBaUIsVUFBQUMsQ0FBQyxFQUFJO0FBQ3BCLFlBQU1DLEtBQXFDLEdBQUcsMEJBQWNELENBQWQsRUFBaUIsQ0FBQyxPQUFELENBQWpC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QUFDVyxFQUFELEVBQUtULE9BQUwsQ0FBdkI7QUFBQTtBQUF6QixPQTFCMEUsRUEyQjFFO0FBQUVTLFFBQUFBLEVBQUUsRUFBRSxVQUFOO0FBQWtCaUIsUUFBQUEsUUFBUSxFQUFFLGtCQUFDakIsRUFBRDtBQUFBLGlCQUFnQlgsT0FBTyxDQUFDVyxFQUFELEVBQUtULE9BQUwsQ0FBdkI7QUFBQTtBQUE1QixPQTNCMEUsQ0FBNUU7QUE4QkEsVUFBTStCLFNBQVMsR0FBR04sWUFBWSxDQUFDTixNQUFiLENBQW9CLFVBQUNDLEdBQUQsRUFBTUMsSUFBTixFQUFlO0FBQ25ELGVBQU9ELEdBQUcsR0FBR0MsSUFBSSxDQUFDSyxRQUFMLENBQWNMLElBQUksQ0FBQ1osRUFBbkIsQ0FBTixHQUErQmMsU0FBdEM7QUFDRCxPQUZpQixFQUVmLEVBRmUsQ0FBbEI7QUFJQSxhQUFPUSxTQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZWFkaW5nIH0gZnJvbSBcIi4uL21vZGVsXCI7XG5pbXBvcnQgeyBpc051bGxPclVuZGVmaW5lZCB9IGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBNYXliZSwgc2FmZUdldE5lc3RlZCwgaXNEZWZpbmVkIH0gZnJvbSBcIi4uL3V0aWxzXCI7XG5pbXBvcnQgeyBSZWFkaW5nQXBpIH0gZnJvbSBcIi4vUmVhZGluZ0FwaVwiO1xuXG5cbmV4cG9ydCBlbnVtIEV4cG9ydEZvcm1hdCB7XG4gIFRTVj0nVFNWJyxcbiAgQ1NWPSdDU1YnLFxufVxuXG4vKipcbiAqIFNhZnRlbHkgZ2V0IGEga2V5IGZyb20gdGhlIHJlc291cmNlXG4gKi9cbmZ1bmN0aW9uIHNhZmVHZXQoa2V5OiBzdHJpbmcsIHJlYWRpbmc6IFJlYWRpbmcpOiBzdHJpbmcge1xuXG4gIC8vIFRPRE86IGhhbmRsZSBuZXN0ZWQgdmFsdWVzXG4gIC8vQHRzLWlnbm9yZVxuICBsZXQgdmFsdWU6IGFueSA9IHJlYWRpbmdba2V5XTtcbiAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG5cbiAgcmV0dXJuIGAke3ZhbHVlfWA7XG59XG5cbmV4cG9ydCBjbGFzcyBFeHBvcnRBcGkge1xuXG4gIC8qKlxuICAgKiBleHBvcnRSZWFkaW5nSW1hZ2VzXG4gICAqIFxuICAgKiBFeHBvcnQgYSBzZXQgb2YgaW1hZ2VzIGF0dGFjaGVkIHRvIGEgcmVhZGluZyBhcyBhbiBhcnJheSBvZiBiYXNlNjQgc3RyaW5nc1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBleHBvcnRSZWFkaW5nSW1hZ2VzKHJlYWRpbmdzOiBSZWFkaW5nW10pOiBBcnJheTx7IGlkOiBzdHJpbmcsIGJhc2U2NDogc3RyaW5nIH0+IHtcbiAgICBjb25zdCByZWFkaW5nSW1hZ2VzOiBBcnJheTx7IGlkOiBzdHJpbmcsIGJhc2U2NDogc3RyaW5nIH0+ID0gW107XG5cbiAgICByZWFkaW5ncy5mb3JFYWNoKHIgPT4ge1xuICAgICAgY29uc3QgaW1hZ2U6IE1heWJlPHsgYmFzZTY0SW1hZ2U6IHN0cmluZyB9PiA9IHNhZmVHZXROZXN0ZWQociwgWydpbWFnZSddKTtcbiAgICAgIGlmIChpc0RlZmluZWQoaW1hZ2UpKSB7XG4gICAgICAgIHJlYWRpbmdJbWFnZXMucHVzaCh7XG4gICAgICAgICAgLy9UT0RPOiB0aW1lem9uZXMgbWF5IG1ha2UgdGhpcyBidWdneSwgYW5kIG1ha2UgaGFzaGVkIGlkcyBtYWxpZ25lZFxuICAgICAgICAgIGlkOiBSZWFkaW5nQXBpLmhhc2hSZWFkaW5nSWQoci5yZXNvdXJjZUlkLCByLnRpbWVzZXJpZXNJZCwgbmV3IERhdGUoci5kYXRldGltZSkpLFxuICAgICAgICAgIGJhc2U2NDogaW1hZ2UuYmFzZTY0SW1hZ2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVhZGluZ0ltYWdlcztcbiAgfVxuXG4gIC8qKlxuICAgKiByZWFkaW5nc1RvRXhwb3J0XG4gICAqIFxuICAgKiBGb3JtYXQgYSBzZXQgb2YgcmVhZGluZ3MgZm9yIGEgZ2l2ZW4gZXhwb3J0IGZvcm1hdFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkaW5nc1RvRXhwb3J0KHJlYWRpbmdzOiBSZWFkaW5nW10sIGZvcm1hdDogRXhwb3J0Rm9ybWF0KTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmVhZGluZ3MucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIHRoaXMuZm9ybWF0UmVhZGluZyhjdXJyLCBmb3JtYXQpICsgJ1xcbicsJycpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGZvcm1hdFJlYWRpbmcocmVhZGluZzogUmVhZGluZywgZm9ybWF0OiBFeHBvcnRGb3JtYXQpOiBzdHJpbmcge1xuICAgIGxldCBzZXBhcmF0b3IgPSBcIixcIjtcbiAgICBpZiAoZm9ybWF0ID09PSBFeHBvcnRGb3JtYXQuVFNWKSB7XG4gICAgICBzZXBhcmF0b3IgPSAnXFx0JztcbiAgICB9XG5cbiAgICBjb25zdCBlbGlnaWJsZUtleXM6IEFycmF5PHtpZDogc3RyaW5nLCBhY2Nlc3NvcjogKGlkOiBzdHJpbmcpID0+IHN0cmluZ30+ID0gW1xuICAgICAge2lkOiAnaWQnLCBhY2Nlc3NvcjogKGlkOiBzdHJpbmcpID0+IHNhZmVHZXQoaWQsIHJlYWRpbmcpIH0sIFxuXG4gICAgICAvL0hhbmRsZSBsZWdhY3kgdGltZXN0YW1wcyBmcm9tIEZpcmVzdG9yZVxuICAgICAge2lkOiAnZGF0ZXRpbWUnLCBhY2Nlc3NvcjogKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgIGxldCBkYXRlUmF3OiBhbnkgPSByZWFkaW5nW2lkXTtcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGRhdGVSYXcpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChkYXRlUmF3LnRvRGF0ZSkge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICBjb25zdCBqc0RhdGU6IERhdGUgPSBkYXRlUmF3LnRvRGF0ZSgpO1xuICAgICAgICAgIHJldHVybiBqc0RhdGUudG9JU09TdHJpbmcoKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGVSYXc7XG4gICAgICB9fSwgXG4gICAgICB7aWQ6ICdyZXNvdXJjZUlkJywgYWNjZXNzb3I6IChpZDogc3RyaW5nKSA9PiBzYWZlR2V0KGlkLCByZWFkaW5nKSB9LCBcbiAgICAgIHtpZDogJ3Jlc291cmNlVHlwZScsIGFjY2Vzc29yOiAoaWQ6IHN0cmluZykgPT4gc2FmZUdldChpZCwgcmVhZGluZykgfSwgXG4gICAgICB7aWQ6ICd0aW1lc2VyaWVzSWQnLCBhY2Nlc3NvcjogKGlkOiBzdHJpbmcpID0+IHNhZmVHZXQoaWQsIHJlYWRpbmcpIH0sIFxuICAgICAge2lkOiAndmFsdWUnLCBhY2Nlc3NvcjogKGlkOiBzdHJpbmcpID0+IHNhZmVHZXQoaWQsIHJlYWRpbmcpIH0sIFxuXG4gICAgICAvL015d2VsbCBmaWVsZHM6XG4gICAgICB7IGlkOiAnaW1hZ2UnLCBhY2Nlc3NvcjogKGlkOiBzdHJpbmcpID0+IHNhZmVHZXQoaWQsIHJlYWRpbmcpIH0sIFxuICAgICAgeyBpZDogJ2xvY2F0aW9uJywgYWNjZXNzb3I6IChpZDogc3RyaW5nKSA9PiBzYWZlR2V0KGlkLCByZWFkaW5nKSB9LCBcbiAgICBdO1xuXG4gICAgY29uc3QgZm9ybWF0dGVkID0gZWxpZ2libGVLZXlzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XG4gICAgICByZXR1cm4gYWNjICsgY3Vyci5hY2Nlc3NvcihjdXJyLmlkKSArIHNlcGFyYXRvcjtcbiAgICB9LCAnJyk7XG5cbiAgICByZXR1cm4gZm9ybWF0dGVkO1xuICB9XG5cblxuXG59Il19