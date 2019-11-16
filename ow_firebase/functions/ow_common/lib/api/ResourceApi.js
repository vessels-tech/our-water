"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResourceApi = void 0;

var _AppProviderTypes = require("../utils/AppProviderTypes");

var _model = require("../model");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ResourceApi =
/*#__PURE__*/
function () {
  function ResourceApi(firestore, orgId) {
    _classCallCheck(this, ResourceApi);

    _defineProperty(this, "firestore", void 0);

    _defineProperty(this, "orgId", void 0);

    this.firestore = firestore;
    this.orgId = orgId;
  }

  _createClass(ResourceApi, [{
    key: "getResourceForId",
    value: function () {
      var _getResourceForId = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(resourceId) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", this.getResource(this.resourceRef(resourceId)));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getResourceForId(_x) {
        return _getResourceForId.apply(this, arguments);
      }

      return getResourceForId;
    }()
  }, {
    key: "getResourcesForIds",
    value: function () {
      var _getResourcesForIds = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(resourceIds) {
        var _this = this;

        var results, errors, resources;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return Promise.all(resourceIds.map(function (id) {
                  return _this.getResourceForId(id);
                }));

              case 2:
                results = _context2.sent;
                errors = [];
                resources = [];
                results.forEach(function (r) {
                  if (r.type === _AppProviderTypes.ResultType.ERROR) {
                    errors.push(r);
                    return;
                  }

                  resources.push(r.result);
                });

                if (!(errors.length > 0)) {
                  _context2.next = 8;
                  break;
                }

                return _context2.abrupt("return", (0, _AppProviderTypes.makeError)("Error getting resources: ".concat(errors.reduce(function (acc, curr) {
                  return "".concat(acc, ", ").concat(curr);
                }, ''))));

              case 8:
                return _context2.abrupt("return", (0, _AppProviderTypes.makeSuccess)(resources));

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getResourcesForIds(_x2) {
        return _getResourcesForIds.apply(this, arguments);
      }

      return getResourcesForIds;
    }() //
    // Helpers
    // ------------------------------------

  }, {
    key: "resourceRef",
    value: function resourceRef(resourceId) {
      if (!resourceId) {
        return this.firestore.collection('org').doc(this.orgId).collection('resource').doc();
      }

      return this.firestore.collection('org').doc(this.orgId).collection('resource').doc(resourceId);
    }
  }, {
    key: "getResource",
    value: function () {
      var _getResource = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(resourceRef) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", resourceRef.get().then(function (sn) {
                  var data = sn.data();

                  if (!data) {
                    return (0, _AppProviderTypes.makeError)("No data found for resourceRef: ".concat(resourceRef));
                  }

                  return (0, _AppProviderTypes.makeSuccess)(_objectSpread({}, _model.DefaultResource, data, {
                    id: sn.id
                  }));
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getResource(_x3) {
        return _getResource.apply(this, arguments);
      }

      return getResource;
    }()
  }]);

  return ResourceApi;
}();

exports.ResourceApi = ResourceApi;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvUmVzb3VyY2VBcGkudHMiXSwibmFtZXMiOlsiUmVzb3VyY2VBcGkiLCJmaXJlc3RvcmUiLCJvcmdJZCIsInJlc291cmNlSWQiLCJnZXRSZXNvdXJjZSIsInJlc291cmNlUmVmIiwicmVzb3VyY2VJZHMiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiaWQiLCJnZXRSZXNvdXJjZUZvcklkIiwicmVzdWx0cyIsImVycm9ycyIsInJlc291cmNlcyIsImZvckVhY2giLCJyIiwidHlwZSIsIlJlc3VsdFR5cGUiLCJFUlJPUiIsInB1c2giLCJyZXN1bHQiLCJsZW5ndGgiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwiY29sbGVjdGlvbiIsImRvYyIsImdldCIsInRoZW4iLCJzbiIsImRhdGEiLCJEZWZhdWx0UmVzb3VyY2UiLCJjYXRjaCIsImVyciIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7OztJQUthQSxXOzs7QUFLWCx1QkFBWUMsU0FBWixFQUFrQ0MsS0FBbEMsRUFBaUQ7QUFBQTs7QUFBQTs7QUFBQTs7QUFDL0MsU0FBS0QsU0FBTCxHQUFpQkEsU0FBakI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDRDs7Ozs7OzsrQ0FFNkJDLFU7Ozs7O2lEQUNyQixLQUFLQyxXQUFMLENBQWlCLEtBQUtDLFdBQUwsQ0FBaUJGLFVBQWpCLENBQWpCLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnREFHdUJHLFc7Ozs7Ozs7Ozt1QkFDUEMsT0FBTyxDQUFDQyxHQUFSLENBQVlGLFdBQVcsQ0FBQ0csR0FBWixDQUFnQixVQUFBQyxFQUFFO0FBQUEseUJBQUksS0FBSSxDQUFDQyxnQkFBTCxDQUFzQkQsRUFBdEIsQ0FBSjtBQUFBLGlCQUFsQixDQUFaLEM7OztBQUFqQkUsZ0JBQUFBLE87QUFFQUMsZ0JBQUFBLE0sR0FBd0IsRTtBQUN4QkMsZ0JBQUFBLFMsR0FBd0IsRTtBQUM5QkYsZ0JBQUFBLE9BQU8sQ0FBQ0csT0FBUixDQUFnQixVQUFBQyxDQUFDLEVBQUk7QUFDbkIsc0JBQUlBLENBQUMsQ0FBQ0MsSUFBRixLQUFXQyw2QkFBV0MsS0FBMUIsRUFBaUM7QUFDL0JOLG9CQUFBQSxNQUFNLENBQUNPLElBQVAsQ0FBWUosQ0FBWjtBQUNBO0FBQ0Q7O0FBRURGLGtCQUFBQSxTQUFTLENBQUNNLElBQVYsQ0FBZUosQ0FBQyxDQUFDSyxNQUFqQjtBQUNELGlCQVBEOztzQkFTSVIsTUFBTSxDQUFDUyxNQUFQLEdBQWdCLEM7Ozs7O2tEQUNYLG9FQUF1RFQsTUFBTSxDQUFDVSxNQUFQLENBQWMsVUFBQ0MsR0FBRCxFQUFNQyxJQUFOO0FBQUEsbUNBQWtCRCxHQUFsQixlQUEwQkMsSUFBMUI7QUFBQSxpQkFBZCxFQUFnRCxFQUFoRCxDQUF2RCxFOzs7a0RBR0YsbUNBQTZCWCxTQUE3QixDOzs7Ozs7Ozs7Ozs7Ozs7UUFHVDtBQUNBO0FBQ0E7Ozs7Z0NBRW1CWCxVLEVBQXdDO0FBQ3pELFVBQUksQ0FBQ0EsVUFBTCxFQUFpQjtBQUNmLGVBQU8sS0FBS0YsU0FBTCxDQUFleUIsVUFBZixDQUEwQixLQUExQixFQUFpQ0MsR0FBakMsQ0FBcUMsS0FBS3pCLEtBQTFDLEVBQWlEd0IsVUFBakQsQ0FBNEQsVUFBNUQsRUFBd0VDLEdBQXhFLEVBQVA7QUFDRDs7QUFFRCxhQUFPLEtBQUsxQixTQUFMLENBQWV5QixVQUFmLENBQTBCLEtBQTFCLEVBQWlDQyxHQUFqQyxDQUFxQyxLQUFLekIsS0FBMUMsRUFBaUR3QixVQUFqRCxDQUE0RCxVQUE1RCxFQUF3RUMsR0FBeEUsQ0FBNEV4QixVQUE1RSxDQUFQO0FBQ0Q7Ozs7OztnREFFd0JFLFc7Ozs7O2tEQUNoQkEsV0FBVyxDQUFDdUIsR0FBWixHQUNOQyxJQURNLENBQ0QsVUFBQUMsRUFBRSxFQUFJO0FBQ1Ysc0JBQU1DLElBQUksR0FBR0QsRUFBRSxDQUFDQyxJQUFILEVBQWI7O0FBQ0Esc0JBQUksQ0FBQ0EsSUFBTCxFQUFXO0FBQ1QsMkJBQU8sMEVBQXNEMUIsV0FBdEQsRUFBUDtBQUNEOztBQUVELHlCQUFPLHFEQUNGMkIsc0JBREUsRUFFRkQsSUFGRTtBQUdMckIsb0JBQUFBLEVBQUUsRUFBRW9CLEVBQUUsQ0FBQ3BCO0FBSEYscUJBQVA7QUFLRCxpQkFaTSxFQWFOdUIsS0FiTSxDQWFBLFVBQUNDLEdBQUQ7QUFBQSx5QkFBZ0IsaUNBQW9CQSxHQUFHLENBQUNDLE9BQXhCLENBQWhCO0FBQUEsaUJBYkEsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNvbWVSZXN1bHQsIG1ha2VFcnJvciwgbWFrZVN1Y2Nlc3MsIFJlc3VsdFR5cGUsIEVycm9yUmVzdWx0IH0gZnJvbSBcIi4uL3V0aWxzL0FwcFByb3ZpZGVyVHlwZXNcIjtcbmltcG9ydCAqIGFzIGFkbWluIGZyb20gXCJmaXJlYmFzZS1hZG1pblwiO1xuaW1wb3J0IHsgUmVzb3VyY2UsIERlZmF1bHRSZXNvdXJjZSB9IGZyb20gXCIuLi9tb2RlbFwiO1xuaW1wb3J0IHsgRG9jdW1lbnRSZWZlcmVuY2UgfSBmcm9tIFwiQGdvb2dsZS1jbG91ZC9maXJlc3RvcmVcIjtcblxudHlwZSBGaXJlc3RvcmUgPSBhZG1pbi5maXJlc3RvcmUuRmlyZXN0b3JlO1xuXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VBcGkge1xuICBwcml2YXRlIGZpcmVzdG9yZTogRmlyZXN0b3JlO1xuICBwcml2YXRlIG9yZ0lkOiBzdHJpbmc7XG5cblxuICBjb25zdHJ1Y3RvcihmaXJlc3RvcmU6IEZpcmVzdG9yZSwgb3JnSWQ6IHN0cmluZykge1xuICAgIHRoaXMuZmlyZXN0b3JlID0gZmlyZXN0b3JlO1xuICAgIHRoaXMub3JnSWQgPSBvcmdJZDtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRSZXNvdXJjZUZvcklkKHJlc291cmNlSWQ6IHN0cmluZyk6IFByb21pc2U8U29tZVJlc3VsdDxSZXNvdXJjZT4+e1xuICAgIHJldHVybiB0aGlzLmdldFJlc291cmNlKHRoaXMucmVzb3VyY2VSZWYocmVzb3VyY2VJZCkpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldFJlc291cmNlc0ZvcklkcyhyZXNvdXJjZUlkczogc3RyaW5nW10pOiBQcm9taXNlPFNvbWVSZXN1bHQ8QXJyYXk8UmVzb3VyY2U+Pj4ge1xuICAgIGNvbnN0IHJlc3VsdHMgPSAgYXdhaXQgUHJvbWlzZS5hbGwocmVzb3VyY2VJZHMubWFwKGlkID0+IHRoaXMuZ2V0UmVzb3VyY2VGb3JJZChpZCkpKTtcblxuICAgIGNvbnN0IGVycm9yczogRXJyb3JSZXN1bHRbXSA9IFtdO1xuICAgIGNvbnN0IHJlc291cmNlczogUmVzb3VyY2VbXSA9IFtdO1xuICAgIHJlc3VsdHMuZm9yRWFjaChyID0+IHtcbiAgICAgIGlmIChyLnR5cGUgPT09IFJlc3VsdFR5cGUuRVJST1IpIHtcbiAgICAgICAgZXJyb3JzLnB1c2gocik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVzb3VyY2VzLnB1c2goci5yZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbWFrZUVycm9yPEFycmF5PFJlc291cmNlPj4oYEVycm9yIGdldHRpbmcgcmVzb3VyY2VzOiAke2Vycm9ycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYCR7YWNjfSwgJHtjdXJyfWAsICcnKX1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFrZVN1Y2Nlc3M8QXJyYXk8UmVzb3VyY2U+PihyZXNvdXJjZXMpO1xuICB9XG5cbiAgLy9cbiAgLy8gSGVscGVyc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgXG4gIHB1YmxpYyByZXNvdXJjZVJlZihyZXNvdXJjZUlkPzogc3RyaW5nKTogRG9jdW1lbnRSZWZlcmVuY2Uge1xuICAgIGlmICghcmVzb3VyY2VJZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlyZXN0b3JlLmNvbGxlY3Rpb24oJ29yZycpLmRvYyh0aGlzLm9yZ0lkKS5jb2xsZWN0aW9uKCdyZXNvdXJjZScpLmRvYygpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmZpcmVzdG9yZS5jb2xsZWN0aW9uKCdvcmcnKS5kb2ModGhpcy5vcmdJZCkuY29sbGVjdGlvbigncmVzb3VyY2UnKS5kb2MocmVzb3VyY2VJZCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0UmVzb3VyY2UocmVzb3VyY2VSZWY6IERvY3VtZW50UmVmZXJlbmNlKTogUHJvbWlzZTxTb21lUmVzdWx0PFJlc291cmNlPj4ge1xuICAgIHJldHVybiByZXNvdXJjZVJlZi5nZXQoKVxuICAgIC50aGVuKHNuID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBzbi5kYXRhKCk7XG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ha2VFcnJvcjxSZXNvdXJjZT4oYE5vIGRhdGEgZm91bmQgZm9yIHJlc291cmNlUmVmOiAke3Jlc291cmNlUmVmfWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWFrZVN1Y2Nlc3Moe1xuICAgICAgICAuLi5EZWZhdWx0UmVzb3VyY2UsXG4gICAgICAgIC4uLmRhdGEsXG4gICAgICAgIGlkOiBzbi5pZCxcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnI6IEVycm9yKSA9PiBtYWtlRXJyb3I8UmVzb3VyY2U+KGVyci5tZXNzYWdlKSlcbiAgfVxuXG59Il19