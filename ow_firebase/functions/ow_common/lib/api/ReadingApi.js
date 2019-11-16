"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReadingApi = void 0;

var _model = require("../model");

var _utils = require("../utils");

var _btoa = _interopRequireDefault(require("btoa"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ReadingApi =
/*#__PURE__*/
function () {
  function ReadingApi(firestore, orgId) {
    _classCallCheck(this, ReadingApi);

    _defineProperty(this, "firestore", void 0);

    _defineProperty(this, "orgId", void 0);

    this.firestore = firestore;
    this.orgId = orgId;
  }
  /**
   * getReadingsForResources
   * 
   * Given a list of resourceIds, get all of the readings for the resources up to 
   * a limit of n (params.limit). Implementing this limit will be tricky as Firestore
   * doesn't currently support OR queries, meaning that we will have to merge and keep
   * track of of cursors for each id.
   * 
   * For now gets the latest n readings for the given resources, but if needed we 
   * may add the ability to filter by date. Also ignores the lastVisible, as we 
   * can't really implement paginiation across multiple queries very easily atm.
   * 
   * This also wont respect date ordering from one resource to another, as the individual 
   * date queries are merged together.
   * 
   * @param resourceIds 
   * @param params 
   */


  _createClass(ReadingApi, [{
    key: "getReadingsForResources",
    value: function () {
      var _getReadingsForResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(resourceIds, params) {
        var _this = this;

        var readingsResults, readings, errors, message;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                //Hard rules because of firebase restrictions
                delete params.lastVisible;
                params.limit = 100;
                _context.next = 4;
                return Promise.all(resourceIds.map(function (id) {
                  return _this.getReadingsForResourceId(id, params);
                }));

              case 4:
                readingsResults = _context.sent;
                readings = [];
                errors = [];
                readingsResults.forEach(function (result) {
                  if (result.type === _utils.ResultType.ERROR) {
                    errors.push(result);
                    return;
                  }

                  readings = readings.concat(result.result.readings);
                });

                if (!(errors.length > 0)) {
                  _context.next = 11;
                  break;
                }

                message = errors.reduce(function (acc, curr) {
                  return acc + " " + curr.message;
                }, "Multiple Errors:");
                return _context.abrupt("return", (0, _utils.makeError)(message));

              case 11:
                return _context.abrupt("return", (0, _utils.makeSuccess)({
                  params: params,
                  readings: readings
                }));

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getReadingsForResources(_x, _x2) {
        return _getReadingsForResources.apply(this, arguments);
      }

      return getReadingsForResources;
    }()
    /**
     * getReadingsForResourceId
     *
     * Given a resourceId, get all of the readings for the resources up to
     * a limit of n (params.limit)
     * 
     * For now gets the latest n readings for the given resources, but if needed we
     * may add the ability to filter by date
     *
     * @param resourceId
     * @param params
     */

  }, {
    key: "getReadingsForResourceId",
    value: function () {
      var _getReadingsForResourceId = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(resourceId, params) {
        var query, lastVisible;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                query = this.readingCol().where("resourceId", '==', resourceId) //I think these results will be ordered, since the readingIds are ordered inherently, but here:
                .orderBy('datetime', 'desc');

                if (params.lastVisible) {
                  query = query.startAfter(params.lastVisible);
                }

                query = query.limit((0, _utils.safeLower)(params.limit, 100)); //Run the query

                _context2.next = 5;
                return query.get().then(function (sn) {
                  var readingResults = [];
                  lastVisible = sn.docs[sn.docs.length - 1];
                  sn.forEach(function (doc) {
                    var data = doc.data();

                    if (!data) {
                      return;
                    }

                    var reading = _objectSpread({}, _model.DefaultReading, data);

                    readingResults.push(reading);
                  });
                  return readingResults;
                }).then(function (readings) {
                  var readingResult = {
                    params: _objectSpread({}, params, {
                      lastVisible: lastVisible
                    }),
                    readings: readings
                  };
                  return (0, _utils.makeSuccess)(readingResult);
                }).catch(function (err) {
                  return (0, _utils.makeError)(err.message);
                });

              case 5:
                return _context2.abrupt("return", _context2.sent);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getReadingsForResourceId(_x3, _x4) {
        return _getReadingsForResourceId.apply(this, arguments);
      }

      return getReadingsForResourceId;
    }()
    /**
     * bulkSaveReadings
     * 
     * Save readings in bulk
     */

  }, {
    key: "bulkUploadReadings",
    value: function () {
      var _bulkUploadReadings = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(readings, batchSize) {
        var _this2 = this;

        var readingBatches, writeResults, batchSaveResult;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                readingBatches = (0, _utils.chunkArray)(readings, batchSize);
                writeResults = [];
                _context4.next = 4;
                return readingBatches.reduce(
                /*#__PURE__*/
                function () {
                  var _ref = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee3(acc, curr, idx) {
                    var lastResult, batch;
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            _context3.next = 2;
                            return acc;

                          case 2:
                            lastResult = _context3.sent;

                            if (!(lastResult.type === _utils.ResultType.ERROR)) {
                              _context3.next = 5;
                              break;
                            }

                            return _context3.abrupt("return", Promise.resolve(lastResult));

                          case 5:
                            batch = _this2.firestore.batch();
                            curr.forEach(function (reading) {
                              var id = ReadingApi.hashReadingId(reading.resourceId, reading.timeseriesId, new Date(reading.datetime));

                              var ref = _this2.readingCol().doc(id);

                              batch.set(ref, _objectSpread({}, _model.DefaultReading, reading));
                            });
                            _context3.next = 9;
                            return ReadingApi.commitBatch(batch).then(function (result) {
                              if (result.type === _utils.ResultType.SUCCESS) {
                                writeResults = writeResults.concat(result.result);
                              }

                              return result;
                            });

                          case 9:
                            return _context3.abrupt("return", _context3.sent);

                          case 10:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3, this);
                  }));

                  return function (_x7, _x8, _x9) {
                    return _ref.apply(this, arguments);
                  };
                }(), Promise.resolve((0, _utils.makeSuccess)(undefined)));

              case 4:
                batchSaveResult = _context4.sent;

                if (!(batchSaveResult.type === _utils.ResultType.ERROR)) {
                  _context4.next = 7;
                  break;
                }

                return _context4.abrupt("return", batchSaveResult);

              case 7:
                return _context4.abrupt("return", (0, _utils.makeSuccess)(writeResults));

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function bulkUploadReadings(_x5, _x6) {
        return _bulkUploadReadings.apply(this, arguments);
      }

      return bulkUploadReadings;
    }()
    /**
     * getReadingImage
     * 
     * Get the reading image for a given reading id
     * 
     * @param readingId - the hashed readingId
     * @returns Promise<SomeResult<string>> - a base64 encoded string of the image in png format
     */

  }, {
    key: "getReadingImage",
    value: function getReadingImage(readingId) {
      return this.readingCol().doc(readingId).get().then(function (doc) {
        if (!doc.data()) {
          return (0, _utils.makeError)("No reading found for readingId: ".concat(readingId));
        }

        var base64Image = (0, _utils.safeGetNested)(doc.data(), ['image', 'base64Image']);

        if (!base64Image) {
          return (0, _utils.makeError)("No image found for readingId: ".concat(readingId));
        }

        return (0, _utils.makeSuccess)(base64Image);
      }).catch(function (err) {
        return (0, _utils.makeError)(err.message);
      });
    }
  }, {
    key: "readingCol",
    value: function readingCol() {
      return this.firestore.collection('org').doc(this.orgId).collection('reading');
    }
    /**
     * The Id for a reading is generated as a hash of the
     * reading's dateTime + ResourceId + timeseriesId.
     * 
     * For now, we can just encode it as a base64 string
     */

  }], [{
    key: "hashReadingId",
    value: function hashReadingId(resourceId, timeseriesId, dateTime) {
      var input = "".concat(resourceId, "_").concat(timeseriesId, "_").concat(dateTime.valueOf());
      return (0, _btoa.default)(input);
    }
  }, {
    key: "commitBatch",
    value: function commitBatch(batch) {
      return batch.commit().then(function (res) {
        return (0, _utils.makeSuccess)(res);
      }).catch(function (err) {
        return (0, _utils.makeError)(err.message);
      });
    }
  }]);

  return ReadingApi;
}();

exports.ReadingApi = ReadingApi;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvUmVhZGluZ0FwaS50cyJdLCJuYW1lcyI6WyJSZWFkaW5nQXBpIiwiZmlyZXN0b3JlIiwib3JnSWQiLCJyZXNvdXJjZUlkcyIsInBhcmFtcyIsImxhc3RWaXNpYmxlIiwibGltaXQiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiaWQiLCJnZXRSZWFkaW5nc0ZvclJlc291cmNlSWQiLCJyZWFkaW5nc1Jlc3VsdHMiLCJyZWFkaW5ncyIsImVycm9ycyIsImZvckVhY2giLCJyZXN1bHQiLCJ0eXBlIiwiUmVzdWx0VHlwZSIsIkVSUk9SIiwicHVzaCIsImNvbmNhdCIsImxlbmd0aCIsIm1lc3NhZ2UiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwicmVzb3VyY2VJZCIsInF1ZXJ5IiwicmVhZGluZ0NvbCIsIndoZXJlIiwib3JkZXJCeSIsInN0YXJ0QWZ0ZXIiLCJnZXQiLCJ0aGVuIiwic24iLCJyZWFkaW5nUmVzdWx0cyIsImRvY3MiLCJkb2MiLCJkYXRhIiwicmVhZGluZyIsIkRlZmF1bHRSZWFkaW5nIiwicmVhZGluZ1Jlc3VsdCIsImNhdGNoIiwiZXJyIiwiYmF0Y2hTaXplIiwicmVhZGluZ0JhdGNoZXMiLCJ3cml0ZVJlc3VsdHMiLCJpZHgiLCJsYXN0UmVzdWx0IiwicmVzb2x2ZSIsImJhdGNoIiwiaGFzaFJlYWRpbmdJZCIsInRpbWVzZXJpZXNJZCIsIkRhdGUiLCJkYXRldGltZSIsInJlZiIsInNldCIsImNvbW1pdEJhdGNoIiwiU1VDQ0VTUyIsInVuZGVmaW5lZCIsImJhdGNoU2F2ZVJlc3VsdCIsInJlYWRpbmdJZCIsImJhc2U2NEltYWdlIiwiY29sbGVjdGlvbiIsImRhdGVUaW1lIiwiaW5wdXQiLCJ2YWx1ZU9mIiwiY29tbWl0IiwicmVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBR0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVhQSxVOzs7QUFLWCxzQkFBWUMsU0FBWixFQUFrQ0MsS0FBbEMsRUFBaUQ7QUFBQTs7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RUFBNkN1QixTQUE3QyxFQUFQO0FBQ0Q7O0FBQ0QsWUFBTUMsV0FBVyxHQUFHLDBCQUFjekIsR0FBRyxDQUFDQyxJQUFKLEVBQWQsRUFBMEIsQ0FBQyxPQUFELEVBQVUsYUFBVixDQUExQixDQUFwQjs7QUFDQSxZQUFJLENBQUN3QixXQUFMLEVBQWtCO0FBQ2hCLGlCQUFPLDhEQUEyQ0QsU0FBM0MsRUFBUDtBQUNEOztBQUVELGVBQU8sd0JBQVlDLFdBQVosQ0FBUDtBQUNELE9BWEksRUFZSnBCLEtBWkksQ0FZRSxVQUFBQyxHQUFHO0FBQUEsZUFBSSxzQkFBVUEsR0FBRyxDQUFDckIsT0FBZCxDQUFKO0FBQUEsT0FaTCxDQUFQO0FBYUQ7OztpQ0FFd0M7QUFDdkMsYUFBTyxLQUFLdEIsU0FBTCxDQUFlK0QsVUFBZixDQUEwQixLQUExQixFQUFpQzFCLEdBQWpDLENBQXFDLEtBQUtwQyxLQUExQyxFQUFpRDhELFVBQWpELENBQTRELFNBQTVELENBQVA7QUFDRDtBQUdEOzs7Ozs7Ozs7a0NBTTRCckMsVSxFQUFvQjBCLFksRUFBc0JZLFEsRUFBd0I7QUFDNUYsVUFBTUMsS0FBSyxhQUFNdkMsVUFBTixjQUFvQjBCLFlBQXBCLGNBQW9DWSxRQUFRLENBQUNFLE9BQVQsRUFBcEMsQ0FBWDtBQUNBLGFBQU8sbUJBQUtELEtBQUwsQ0FBUDtBQUNEOzs7Z0NBRXlCZixLLEVBQWdHO0FBQ3hILGFBQU9BLEtBQUssQ0FBQ2lCLE1BQU4sR0FDTmxDLElBRE0sQ0FDRCxVQUFBbUMsR0FBRztBQUFBLGVBQUksd0JBQVlBLEdBQVosQ0FBSjtBQUFBLE9BREYsRUFFTjFCLEtBRk0sQ0FFQSxVQUFDQyxHQUFEO0FBQUEsZUFBZ0Isc0JBQWdEQSxHQUFHLENBQUNyQixPQUFwRCxDQUFoQjtBQUFBLE9BRkEsQ0FBUDtBQUdEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IHsgU29tZVJlc3VsdCwgbWFrZUVycm9yLCBtYWtlU3VjY2VzcywgUmVzdWx0VHlwZSwgRXJyb3JSZXN1bHQgfSBmcm9tIFwiLi4vdXRpbHMvQXBwUHJvdmlkZXJUeXBlc1wiO1xuaW1wb3J0ICogYXMgYWRtaW4gZnJvbSBcImZpcmViYXNlLWFkbWluXCI7XG5pbXBvcnQgeyBEb2N1bWVudFNuYXBzaG90LCBDb2xsZWN0aW9uUmVmZXJlbmNlLCBRdWVyeURvY3VtZW50U25hcHNob3QsIFF1ZXJ5U25hcHNob3QgfSBmcm9tIFwiQGdvb2dsZS1jbG91ZC9maXJlc3RvcmVcIjtcbmltcG9ydCB7IFJlYWRpbmcsIERlZmF1bHRSZWFkaW5nIH0gZnJvbSBcIi4uL21vZGVsXCI7XG5pbXBvcnQgeyBTb21lUmVzdWx0LCBzYWZlTG93ZXIsIG1ha2VTdWNjZXNzLCBtYWtlRXJyb3IsIEVycm9yUmVzdWx0LCBSZXN1bHRUeXBlLCBjaHVua0FycmF5LCBzYWZlR2V0TmVzdGVkIH0gZnJvbSBcIi4uL3V0aWxzXCI7XG5pbXBvcnQgYnRvYSBmcm9tICdidG9hJztcblxudHlwZSBGaXJlc3RvcmUgPSBhZG1pbi5maXJlc3RvcmUuRmlyZXN0b3JlO1xuXG5cbmV4cG9ydCB0eXBlIFJlYWRpbmdQYWdlUGFyYW1zID0ge1xuICBsYXN0VmlzaWJsZT86IERvY3VtZW50U25hcHNob3QsXG4gIGxpbWl0OiBudW1iZXIsXG59XG5cbmV4cG9ydCB0eXBlIFJlYWRpbmdSZXN1bHQgPSB7XG4gIHJlYWRpbmdzOiBSZWFkaW5nW10sXG4gIHBhcmFtczogUmVhZGluZ1BhZ2VQYXJhbXNcbn1cblxuZXhwb3J0IGNsYXNzIFJlYWRpbmdBcGkge1xuICBwcml2YXRlIGZpcmVzdG9yZTogRmlyZXN0b3JlO1xuICBwcml2YXRlIG9yZ0lkOiBzdHJpbmc7XG5cblxuICBjb25zdHJ1Y3RvcihmaXJlc3RvcmU6IEZpcmVzdG9yZSwgb3JnSWQ6IHN0cmluZykge1xuICAgIHRoaXMuZmlyZXN0b3JlID0gZmlyZXN0b3JlO1xuICAgIHRoaXMub3JnSWQgPSBvcmdJZDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGdldFJlYWRpbmdzRm9yUmVzb3VyY2VzXG4gICAqIFxuICAgKiBHaXZlbiBhIGxpc3Qgb2YgcmVzb3VyY2VJZHMsIGdldCBhbGwgb2YgdGhlIHJlYWRpbmdzIGZvciB0aGUgcmVzb3VyY2VzIHVwIHRvIFxuICAgKiBhIGxpbWl0IG9mIG4gKHBhcmFtcy5saW1pdCkuIEltcGxlbWVudGluZyB0aGlzIGxpbWl0IHdpbGwgYmUgdHJpY2t5IGFzIEZpcmVzdG9yZVxuICAgKiBkb2Vzbid0IGN1cnJlbnRseSBzdXBwb3J0IE9SIHF1ZXJpZXMsIG1lYW5pbmcgdGhhdCB3ZSB3aWxsIGhhdmUgdG8gbWVyZ2UgYW5kIGtlZXBcbiAgICogdHJhY2sgb2Ygb2YgY3Vyc29ycyBmb3IgZWFjaCBpZC5cbiAgICogXG4gICAqIEZvciBub3cgZ2V0cyB0aGUgbGF0ZXN0IG4gcmVhZGluZ3MgZm9yIHRoZSBnaXZlbiByZXNvdXJjZXMsIGJ1dCBpZiBuZWVkZWQgd2UgXG4gICAqIG1heSBhZGQgdGhlIGFiaWxpdHkgdG8gZmlsdGVyIGJ5IGRhdGUuIEFsc28gaWdub3JlcyB0aGUgbGFzdFZpc2libGUsIGFzIHdlIFxuICAgKiBjYW4ndCByZWFsbHkgaW1wbGVtZW50IHBhZ2luaWF0aW9uIGFjcm9zcyBtdWx0aXBsZSBxdWVyaWVzIHZlcnkgZWFzaWx5IGF0bS5cbiAgICogXG4gICAqIFRoaXMgYWxzbyB3b250IHJlc3BlY3QgZGF0ZSBvcmRlcmluZyBmcm9tIG9uZSByZXNvdXJjZSB0byBhbm90aGVyLCBhcyB0aGUgaW5kaXZpZHVhbCBcbiAgICogZGF0ZSBxdWVyaWVzIGFyZSBtZXJnZWQgdG9nZXRoZXIuXG4gICAqIFxuICAgKiBAcGFyYW0gcmVzb3VyY2VJZHMgXG4gICAqIEBwYXJhbSBwYXJhbXMgXG4gICAqL1xuICBhc3luYyBnZXRSZWFkaW5nc0ZvclJlc291cmNlcyhyZXNvdXJjZUlkczogc3RyaW5nW10sIHBhcmFtczogUmVhZGluZ1BhZ2VQYXJhbXMpOiBQcm9taXNlPFNvbWVSZXN1bHQ8UmVhZGluZ1Jlc3VsdD4+IHtcblxuICAgIC8vSGFyZCBydWxlcyBiZWNhdXNlIG9mIGZpcmViYXNlIHJlc3RyaWN0aW9uc1xuICAgIGRlbGV0ZSBwYXJhbXMubGFzdFZpc2libGU7XG4gICAgcGFyYW1zLmxpbWl0ID0gMTAwO1xuXG4gICAgY29uc3QgcmVhZGluZ3NSZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGwocmVzb3VyY2VJZHMubWFwKGlkID0+IHRoaXMuZ2V0UmVhZGluZ3NGb3JSZXNvdXJjZUlkKGlkLCBwYXJhbXMpKSk7XG4gICAgbGV0IHJlYWRpbmdzOiBSZWFkaW5nW10gPSBbXTtcbiAgICBjb25zdCBlcnJvcnM6IEVycm9yUmVzdWx0W10gPSBbXTtcbiAgICByZWFkaW5nc1Jlc3VsdHMuZm9yRWFjaChyZXN1bHQgPT4ge1xuICAgICAgaWYgKHJlc3VsdC50eXBlID09PSBSZXN1bHRUeXBlLkVSUk9SKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKHJlc3VsdCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVhZGluZ3MgPSByZWFkaW5ncy5jb25jYXQocmVzdWx0LnJlc3VsdC5yZWFkaW5ncyk7XG4gICAgfSk7XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIFwiIFwiICsgY3Vyci5tZXNzYWdlLCBcIk11bHRpcGxlIEVycm9yczpcIik7XG4gICAgICByZXR1cm4gbWFrZUVycm9yKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIHJldHVybiBtYWtlU3VjY2Vzcyh7XG4gICAgICBwYXJhbXMsXG4gICAgICByZWFkaW5ncyxcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGdldFJlYWRpbmdzRm9yUmVzb3VyY2VJZFxuICAgKlxuICAgKiBHaXZlbiBhIHJlc291cmNlSWQsIGdldCBhbGwgb2YgdGhlIHJlYWRpbmdzIGZvciB0aGUgcmVzb3VyY2VzIHVwIHRvXG4gICAqIGEgbGltaXQgb2YgbiAocGFyYW1zLmxpbWl0KVxuICAgKiBcbiAgICogRm9yIG5vdyBnZXRzIHRoZSBsYXRlc3QgbiByZWFkaW5ncyBmb3IgdGhlIGdpdmVuIHJlc291cmNlcywgYnV0IGlmIG5lZWRlZCB3ZVxuICAgKiBtYXkgYWRkIHRoZSBhYmlsaXR5IHRvIGZpbHRlciBieSBkYXRlXG4gICAqXG4gICAqIEBwYXJhbSByZXNvdXJjZUlkXG4gICAqIEBwYXJhbSBwYXJhbXNcbiAgICovXG4gIGFzeW5jIGdldFJlYWRpbmdzRm9yUmVzb3VyY2VJZChyZXNvdXJjZUlkOiBzdHJpbmcsIHBhcmFtczogUmVhZGluZ1BhZ2VQYXJhbXMpOiBQcm9taXNlPFNvbWVSZXN1bHQ8UmVhZGluZ1Jlc3VsdD4+IHtcblxuICAgIGxldCBxdWVyeTogYW55ID0gdGhpcy5yZWFkaW5nQ29sKClcbiAgICAud2hlcmUoYHJlc291cmNlSWRgLCAnPT0nLCByZXNvdXJjZUlkKVxuXG4gICAgLy9JIHRoaW5rIHRoZXNlIHJlc3VsdHMgd2lsbCBiZSBvcmRlcmVkLCBzaW5jZSB0aGUgcmVhZGluZ0lkcyBhcmUgb3JkZXJlZCBpbmhlcmVudGx5LCBidXQgaGVyZTpcbiAgICAub3JkZXJCeSgnZGF0ZXRpbWUnLCAnZGVzYycpO1xuXG4gICAgaWYgKHBhcmFtcy5sYXN0VmlzaWJsZSkge1xuICAgICAgcXVlcnkgPSBxdWVyeS5zdGFydEFmdGVyKHBhcmFtcy5sYXN0VmlzaWJsZSk7XG4gICAgfVxuICAgIHF1ZXJ5ID0gcXVlcnkubGltaXQoc2FmZUxvd2VyKHBhcmFtcy5saW1pdCwgMTAwKSk7XG5cbiAgICAvL1J1biB0aGUgcXVlcnlcbiAgICBsZXQgbGFzdFZpc2libGU6IFF1ZXJ5RG9jdW1lbnRTbmFwc2hvdDtcbiAgICByZXR1cm4gYXdhaXQgcXVlcnkuZ2V0KClcbiAgICAudGhlbigoc246IFF1ZXJ5U25hcHNob3QpID0+IHtcbiAgICAgIGNvbnN0IHJlYWRpbmdSZXN1bHRzOiBSZWFkaW5nW10gPSBbXTtcbiAgICAgIGxhc3RWaXNpYmxlID0gc24uZG9jc1tzbi5kb2NzLmxlbmd0aCAtIDFdO1xuXG4gICAgICBzbi5mb3JFYWNoKGRvYyA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBkb2MuZGF0YSgpO1xuICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlYWRpbmc6IFJlYWRpbmcgPSB7XG4gICAgICAgICAgLi4uRGVmYXVsdFJlYWRpbmcsXG4gICAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgICAvL1RPRE86IGRlc2VyaWFsaXplIGhlcmUuXG4gICAgICAgIH07XG4gICAgICAgIHJlYWRpbmdSZXN1bHRzLnB1c2gocmVhZGluZyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlYWRpbmdSZXN1bHRzO1xuICAgIH0pXG4gICAgLnRoZW4oKHJlYWRpbmdzOiBSZWFkaW5nW10pID0+IHtcbiAgICAgIGNvbnN0IHJlYWRpbmdSZXN1bHQ6IFJlYWRpbmdSZXN1bHQgPSB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIC4uLnBhcmFtcyxcbiAgICAgICAgICBsYXN0VmlzaWJsZSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVhZGluZ3MsXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gbWFrZVN1Y2Nlc3MocmVhZGluZ1Jlc3VsdCk7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcihlcnIubWVzc2FnZSkpO1xuICB9XG5cblxuICAvKipcbiAgICogYnVsa1NhdmVSZWFkaW5nc1xuICAgKiBcbiAgICogU2F2ZSByZWFkaW5ncyBpbiBidWxrXG4gICAqL1xuICBhc3luYyBidWxrVXBsb2FkUmVhZGluZ3MocmVhZGluZ3M6IFJlYWRpbmdbXSwgYmF0Y2hTaXplOiBudW1iZXIpOiBQcm9taXNlPFNvbWVSZXN1bHQ8YW55Pj4ge1xuICAgIGNvbnN0IHJlYWRpbmdCYXRjaGVzID0gY2h1bmtBcnJheShyZWFkaW5ncywgYmF0Y2hTaXplKTtcbiAgICBsZXQgd3JpdGVSZXN1bHRzOiBhbnlbXSA9IFtdO1xuXG4gICAgY29uc3QgYmF0Y2hTYXZlUmVzdWx0ID0gYXdhaXQgcmVhZGluZ0JhdGNoZXMucmVkdWNlKGFzeW5jIChhY2M6IFByb21pc2U8U29tZVJlc3VsdDxhbnk+PiwgY3VycjogUmVhZGluZ1tdLCBpZHgpID0+IHtcbiAgICAgIGNvbnN0IGxhc3RSZXN1bHQgPSBhd2FpdCBhY2M7XG4gICAgICBpZiAobGFzdFJlc3VsdC50eXBlID09PSBSZXN1bHRUeXBlLkVSUk9SKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobGFzdFJlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJhdGNoID0gdGhpcy5maXJlc3RvcmUuYmF0Y2goKTtcbiAgICAgIGN1cnIuZm9yRWFjaChyZWFkaW5nID0+IHtcbiAgICAgICAgY29uc3QgaWQgPSBSZWFkaW5nQXBpLmhhc2hSZWFkaW5nSWQocmVhZGluZy5yZXNvdXJjZUlkLCByZWFkaW5nLnRpbWVzZXJpZXNJZCwgbmV3IERhdGUocmVhZGluZy5kYXRldGltZSkpO1xuICAgICAgICBjb25zdCByZWYgPSB0aGlzLnJlYWRpbmdDb2woKS5kb2MoaWQpO1xuICAgICAgICBiYXRjaC5zZXQocmVmLCB7XG4gICAgICAgICAgLi4uRGVmYXVsdFJlYWRpbmcsXG4gICAgICAgICAgLi4ucmVhZGluZ1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gYXdhaXQgUmVhZGluZ0FwaS5jb21taXRCYXRjaChiYXRjaClcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIGlmIChyZXN1bHQudHlwZSA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTKSB7XG4gICAgICAgICAgd3JpdGVSZXN1bHRzID0gd3JpdGVSZXN1bHRzLmNvbmNhdChyZXN1bHQucmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSlcbiAgICB9LCBQcm9taXNlLnJlc29sdmUobWFrZVN1Y2Nlc3M8YW55Pih1bmRlZmluZWQpKSk7XG5cbiAgICBpZiAoYmF0Y2hTYXZlUmVzdWx0LnR5cGUgPT09IFJlc3VsdFR5cGUuRVJST1IpIHtcbiAgICAgIHJldHVybiBiYXRjaFNhdmVSZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1ha2VTdWNjZXNzKHdyaXRlUmVzdWx0cyk7XG4gIH1cblxuICAvKipcbiAgICogZ2V0UmVhZGluZ0ltYWdlXG4gICAqIFxuICAgKiBHZXQgdGhlIHJlYWRpbmcgaW1hZ2UgZm9yIGEgZ2l2ZW4gcmVhZGluZyBpZFxuICAgKiBcbiAgICogQHBhcmFtIHJlYWRpbmdJZCAtIHRoZSBoYXNoZWQgcmVhZGluZ0lkXG4gICAqIEByZXR1cm5zIFByb21pc2U8U29tZVJlc3VsdDxzdHJpbmc+PiAtIGEgYmFzZTY0IGVuY29kZWQgc3RyaW5nIG9mIHRoZSBpbWFnZSBpbiBwbmcgZm9ybWF0XG4gICAqL1xuICBwdWJsaWMgZ2V0UmVhZGluZ0ltYWdlKHJlYWRpbmdJZDogc3RyaW5nKTogUHJvbWlzZTxTb21lUmVzdWx0PHN0cmluZz4+IHtcbiAgICByZXR1cm4gdGhpcy5yZWFkaW5nQ29sKCkuZG9jKHJlYWRpbmdJZCkuZ2V0KClcbiAgICAgIC50aGVuKGRvYyA9PiB7XG4gICAgICAgIGlmICghZG9jLmRhdGEoKSkge1xuICAgICAgICAgIHJldHVybiBtYWtlRXJyb3IoYE5vIHJlYWRpbmcgZm91bmQgZm9yIHJlYWRpbmdJZDogJHtyZWFkaW5nSWR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmFzZTY0SW1hZ2UgPSBzYWZlR2V0TmVzdGVkKGRvYy5kYXRhKCksIFsnaW1hZ2UnLCAnYmFzZTY0SW1hZ2UnXSk7XG4gICAgICAgIGlmICghYmFzZTY0SW1hZ2UpIHtcbiAgICAgICAgICByZXR1cm4gbWFrZUVycm9yKGBObyBpbWFnZSBmb3VuZCBmb3IgcmVhZGluZ0lkOiAke3JlYWRpbmdJZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYWtlU3VjY2VzcyhiYXNlNjRJbWFnZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiBtYWtlRXJyb3IoZXJyLm1lc3NhZ2UpKTtcbiAgfVxuXG4gIHB1YmxpYyByZWFkaW5nQ29sKCk6IENvbGxlY3Rpb25SZWZlcmVuY2Uge1xuICAgIHJldHVybiB0aGlzLmZpcmVzdG9yZS5jb2xsZWN0aW9uKCdvcmcnKS5kb2ModGhpcy5vcmdJZCkuY29sbGVjdGlvbigncmVhZGluZycpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIElkIGZvciBhIHJlYWRpbmcgaXMgZ2VuZXJhdGVkIGFzIGEgaGFzaCBvZiB0aGVcbiAgICogcmVhZGluZydzIGRhdGVUaW1lICsgUmVzb3VyY2VJZCArIHRpbWVzZXJpZXNJZC5cbiAgICogXG4gICAqIEZvciBub3csIHdlIGNhbiBqdXN0IGVuY29kZSBpdCBhcyBhIGJhc2U2NCBzdHJpbmdcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaGFzaFJlYWRpbmdJZChyZXNvdXJjZUlkOiBzdHJpbmcsIHRpbWVzZXJpZXNJZDogc3RyaW5nLCBkYXRlVGltZTogRGF0ZSk6IHN0cmluZyB7XG4gICAgY29uc3QgaW5wdXQgPSBgJHtyZXNvdXJjZUlkfV8ke3RpbWVzZXJpZXNJZH1fJHtkYXRlVGltZS52YWx1ZU9mKCl9YDtcbiAgICByZXR1cm4gYnRvYShpbnB1dCk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGNvbW1pdEJhdGNoKGJhdGNoOiBGaXJlYmFzZUZpcmVzdG9yZS5Xcml0ZUJhdGNoKTogUHJvbWlzZTxTb21lUmVzdWx0PEFycmF5PEZpcmViYXNlRmlyZXN0b3JlLldyaXRlUmVzdWx0Pj4+IHtcbiAgICByZXR1cm4gYmF0Y2guY29tbWl0KClcbiAgICAudGhlbihyZXMgPT4gbWFrZVN1Y2Nlc3MocmVzKSlcbiAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcjxBcnJheTxGaXJlYmFzZUZpcmVzdG9yZS5Xcml0ZVJlc3VsdD4+KGVyci5tZXNzYWdlKSk7XG4gIH1cbn0iXX0=