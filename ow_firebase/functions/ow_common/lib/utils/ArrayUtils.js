"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ArrayUtils =
/*#__PURE__*/
function () {
  function ArrayUtils() {
    _classCallCheck(this, ArrayUtils);
  }

  _createClass(ArrayUtils, null, [{
    key: "mergeArrays",

    /**
      * Merge two arrays together based on an accessor
      * 
      * Note: This doesn't appear to preserve order.
      * @returns Array<T> - the modified array
      */
    value: function mergeArrays(array1, array2, accessor) {
      var newArray = array1.concat(array2);
      return this.dedupArray(newArray, accessor);
    }
    /**
     * Deduplicate an array of items based on an accessor.
     * 
     * Note: This doesn't appear to preserve order.
     * @returns Array<T> - the modified array
     */

  }, {
    key: "dedupArray",
    value: function dedupArray(array, accessor) {
      var dedup = {};
      array.forEach(function (r) {
        var id = accessor(r);
        dedup[id] = r;
      });
      return Object.keys(dedup).map(function (k) {
        return dedup[k];
      });
    }
    /**
     * Deduplicate an array of items based on an accessor while preserving the order
     * of the elements. It removes the Earlier instances, not later.
     *
     * @returns Array<T> - the modified array
     */

  }, {
    key: "dedupArrayPreserveOrder",
    value: function dedupArrayPreserveOrder(array, accessor) {
      var idMap = {};
      array.forEach(function (r) {
        var id = accessor(r);
        idMap[id] = r;
      }); //First map the array to a list of ids only

      var dupIds = array.map(accessor); //Reverse the order of dupIds to keep right-most-items

      var revDupIds = dupIds.reverse(); //Dedup the Ids (this works from the left only)

      var uniqueArray = revDupIds.filter(function (id, pos) {
        return revDupIds.indexOf(id) === pos;
      }); //Map from ids back to array, with left-most duplicates removed

      return uniqueArray.map(function (id) {
        return idMap[id];
      });
    }
  }]);

  return ArrayUtils;
}();

exports.default = ArrayUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9BcnJheVV0aWxzLnRzIl0sIm5hbWVzIjpbIkFycmF5VXRpbHMiLCJhcnJheTEiLCJhcnJheTIiLCJhY2Nlc3NvciIsIm5ld0FycmF5IiwiY29uY2F0IiwiZGVkdXBBcnJheSIsImFycmF5IiwiZGVkdXAiLCJmb3JFYWNoIiwiciIsImlkIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsImsiLCJpZE1hcCIsImR1cElkcyIsInJldkR1cElkcyIsInJldmVyc2UiLCJ1bmlxdWVBcnJheSIsImZpbHRlciIsInBvcyIsImluZGV4T2YiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFFcUJBLFU7Ozs7Ozs7Ozs7QUFFbkI7Ozs7OztnQ0FNNkJDLE0sRUFBa0JDLE0sRUFBa0JDLFEsRUFBd0M7QUFDdkcsVUFBTUMsUUFBUSxHQUFHSCxNQUFNLENBQUNJLE1BQVAsQ0FBY0gsTUFBZCxDQUFqQjtBQUNBLGFBQU8sS0FBS0ksVUFBTCxDQUFtQkYsUUFBbkIsRUFBNkJELFFBQTdCLENBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7K0JBTTRCSSxLLEVBQWlCSixRLEVBQXdDO0FBQ25GLFVBQU1LLEtBQWtCLEdBQUcsRUFBM0I7QUFDQUQsTUFBQUEsS0FBSyxDQUFDRSxPQUFOLENBQWMsVUFBQUMsQ0FBQyxFQUFJO0FBQ2pCLFlBQU1DLEVBQUUsR0FBR1IsUUFBUSxDQUFDTyxDQUFELENBQW5CO0FBQ0FGLFFBQUFBLEtBQUssQ0FBQ0csRUFBRCxDQUFMLEdBQVlELENBQVo7QUFDRCxPQUhEO0FBSUEsYUFBT0UsTUFBTSxDQUFDQyxJQUFQLENBQVlMLEtBQVosRUFBbUJNLEdBQW5CLENBQXVCLFVBQUFDLENBQUM7QUFBQSxlQUFJUCxLQUFLLENBQUNPLENBQUQsQ0FBVDtBQUFBLE9BQXhCLENBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7NENBTXlDUixLLEVBQWlCSixRLEVBQXdDO0FBQ2hHLFVBQU1hLEtBQWtCLEdBQUcsRUFBM0I7QUFDQVQsTUFBQUEsS0FBSyxDQUFDRSxPQUFOLENBQWMsVUFBQUMsQ0FBQyxFQUFJO0FBQ2pCLFlBQU1DLEVBQUUsR0FBR1IsUUFBUSxDQUFDTyxDQUFELENBQW5CO0FBQ0FNLFFBQUFBLEtBQUssQ0FBQ0wsRUFBRCxDQUFMLEdBQVlELENBQVo7QUFDRCxPQUhELEVBRmdHLENBT2hHOztBQUNBLFVBQU1PLE1BQU0sR0FBR1YsS0FBSyxDQUFDTyxHQUFOLENBQVVYLFFBQVYsQ0FBZixDQVJnRyxDQVVoRzs7QUFDQSxVQUFNZSxTQUFTLEdBQUdELE1BQU0sQ0FBQ0UsT0FBUCxFQUFsQixDQVhnRyxDQWFoRzs7QUFDQSxVQUFNQyxXQUFXLEdBQUdGLFNBQVMsQ0FBQ0csTUFBVixDQUFpQixVQUFDVixFQUFELEVBQUtXLEdBQUw7QUFBQSxlQUFhSixTQUFTLENBQUNLLE9BQVYsQ0FBa0JaLEVBQWxCLE1BQTBCVyxHQUF2QztBQUFBLE9BQWpCLENBQXBCLENBZGdHLENBZ0JoRzs7QUFDQSxhQUFPRixXQUFXLENBQUNOLEdBQVosQ0FBZ0IsVUFBQUgsRUFBRTtBQUFBLGVBQUlLLEtBQUssQ0FBQ0wsRUFBRCxDQUFUO0FBQUEsT0FBbEIsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGljdFR5cGUgfSBmcm9tIFwiLi9EaWN0VHlwZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcnJheVV0aWxzIHtcblxuICAvKipcbiAgICAqIE1lcmdlIHR3byBhcnJheXMgdG9nZXRoZXIgYmFzZWQgb24gYW4gYWNjZXNzb3JcbiAgICAqIFxuICAgICogTm90ZTogVGhpcyBkb2Vzbid0IGFwcGVhciB0byBwcmVzZXJ2ZSBvcmRlci5cbiAgICAqIEByZXR1cm5zIEFycmF5PFQ+IC0gdGhlIG1vZGlmaWVkIGFycmF5XG4gICAgKi9cbiAgcHVibGljIHN0YXRpYyBtZXJnZUFycmF5czxUPihhcnJheTE6IEFycmF5PFQ+LCBhcnJheTI6IEFycmF5PFQ+LCBhY2Nlc3NvcjogKGFueTogVCkgPT4gc3RyaW5nKTogQXJyYXk8VD4ge1xuICAgIGNvbnN0IG5ld0FycmF5ID0gYXJyYXkxLmNvbmNhdChhcnJheTIpO1xuICAgIHJldHVybiB0aGlzLmRlZHVwQXJyYXk8VD4obmV3QXJyYXksIGFjY2Vzc29yKVxuICB9XG5cbiAgLyoqXG4gICAqIERlZHVwbGljYXRlIGFuIGFycmF5IG9mIGl0ZW1zIGJhc2VkIG9uIGFuIGFjY2Vzc29yLlxuICAgKiBcbiAgICogTm90ZTogVGhpcyBkb2Vzbid0IGFwcGVhciB0byBwcmVzZXJ2ZSBvcmRlci5cbiAgICogQHJldHVybnMgQXJyYXk8VD4gLSB0aGUgbW9kaWZpZWQgYXJyYXlcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZGVkdXBBcnJheTxUPihhcnJheTogQXJyYXk8VD4sIGFjY2Vzc29yOiAoYW55OiBUKSA9PiBzdHJpbmcpOiBBcnJheTxUPiB7XG4gICAgY29uc3QgZGVkdXA6IERpY3RUeXBlPFQ+ID0ge307XG4gICAgYXJyYXkuZm9yRWFjaChyID0+IHtcbiAgICAgIGNvbnN0IGlkID0gYWNjZXNzb3Iocik7XG4gICAgICBkZWR1cFtpZF0gPSByO1xuICAgIH0pO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhkZWR1cCkubWFwKGsgPT4gZGVkdXBba10pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZHVwbGljYXRlIGFuIGFycmF5IG9mIGl0ZW1zIGJhc2VkIG9uIGFuIGFjY2Vzc29yIHdoaWxlIHByZXNlcnZpbmcgdGhlIG9yZGVyXG4gICAqIG9mIHRoZSBlbGVtZW50cy4gSXQgcmVtb3ZlcyB0aGUgRWFybGllciBpbnN0YW5jZXMsIG5vdCBsYXRlci5cbiAgICpcbiAgICogQHJldHVybnMgQXJyYXk8VD4gLSB0aGUgbW9kaWZpZWQgYXJyYXlcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZGVkdXBBcnJheVByZXNlcnZlT3JkZXI8VD4oYXJyYXk6IEFycmF5PFQ+LCBhY2Nlc3NvcjogKGFueTogVCkgPT4gc3RyaW5nKTogQXJyYXk8VD4ge1xuICAgIGNvbnN0IGlkTWFwOiBEaWN0VHlwZTxUPiA9IHt9O1xuICAgIGFycmF5LmZvckVhY2gociA9PiB7XG4gICAgICBjb25zdCBpZCA9IGFjY2Vzc29yKHIpO1xuICAgICAgaWRNYXBbaWRdID0gcjtcbiAgICB9KTtcblxuICAgIC8vRmlyc3QgbWFwIHRoZSBhcnJheSB0byBhIGxpc3Qgb2YgaWRzIG9ubHlcbiAgICBjb25zdCBkdXBJZHMgPSBhcnJheS5tYXAoYWNjZXNzb3IpO1xuXG4gICAgLy9SZXZlcnNlIHRoZSBvcmRlciBvZiBkdXBJZHMgdG8ga2VlcCByaWdodC1tb3N0LWl0ZW1zXG4gICAgY29uc3QgcmV2RHVwSWRzID0gZHVwSWRzLnJldmVyc2UoKVxuXG4gICAgLy9EZWR1cCB0aGUgSWRzICh0aGlzIHdvcmtzIGZyb20gdGhlIGxlZnQgb25seSlcbiAgICBjb25zdCB1bmlxdWVBcnJheSA9IHJldkR1cElkcy5maWx0ZXIoKGlkLCBwb3MpID0+IHJldkR1cElkcy5pbmRleE9mKGlkKSA9PT0gcG9zKTtcblxuICAgIC8vTWFwIGZyb20gaWRzIGJhY2sgdG8gYXJyYXksIHdpdGggbGVmdC1tb3N0IGR1cGxpY2F0ZXMgcmVtb3ZlZFxuICAgIHJldHVybiB1bmlxdWVBcnJheS5tYXAoaWQgPT4gaWRNYXBbaWRdKTtcbiAgfVxuXG59XG5cbiJdfQ==