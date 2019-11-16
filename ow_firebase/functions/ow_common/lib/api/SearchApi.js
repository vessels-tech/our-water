"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchApi = exports.SearchResultType = void 0;

var _AppProviderTypes = require("../utils/AppProviderTypes");

var _StringUtils = require("../utils/StringUtils");

var _Utils = require("../utils/Utils");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SearchResultType;
exports.SearchResultType = SearchResultType;

(function (SearchResultType) {
  SearchResultType["PartialResourceResult"] = "PartialResourceResult";
  SearchResultType["PlaceResult"] = "PlaceResult";
})(SearchResultType || (exports.SearchResultType = SearchResultType = {}));

var SearchApi =
/*#__PURE__*/
function () {
  function SearchApi(firestore, orgId) {
    _classCallCheck(this, SearchApi);

    _defineProperty(this, "firestore", void 0);

    _defineProperty(this, "orgId", void 0);

    this.firestore = firestore;
    this.orgId = orgId;
  }
  /**
   * searchByLocationName
   * 
   */


  _createClass(SearchApi, [{
    key: "searchByLocationName",
    value: function () {
      var _searchByLocationName = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(searchQuery, searchParams) {
        var query, lastVisible;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log('searchByOwnerName'); //Build base query
                //For some reason has to be any

                query = SearchApi.resourceCol(this.firestore, this.orgId).where("locationName", '>=', searchQuery).where("locationName", '<=', "".concat(searchQuery, "z")) //append a z to take advantage of string sort
                //The nodejs api allows us to order by Id, but RN Firebase doesn't
                .orderBy("locationName");

                if (searchParams.lastVisible) {
                  query = query.startAfter(searchParams.lastVisible);
                }

                query = query.limit((0, _Utils.safeLower)(searchParams.limit, 100)); //Run the query

                _context.next = 6;
                return query.get().then(function (sn) {
                  var queryResults = [];
                  lastVisible = sn.docs[sn.docs.length - 1];
                  sn.forEach(function (doc) {
                    var data = doc.data();

                    if (data._id) {
                      return;
                    }

                    var result = {
                      type: SearchResultType.PartialResourceResult,
                      id: data.id,
                      shortId: undefined,
                      groups: data.groups,
                      owner: data.owner
                    };
                    queryResults.push(result);
                  });
                  return queryResults;
                }).then(function (results) {
                  var searchResult = {
                    params: _objectSpread({}, searchParams, {
                      lastVisible: lastVisible
                    }),
                    results: results,
                    type: SearchResultType.PartialResourceResult
                  };
                  return (0, _AppProviderTypes.makeSuccess)(searchResult);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                });

              case 6:
                return _context.abrupt("return", _context.sent);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function searchByLocationName(_x, _x2) {
        return _searchByLocationName.apply(this, arguments);
      }

      return searchByLocationName;
    }()
    /**
     * searchByOwnerName
     * 
     */

  }, {
    key: "searchByOwnerName",
    value: function () {
      var _searchByOwnerName = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(searchQuery, searchParams) {
        var query, lastVisible;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log('searchByOwnerName'); //Build base query
                //For some reason has to be any

                query = SearchApi.resourceCol(this.firestore, this.orgId).where("owner.name", '>=', searchQuery).where("owner.name", '<=', "".concat(searchQuery, "z")) //append a z to take advantage of string sort
                //The nodejs api allows us to order by Id, but RN Firebase doesn't
                .orderBy("owner.name");

                if (searchParams.lastVisible) {
                  query = query.startAfter(searchParams.lastVisible);
                }

                query = query.limit((0, _Utils.safeLower)(searchParams.limit, 100)); //Run the query

                _context2.next = 6;
                return query.get().then(function (sn) {
                  var queryResults = [];
                  lastVisible = sn.docs[sn.docs.length - 1];
                  sn.forEach(function (doc) {
                    var data = doc.data();

                    if (data._id) {
                      return;
                    }

                    var result = {
                      type: SearchResultType.PartialResourceResult,
                      id: data.id,
                      shortId: undefined,
                      groups: data.groups,
                      owner: data.owner
                    };
                    queryResults.push(result);
                  });
                  return queryResults;
                }).then(function (results) {
                  var searchResult = {
                    params: _objectSpread({}, searchParams, {
                      lastVisible: lastVisible
                    }),
                    results: results,
                    type: SearchResultType.PartialResourceResult
                  };
                  return (0, _AppProviderTypes.makeSuccess)(searchResult);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                });

              case 6:
                return _context2.abrupt("return", _context2.sent);

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function searchByOwnerName(_x3, _x4) {
        return _searchByOwnerName.apply(this, arguments);
      }

      return searchByOwnerName;
    }()
    /**
     * searchForPlaceName
     *
     * Lookup a place based on a place name. Uses the free nominatim api.
     * In the future, we could extend this by adding our own places, such as villages
     * 
     * eg: https://nominatim.openstreetmap.org/search/adelaide?format=json
     *
     * @param baseUrl: string
     * @param placeName: string - the place we are searching for
     * @param searchParams: SearchPageParams - params for pagination and limiting etc. Default limit is 20
     */

  }, {
    key: "searchForPlaceName",
    value: function () {
      var _searchForPlaceName = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(baseUrl, placeName, searchParams, requestApi) {
        var limit, uri, options;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                limit = (0, _Utils.safeLower)(searchParams.limit, 20); // https://nominatim.openstreetmap.org/search/adelaide?format=json
                //TODO: proper param parsing etc.

                uri = "".concat(baseUrl, "/").concat(placeName, "?format=json&email=admin@vesselstech.com&limit=").concat(limit);
                options = {
                  method: "GET",
                  uri: uri,
                  json: true
                }; //TODO: make generic enough for both request and fetch

                return _context3.abrupt("return", requestApi(options).then(function (response) {
                  /*
                    example response: {
                      place_id: '6878179',
                      licence: 'Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright',
                      osm_type: 'node',
                      osm_id: '703221878',
                      boundingbox: [ '3.9126024', '3.9326024', '-75.1533441', '-75.1333441' ],
                      lat: '3.9226024',
                      lon: '-75.1433441',
                      display_name: 'Adelaide, Ortega, Tolima, Colombia',
                    }
                  */
                  var places = response.map(function (r) {
                    return {
                      type: SearchResultType.PlaceResult,
                      name: r.display_name,
                      coords: {
                        latitude: parseFloat(r.lat),
                        longitude: parseFloat(r.lon)
                      },
                      boundingBox: r.boundingbox.map(function (point) {
                        return parseFloat(point);
                      })
                    };
                  }).filter(function (p) {
                    return p.name !== null;
                  });
                  return (0, _AppProviderTypes.makeSuccess)({
                    params: searchParams,
                    results: places,
                    type: SearchResultType.PlaceResult
                  });
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                }));

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function searchForPlaceName(_x5, _x6, _x7, _x8) {
        return _searchForPlaceName.apply(this, arguments);
      }

      return searchForPlaceName;
    }()
    /**
     * searchForResourceInGroup
     * 
     * Search for resource given based on group membership. Sorts using where filters on
     * the field, taking advantage of lexicographic sorting. We need a better approach, 
     * but firebase doesn't allow it atm.
     * 
     * @param groupQuery: string
     * @param groupToSearch: string - the group we are searching for
     * @param searchParams: SearchPageParams - params for pagination and limiting etc.
     */

  }, {
    key: "searchForResourceInGroup",
    value: function () {
      var _searchForResourceInGroup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(groupQuery, groupToSearch, searchParams) {
        var query, lastVisible;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                //Build base query
                query = SearchApi.resourceCol(this.firestore, this.orgId).where("groups.".concat(groupToSearch), '>=', groupQuery).where("groups.".concat(groupToSearch), '<=', "".concat(groupQuery, "z")) //append a z to take advantage of string sort
                //The nodejs api allows us to order by Id, but RN Firebase doesn't
                .orderBy("groups.".concat(groupToSearch));

                if (searchParams.lastVisible) {
                  query = query.startAfter(searchParams.lastVisible);
                }

                query = query.limit((0, _Utils.safeLower)(searchParams.limit, 100)); //Run the query

                _context4.next = 5;
                return query.get().then(function (sn) {
                  var queryResults = [];
                  lastVisible = sn.docs[sn.docs.length - 1];
                  sn.forEach(function (doc) {
                    var data = doc.data();

                    if (data._id) {
                      return;
                    }

                    var result = {
                      type: SearchResultType.PartialResourceResult,
                      id: data.id,
                      shortId: undefined,
                      groups: data.groups,
                      owner: data.owner
                    };
                    queryResults.push(result);
                  });
                  return queryResults;
                }).then(function (results) {
                  var searchResult = {
                    params: _objectSpread({}, searchParams, {
                      lastVisible: lastVisible
                    }),
                    results: results,
                    type: SearchResultType.PartialResourceResult
                  };
                  return (0, _AppProviderTypes.makeSuccess)(searchResult);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                });

              case 5:
                return _context4.abrupt("return", _context4.sent);

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function searchForResourceInGroup(_x9, _x10, _x11) {
        return _searchForResourceInGroup.apply(this, arguments);
      }

      return searchForResourceInGroup;
    }()
    /**
     * searchByShortId
     * 
     * Search for a resource given a shortId or shortId fragment
     * 
     * @param shortIdQuery: string - a 6 digit or 9 digit shortId, or shortId fragment
     * @param searchParams: SearchPageParams - params for pagination and limiting etc.
     * @returns Promise<SomeResult<SearchResult>> - PartialResourceResult
     */

  }, {
    key: "searchByShortId",
    value: function () {
      var _searchByShortId = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(shortIdQuery, searchParams) {
        var searchRangeResult, _searchRangeResult$re, lowerRange, upperRange, query, lastVisible;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                searchRangeResult = SearchApi.rangeFromShortIdString(shortIdQuery);

                if (!(searchRangeResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context5.next = 3;
                  break;
                }

                return _context5.abrupt("return", Promise.resolve(searchRangeResult));

              case 3:
                _searchRangeResult$re = _slicedToArray(searchRangeResult.result, 2), lowerRange = _searchRangeResult$re[0], upperRange = _searchRangeResult$re[1]; //Build base query
                //For some reason has to be any

                query = SearchApi.shortIdCol(this.firestore, this.orgId);

                if (lowerRange !== upperRange) {
                  query = query.where('id', '>=', lowerRange).where('id', '<', upperRange);
                } else {
                  //Ideally we could do an '=', but RNF doesn't like that
                  query = query.where('id', '>=', lowerRange).where('id', '<=', upperRange);
                }

                query = query.orderBy('id');

                if (searchParams.lastVisible) {
                  query = query.startAfter(searchParams.lastVisible);
                } //Max limit is 100


                query = query.limit((0, _Utils.safeLower)(searchParams.limit, 100)); //Run the query

                _context5.next = 11;
                return query.get().then(function (sn) {
                  var queryResults = [];
                  lastVisible = sn.docs[sn.docs.length - 1];
                  sn.forEach(function (doc) {
                    var data = doc.data();

                    if (data._id) {
                      return;
                    }

                    var result = {
                      type: SearchResultType.PartialResourceResult,
                      id: data.longId,
                      shortId: data.shortId,
                      groups: {},
                      owner: {}
                    };
                    queryResults.push(result);
                  });
                  return queryResults;
                }).then(function (results) {
                  var searchResult = {
                    params: _objectSpread({}, searchParams, {
                      lastVisible: lastVisible
                    }),
                    results: results,
                    type: SearchResultType.PartialResourceResult
                  };
                  return (0, _AppProviderTypes.makeSuccess)(searchResult);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                });

              case 11:
                return _context5.abrupt("return", _context5.sent);

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function searchByShortId(_x12, _x13) {
        return _searchByShortId.apply(this, arguments);
      }

      return searchByShortId;
    }() //
    // Helpers
    // ------------------------------------

  }], [{
    key: "shortIdCol",
    value: function shortIdCol(firestore, orgId) {
      return firestore.collection('org').doc(orgId).collection('shortId');
    }
  }, {
    key: "resourceCol",
    value: function resourceCol(firestore, orgId) {
      return firestore.collection('org').doc(orgId).collection('resource');
    }
    /**
     * rangeFromShortIdString
     * 
     * 
     * Transform the shortId or shortId partial into a searchable string. For example:
     * 
     *   100-000  -> 000100000, 000100000 | exactly id 000-100-000
     *   100      -> 000100000, 000101000 | any shortId starting with 000-100
     *   1001     -> 000100100, 000100200 | Any short id between 000-100-100 and 000-100-200
     *   00010001 -> 000100010, 000100020 | Any short id between 000-100-010 and 000-100-020
     * 
     * 
     * @param shortId: shortId string or partial string
     * @returns SomeResult<[string, string]>: the range of strings to search for.
     */

  }, {
    key: "rangeFromShortIdString",
    value: function rangeFromShortIdString(shortId) {
      var lowerRange = "";
      var upperRange = ""; //Strip out all spaces, dashes, etc
      // let base = shortId.replace(new RegExp(/[^\d]+/, 'g'), '');

      var base = shortId.replace(/[^\d]+/ig, ''); //Make sure it's within the range

      if (base.length === 0 || base.length > 9) {
        return (0, _AppProviderTypes.makeError)("search short id is too long or short");
      } //If it's shorter than 6 digits, long, assume we have an extra three 000s at
      //the start. This may break things later on, but only when we have 530,000+ ids


      if (base.length <= 6) {
        base = "000" + base;
      } //If we are using a fullId, then just return that id twice


      if (base.length === 9) {
        return (0, _AppProviderTypes.makeSuccess)([base, base]);
      } //We have a partial short id.
      //This means we need to convert it into a number and add one, then convert
      //back and add any left zeros we may have removed.


      lowerRange = base;
      var lowerNumber;
      var upperNumber;

      try {
        lowerNumber = parseInt(lowerRange);

        if (lowerNumber === NaN) {
          throw new Error("Error parsing shortId base string: ".concat(lowerNumber));
        }

        upperNumber = lowerNumber + 1;
        upperRange = upperNumber.toString();
      } catch (err) {
        return (0, _AppProviderTypes.makeError)(err.message);
      }

      if (!upperNumber) {
        return (0, _AppProviderTypes.makeError)("Error parsing shortId base string and adding 1: ".concat(lowerNumber));
      } //Pad the left side of the string to get the leading 00's back


      upperRange = (0, _StringUtils.leftPad)(upperRange, '0', lowerRange.length); //Pad the right hand side to make a 9 digit number

      lowerRange = (0, _StringUtils.rightPad)(lowerRange, '0', 9);
      upperRange = (0, _StringUtils.rightPad)(upperRange, '0', 9);
      return (0, _AppProviderTypes.makeSuccess)([lowerRange, upperRange]);
    }
  }]);

  return SearchApi;
}();

exports.SearchApi = SearchApi;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvU2VhcmNoQXBpLnRzIl0sIm5hbWVzIjpbIlNlYXJjaFJlc3VsdFR5cGUiLCJTZWFyY2hBcGkiLCJmaXJlc3RvcmUiLCJvcmdJZCIsInNlYXJjaFF1ZXJ5Iiwic2VhcmNoUGFyYW1zIiwiY29uc29sZSIsImxvZyIsInF1ZXJ5IiwicmVzb3VyY2VDb2wiLCJ3aGVyZSIsIm9yZGVyQnkiLCJsYXN0VmlzaWJsZSIsInN0YXJ0QWZ0ZXIiLCJsaW1pdCIsImdldCIsInRoZW4iLCJzbiIsInF1ZXJ5UmVzdWx0cyIsImRvY3MiLCJsZW5ndGgiLCJmb3JFYWNoIiwiZG9jIiwiZGF0YSIsIl9pZCIsInJlc3VsdCIsInR5cGUiLCJQYXJ0aWFsUmVzb3VyY2VSZXN1bHQiLCJpZCIsInNob3J0SWQiLCJ1bmRlZmluZWQiLCJncm91cHMiLCJvd25lciIsInB1c2giLCJyZXN1bHRzIiwic2VhcmNoUmVzdWx0IiwicGFyYW1zIiwiY2F0Y2giLCJlcnIiLCJtZXNzYWdlIiwiYmFzZVVybCIsInBsYWNlTmFtZSIsInJlcXVlc3RBcGkiLCJ1cmkiLCJvcHRpb25zIiwibWV0aG9kIiwianNvbiIsInJlc3BvbnNlIiwicGxhY2VzIiwibWFwIiwiciIsIlBsYWNlUmVzdWx0IiwibmFtZSIsImRpc3BsYXlfbmFtZSIsImNvb3JkcyIsImxhdGl0dWRlIiwicGFyc2VGbG9hdCIsImxhdCIsImxvbmdpdHVkZSIsImxvbiIsImJvdW5kaW5nQm94IiwiYm91bmRpbmdib3giLCJwb2ludCIsImZpbHRlciIsInAiLCJncm91cFF1ZXJ5IiwiZ3JvdXBUb1NlYXJjaCIsInNob3J0SWRRdWVyeSIsInNlYXJjaFJhbmdlUmVzdWx0IiwicmFuZ2VGcm9tU2hvcnRJZFN0cmluZyIsIlJlc3VsdFR5cGUiLCJFUlJPUiIsIlByb21pc2UiLCJyZXNvbHZlIiwibG93ZXJSYW5nZSIsInVwcGVyUmFuZ2UiLCJzaG9ydElkQ29sIiwibG9uZ0lkIiwiY29sbGVjdGlvbiIsImJhc2UiLCJyZXBsYWNlIiwibG93ZXJOdW1iZXIiLCJ1cHBlck51bWJlciIsInBhcnNlSW50IiwiTmFOIiwiRXJyb3IiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFZWUEsZ0I7OztXQUFBQSxnQjtBQUFBQSxFQUFBQSxnQjtBQUFBQSxFQUFBQSxnQjtHQUFBQSxnQixnQ0FBQUEsZ0I7O0lBMEJDQyxTOzs7QUFLWCxxQkFBWUMsU0FBWixFQUFrQ0MsS0FBbEMsRUFBaUQ7QUFBQTs7QUFBQTs7QUFBQTs7QUFDL0MsU0FBS0QsU0FBTCxHQUFpQkEsU0FBakI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDRDtBQUVEOzs7Ozs7Ozs7OzsrQ0FJMkJDLFcsRUFBcUJDLFk7Ozs7OztBQUU5Q0MsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLG1CQUFaLEUsQ0FFQTtBQUNBOztBQUNJQyxnQkFBQUEsSyxHQUFhUCxTQUFTLENBQUNRLFdBQVYsQ0FBc0IsS0FBS1AsU0FBM0IsRUFBc0MsS0FBS0MsS0FBM0MsRUFDaEJPLEtBRGdCLGlCQUNNLElBRE4sRUFDWU4sV0FEWixFQUVoQk0sS0FGZ0IsaUJBRU0sSUFGTixZQUVlTixXQUZmLFFBRStCO0FBQ2hEO0FBSGlCLGlCQUloQk8sT0FKZ0IsZ0I7O0FBTWpCLG9CQUFJTixZQUFZLENBQUNPLFdBQWpCLEVBQThCO0FBQzVCSixrQkFBQUEsS0FBSyxHQUFHQSxLQUFLLENBQUNLLFVBQU4sQ0FBaUJSLFlBQVksQ0FBQ08sV0FBOUIsQ0FBUjtBQUNEOztBQUNESixnQkFBQUEsS0FBSyxHQUFHQSxLQUFLLENBQUNNLEtBQU4sQ0FBWSxzQkFBVVQsWUFBWSxDQUFDUyxLQUF2QixFQUE4QixHQUE5QixDQUFaLENBQVIsQyxDQUVBOzs7dUJBRWFOLEtBQUssQ0FBQ08sR0FBTixHQUNaQyxJQURZLENBQ1AsVUFBQ0MsRUFBRCxFQUF1QjtBQUMzQixzQkFBTUMsWUFBcUMsR0FBRyxFQUE5QztB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RSxPQUFPaEQsR0FBUCxFQUFZO0FBQ1osZUFBTyxpQ0FBNEJBLEdBQUcsQ0FBQ0MsT0FBaEMsQ0FBUDtBQUNEOztBQUVELFVBQUksQ0FBQzJDLFdBQUwsRUFBa0I7QUFDaEIsZUFBTywyRkFBK0VELFdBQS9FLEVBQVA7QUFDRCxPQTNDaUYsQ0E2Q2xGOzs7QUFDQU4sTUFBQUEsVUFBVSxHQUFHLDBCQUFRQSxVQUFSLEVBQW9CLEdBQXBCLEVBQXlCRCxVQUFVLENBQUN0RCxNQUFwQyxDQUFiLENBOUNrRixDQWdEbEY7O0FBQ0FzRCxNQUFBQSxVQUFVLEdBQUcsMkJBQVNBLFVBQVQsRUFBcUIsR0FBckIsRUFBMEIsQ0FBMUIsQ0FBYjtBQUNBQyxNQUFBQSxVQUFVLEdBQUcsMkJBQVNBLFVBQVQsRUFBcUIsR0FBckIsRUFBMEIsQ0FBMUIsQ0FBYjtBQUdBLGFBQU8sbUNBQThCLENBQUNELFVBQUQsRUFBYUMsVUFBYixDQUE5QixDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTb21lUmVzdWx0LCBtYWtlRXJyb3IsIG1ha2VTdWNjZXNzLCBSZXN1bHRUeXBlIH0gZnJvbSBcIi4uL3V0aWxzL0FwcFByb3ZpZGVyVHlwZXNcIjtcbmltcG9ydCB7IGxlZnRQYWQsIHJpZ2h0UGFkIH0gIGZyb20gJy4uL3V0aWxzL1N0cmluZ1V0aWxzJztcbmltcG9ydCAqIGFzIGFkbWluIGZyb20gXCJmaXJlYmFzZS1hZG1pblwiO1xuaW1wb3J0IHsgQ29sbGVjdGlvblJlZmVyZW5jZSwgRG9jdW1lbnRTbmFwc2hvdCwgUXVlcnlTbmFwc2hvdCwgUXVlcnlEb2N1bWVudFNuYXBzaG90IH0gZnJvbSBcIkBnb29nbGUtY2xvdWQvZmlyZXN0b3JlXCI7XG5pbXBvcnQgeyBzYWZlTG93ZXIgfSBmcm9tIFwiLi4vdXRpbHMvVXRpbHNcIjtcbmltcG9ydCB7IERpY3RUeXBlIH0gZnJvbSBcIi4uL3V0aWxzL0RpY3RUeXBlXCI7XG5pbXBvcnQgeyBNYXliZSB9IGZyb20gXCIuLi91dGlscy9NYXliZVwiO1xuXG50eXBlIEZpcmVzdG9yZSA9IGFkbWluLmZpcmVzdG9yZS5GaXJlc3RvcmU7XG5cblxuZXhwb3J0IHR5cGUgU2VhcmNoUGFnZVBhcmFtcyA9IHtcbiAgbGFzdFZpc2libGU/OiBEb2N1bWVudFNuYXBzaG90LFxuICBsaW1pdDogbnVtYmVyLFxufVxuXG5leHBvcnQgZW51bSBTZWFyY2hSZXN1bHRUeXBlIHtcbiAgUGFydGlhbFJlc291cmNlUmVzdWx0ID0gXCJQYXJ0aWFsUmVzb3VyY2VSZXN1bHRcIixcbiAgUGxhY2VSZXN1bHQgPSBcIlBsYWNlUmVzdWx0XCIsXG59XG5cbmV4cG9ydCB0eXBlIFNlYXJjaFJlc3VsdDxUPiA9IHtcbiAgcmVzdWx0czogVCxcbiAgcGFyYW1zOiBTZWFyY2hQYWdlUGFyYW1zLFxuICB0eXBlOiBTZWFyY2hSZXN1bHRUeXBlXG59O1xuXG5leHBvcnQgdHlwZSBQYXJ0aWFsUmVzb3VyY2VSZXN1bHQgPSB7XG4gIHR5cGU6IFNlYXJjaFJlc3VsdFR5cGUuUGFydGlhbFJlc291cmNlUmVzdWx0LFxuICBpZDogc3RyaW5nLFxuICBzaG9ydElkOiBNYXliZTxzdHJpbmc+LFxuICBncm91cHM6IERpY3RUeXBlPHN0cmluZz4sXG4gIG93bmVyOiBEaWN0VHlwZTxzdHJpbmc+LFxufVxuXG5leHBvcnQgdHlwZSBQbGFjZVJlc3VsdCA9IHtcbiAgdHlwZTogU2VhcmNoUmVzdWx0VHlwZS5QbGFjZVJlc3VsdCxcbiAgbmFtZTogc3RyaW5nLFxuICBjb29yZHM6IHsgbGF0aXR1ZGU6IG51bWJlciwgbG9uZ2l0dWRlOiBudW1iZXJ9LFxuICBib3VuZGluZ0JveDogbnVtYmVyW10sXG59XG5cbmV4cG9ydCBjbGFzcyBTZWFyY2hBcGkge1xuICBwcml2YXRlIGZpcmVzdG9yZTogRmlyZXN0b3JlO1xuICBwcml2YXRlIG9yZ0lkOiBzdHJpbmc7XG5cblxuICBjb25zdHJ1Y3RvcihmaXJlc3RvcmU6IEZpcmVzdG9yZSwgb3JnSWQ6IHN0cmluZykge1xuICAgIHRoaXMuZmlyZXN0b3JlID0gZmlyZXN0b3JlO1xuICAgIHRoaXMub3JnSWQgPSBvcmdJZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZWFyY2hCeUxvY2F0aW9uTmFtZVxuICAgKiBcbiAgICovXG4gIGFzeW5jIHNlYXJjaEJ5TG9jYXRpb25OYW1lKHNlYXJjaFF1ZXJ5OiBzdHJpbmcsIHNlYXJjaFBhcmFtczogU2VhcmNoUGFnZVBhcmFtcyk6XG4gICAgUHJvbWlzZTxTb21lUmVzdWx0PFNlYXJjaFJlc3VsdDxBcnJheTxQYXJ0aWFsUmVzb3VyY2VSZXN1bHQ+Pj4+IHtcbiAgICBjb25zb2xlLmxvZygnc2VhcmNoQnlPd25lck5hbWUnKVxuXG4gICAgLy9CdWlsZCBiYXNlIHF1ZXJ5XG4gICAgLy9Gb3Igc29tZSByZWFzb24gaGFzIHRvIGJlIGFueVxuICAgIGxldCBxdWVyeTogYW55ID0gU2VhcmNoQXBpLnJlc291cmNlQ29sKHRoaXMuZmlyZXN0b3JlLCB0aGlzLm9yZ0lkKVxuICAgIC53aGVyZShgbG9jYXRpb25OYW1lYCwgJz49Jywgc2VhcmNoUXVlcnkpXG4gICAgLndoZXJlKGBsb2NhdGlvbk5hbWVgLCAnPD0nLCBgJHtzZWFyY2hRdWVyeX16YCkgLy9hcHBlbmQgYSB6IHRvIHRha2UgYWR2YW50YWdlIG9mIHN0cmluZyBzb3J0XG4gICAgLy9UaGUgbm9kZWpzIGFwaSBhbGxvd3MgdXMgdG8gb3JkZXIgYnkgSWQsIGJ1dCBSTiBGaXJlYmFzZSBkb2Vzbid0XG4gICAgLm9yZGVyQnkoYGxvY2F0aW9uTmFtZWApXG5cbiAgICBpZiAoc2VhcmNoUGFyYW1zLmxhc3RWaXNpYmxlKSB7XG4gICAgICBxdWVyeSA9IHF1ZXJ5LnN0YXJ0QWZ0ZXIoc2VhcmNoUGFyYW1zLmxhc3RWaXNpYmxlKTtcbiAgICB9XG4gICAgcXVlcnkgPSBxdWVyeS5saW1pdChzYWZlTG93ZXIoc2VhcmNoUGFyYW1zLmxpbWl0LCAxMDApKTtcblxuICAgIC8vUnVuIHRoZSBxdWVyeVxuICAgIGxldCBsYXN0VmlzaWJsZTogUXVlcnlEb2N1bWVudFNuYXBzaG90O1xuICAgIHJldHVybiBhd2FpdCBxdWVyeS5nZXQoKVxuICAgIC50aGVuKChzbjogUXVlcnlTbmFwc2hvdCkgPT4ge1xuICAgICAgY29uc3QgcXVlcnlSZXN1bHRzOiBQYXJ0aWFsUmVzb3VyY2VSZXN1bHRbXSA9IFtdO1xuICAgICAgbGFzdFZpc2libGUgPSBzbi5kb2NzW3NuLmRvY3MubGVuZ3RoIC0gMV07XG5cbiAgICAgIHNuLmZvckVhY2goZG9jID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGRvYy5kYXRhKCk7XG4gICAgICAgIGlmIChkYXRhLl9pZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQ6IFBhcnRpYWxSZXNvdXJjZVJlc3VsdCA9IHtcbiAgICAgICAgICB0eXBlOiBTZWFyY2hSZXN1bHRUeXBlLlBhcnRpYWxSZXNvdXJjZVJlc3VsdCxcbiAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICBzaG9ydElkOiB1bmRlZmluZWQsXG4gICAgICAgICAgZ3JvdXBzOiBkYXRhLmdyb3VwcyxcbiAgICAgICAgICBvd25lcjogZGF0YS5vd25lcixcbiAgICAgICAgfTtcbiAgICAgICAgcXVlcnlSZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcXVlcnlSZXN1bHRzO1xuICAgIH0pXG4gICAgLnRoZW4oKHJlc3VsdHM6IGFueSkgPT4ge1xuICAgICAgY29uc3Qgc2VhcmNoUmVzdWx0OiBTZWFyY2hSZXN1bHQ8QXJyYXk8UGFydGlhbFJlc291cmNlUmVzdWx0Pj4gPSB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIC4uLnNlYXJjaFBhcmFtcyxcbiAgICAgICAgICBsYXN0VmlzaWJsZSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgdHlwZTogU2VhcmNoUmVzdWx0VHlwZS5QYXJ0aWFsUmVzb3VyY2VSZXN1bHQsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIG1ha2VTdWNjZXNzPFNlYXJjaFJlc3VsdDxBcnJheTxQYXJ0aWFsUmVzb3VyY2VSZXN1bHQ+Pj4oc2VhcmNoUmVzdWx0KTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyOiBFcnJvcikgPT4gbWFrZUVycm9yPFNlYXJjaFJlc3VsdDxBcnJheTxQYXJ0aWFsUmVzb3VyY2VSZXN1bHQ+Pj4oZXJyLm1lc3NhZ2UpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZWFyY2hCeU93bmVyTmFtZVxuICAgKiBcbiAgICovXG4gIGFzeW5jIHNlYXJjaEJ5T3duZXJOYW1lKHNlYXJjaFF1ZXJ5OiBzdHJpbmcsIHNlYXJjaFBhcmFtczogU2VhcmNoUGFnZVBhcmFtcyk6XG4gICAgUHJvbWlzZTxTb21lUmVzdWx0PFNlYXJjaFJlc3VsdDxBcnJheTxQYXJ0aWFsUmVzb3VyY2VSZXN1bHQ+Pj4+IHtcbiAgICBjb25zb2xlLmxvZygnc2VhcmNoQnlPd25lck5hbWUnKVxuXG4gICAgLy9CdWlsZCBiYXNlIHF1ZXJ5XG4gICAgLy9Gb3Igc29tZSByZWFzb24gaGFzIHRvIGJlIGFueVxuICAgIGxldCBxdWVyeTogYW55ID0gU2VhcmNoQXBpLnJlc291cmNlQ29sKHRoaXMuZmlyZXN0b3JlLCB0aGlzLm9yZ0lkKVxuICAgIC53aGVyZShgb3duZXIubmFtZWAsICc+PScsIHNlYXJjaFF1ZXJ5KVxuICAgIC53aGVyZShgb3duZXIubmFtZWAsICc8PScsIGAke3NlYXJjaFF1ZXJ5fXpgKSAvL2FwcGVuZCBhIHogdG8gdGFrZSBhZHZhbnRhZ2Ugb2Ygc3RyaW5nIHNvcnRcbiAgICAvL1RoZSBub2RlanMgYXBpIGFsbG93cyB1cyB0byBvcmRlciBieSBJZCwgYnV0IFJOIEZpcmViYXNlIGRvZXNuJ3RcbiAgICAub3JkZXJCeShgb3duZXIubmFtZWApXG5cbiAgICBpZiAoc2VhcmNoUGFyYW1zLmxhc3RWaXNpYmxlKSB7XG4gICAgICBxdWVyeSA9IHF1ZXJ5LnN0YXJ0QWZ0ZXIoc2VhcmNoUGFyYW1zLmxhc3RWaXNpYmxlKTtcbiAgICB9XG4gICAgcXVlcnkgPSBxdWVyeS5saW1pdChzYWZlTG93ZXIoc2VhcmNoUGFyYW1zLmxpbWl0LCAxMDApKTtcblxuICAgIC8vUnVuIHRoZSBxdWVyeVxuICAgIGxldCBsYXN0VmlzaWJsZTogUXVlcnlEb2N1bWVudFNuYXBzaG90O1xuICAgIHJldHVybiBhd2FpdCBxdWVyeS5nZXQoKVxuICAgIC50aGVuKChzbjogUXVlcnlTbmFwc2hvdCkgPT4ge1xuICAgICAgY29uc3QgcXVlcnlSZXN1bHRzOiBQYXJ0aWFsUmVzb3VyY2VSZXN1bHRbXSA9IFtdO1xuICAgICAgbGFzdFZpc2libGUgPSBzbi5kb2NzW3NuLmRvY3MubGVuZ3RoIC0gMV07XG5cbiAgICAgIHNuLmZvckVhY2goZG9jID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGRvYy5kYXRhKCk7XG4gICAgICAgIGlmIChkYXRhLl9pZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQ6IFBhcnRpYWxSZXNvdXJjZVJlc3VsdCA9IHtcbiAgICAgICAgICB0eXBlOiBTZWFyY2hSZXN1bHRUeXBlLlBhcnRpYWxSZXNvdXJjZVJlc3VsdCxcbiAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICBzaG9ydElkOiB1bmRlZmluZWQsXG4gICAgICAgICAgZ3JvdXBzOiBkYXRhLmdyb3VwcyxcbiAgICAgICAgICBvd25lcjogZGF0YS5vd25lcixcbiAgICAgICAgfTtcbiAgICAgICAgcXVlcnlSZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcXVlcnlSZXN1bHRzO1xuICAgIH0pXG4gICAgLnRoZW4oKHJlc3VsdHM6IGFueSkgPT4ge1xuICAgICAgY29uc3Qgc2VhcmNoUmVzdWx0OiBTZWFyY2hSZXN1bHQ8QXJyYXk8UGFydGlhbFJlc291cmNlUmVzdWx0Pj4gPSB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIC4uLnNlYXJjaFBhcmFtcyxcbiAgICAgICAgICBsYXN0VmlzaWJsZSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgdHlwZTogU2VhcmNoUmVzdWx0VHlwZS5QYXJ0aWFsUmVzb3VyY2VSZXN1bHQsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIG1ha2VTdWNjZXNzPFNlYXJjaFJlc3VsdDxBcnJheTxQYXJ0aWFsUmVzb3VyY2VSZXN1bHQ+Pj4oc2VhcmNoUmVzdWx0KTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyOiBFcnJvcikgPT4gbWFrZUVycm9yPFNlYXJjaFJlc3VsdDxBcnJheTxQYXJ0aWFsUmVzb3VyY2VSZXN1bHQ+Pj4oZXJyLm1lc3NhZ2UpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZWFyY2hGb3JQbGFjZU5hbWVcbiAgICpcbiAgICogTG9va3VwIGEgcGxhY2UgYmFzZWQgb24gYSBwbGFjZSBuYW1lLiBVc2VzIHRoZSBmcmVlIG5vbWluYXRpbSBhcGkuXG4gICAqIEluIHRoZSBmdXR1cmUsIHdlIGNvdWxkIGV4dGVuZCB0aGlzIGJ5IGFkZGluZyBvdXIgb3duIHBsYWNlcywgc3VjaCBhcyB2aWxsYWdlc1xuICAgKiBcbiAgICogZWc6IGh0dHBzOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL3NlYXJjaC9hZGVsYWlkZT9mb3JtYXQ9anNvblxuICAgKlxuICAgKiBAcGFyYW0gYmFzZVVybDogc3RyaW5nXG4gICAqIEBwYXJhbSBwbGFjZU5hbWU6IHN0cmluZyAtIHRoZSBwbGFjZSB3ZSBhcmUgc2VhcmNoaW5nIGZvclxuICAgKiBAcGFyYW0gc2VhcmNoUGFyYW1zOiBTZWFyY2hQYWdlUGFyYW1zIC0gcGFyYW1zIGZvciBwYWdpbmF0aW9uIGFuZCBsaW1pdGluZyBldGMuIERlZmF1bHQgbGltaXQgaXMgMjBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzZWFyY2hGb3JQbGFjZU5hbWUoYmFzZVVybDogc3RyaW5nLCBwbGFjZU5hbWU6IHN0cmluZywgc2VhcmNoUGFyYW1zOiBTZWFyY2hQYWdlUGFyYW1zLCByZXF1ZXN0QXBpOiBhbnkpOlxuICBQcm9taXNlPFNvbWVSZXN1bHQ8U2VhcmNoUmVzdWx0PEFycmF5PFBsYWNlUmVzdWx0Pj4+PiB7XG5cbiAgICBjb25zdCBsaW1pdCA9IHNhZmVMb3dlcihzZWFyY2hQYXJhbXMubGltaXQsIDIwKTtcblxuICAgIC8vIGh0dHBzOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL3NlYXJjaC9hZGVsYWlkZT9mb3JtYXQ9anNvblxuICAgIC8vVE9ETzogcHJvcGVyIHBhcmFtIHBhcnNpbmcgZXRjLlxuICAgIGNvbnN0IHVyaSA9IGAke2Jhc2VVcmx9LyR7cGxhY2VOYW1lfT9mb3JtYXQ9anNvbiZlbWFpbD1hZG1pbkB2ZXNzZWxzdGVjaC5jb20mbGltaXQ9JHtsaW1pdH1gO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICB1cmksXG4gICAgICBqc29uOiB0cnVlLFxuICAgIH07XG4gICAgLy9UT0RPOiBtYWtlIGdlbmVyaWMgZW5vdWdoIGZvciBib3RoIHJlcXVlc3QgYW5kIGZldGNoXG4gICAgcmV0dXJuIHJlcXVlc3RBcGkob3B0aW9ucylcbiAgICAudGhlbigocmVzcG9uc2U6IGFueSkgPT4ge1xuXG4gICAgICAvKlxuICAgICAgICBleGFtcGxlIHJlc3BvbnNlOiB7XG4gICAgICAgICAgcGxhY2VfaWQ6ICc2ODc4MTc5JyxcbiAgICAgICAgICBsaWNlbmNlOiAnRGF0YSDCqSBPcGVuU3RyZWV0TWFwIGNvbnRyaWJ1dG9ycywgT0RiTCAxLjAuIGh0dHBzOi8vb3NtLm9yZy9jb3B5cmlnaHQnLFxuICAgICAgICAgIG9zbV90eXBlOiAnbm9kZScsXG4gICAgICAgICAgb3NtX2lkOiAnNzAzMjIxODc4JyxcbiAgICAgICAgICBib3VuZGluZ2JveDogWyAnMy45MTI2MDI0JywgJzMuOTMyNjAyNCcsICctNzUuMTUzMzQ0MScsICctNzUuMTMzMzQ0MScgXSxcbiAgICAgICAgICBsYXQ6ICczLjkyMjYwMjQnLFxuICAgICAgICAgIGxvbjogJy03NS4xNDMzNDQxJyxcbiAgICAgICAgICBkaXNwbGF5X25hbWU6ICdBZGVsYWlkZSwgT3J0ZWdhLCBUb2xpbWEsIENvbG9tYmlhJyxcbiAgICAgICAgfVxuICAgICAgKi9cblxuICAgICAgY29uc3QgcGxhY2VzOiBQbGFjZVJlc3VsdFtdID0gcmVzcG9uc2UubWFwKChyOiBhbnkpID0+ICh7XG4gICAgICAgIHR5cGU6IFNlYXJjaFJlc3VsdFR5cGUuUGxhY2VSZXN1bHQsXG4gICAgICAgIG5hbWU6IHIuZGlzcGxheV9uYW1lLFxuICAgICAgICBjb29yZHM6IHsgbGF0aXR1ZGU6IHBhcnNlRmxvYXQoci5sYXQpLCBsb25naXR1ZGU6IHBhcnNlRmxvYXQoci5sb24pIH0sXG4gICAgICAgIGJvdW5kaW5nQm94OiByLmJvdW5kaW5nYm94Lm1hcCgocG9pbnQ6IHN0cmluZykgPT4gcGFyc2VGbG9hdChwb2ludCkgKSxcbiAgICAgIH0pKVxuICAgICAgLmZpbHRlcigocDogUGxhY2VSZXN1bHQpID0+IHAubmFtZSAhPT0gbnVsbCk7XG5cbiAgICAgIHJldHVybiBtYWtlU3VjY2VzczxTZWFyY2hSZXN1bHQ8QXJyYXk8UGxhY2VSZXN1bHQ+Pj4oe1xuICAgICAgICBwYXJhbXM6IHNlYXJjaFBhcmFtcyxcbiAgICAgICAgcmVzdWx0czogcGxhY2VzLFxuICAgICAgICB0eXBlOiBTZWFyY2hSZXN1bHRUeXBlLlBsYWNlUmVzdWx0LFxuICAgICAgfSk7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcjxTZWFyY2hSZXN1bHQ8QXJyYXk8UGxhY2VSZXN1bHQ+Pj4oZXJyLm1lc3NhZ2UpKTtcbiAgIH1cblxuICAvKipcbiAgICogc2VhcmNoRm9yUmVzb3VyY2VJbkdyb3VwXG4gICAqIFxuICAgKiBTZWFyY2ggZm9yIHJlc291cmNlIGdpdmVuIGJhc2VkIG9uIGdyb3VwIG1lbWJlcnNoaXAuIFNvcnRzIHVzaW5nIHdoZXJlIGZpbHRlcnMgb25cbiAgICogdGhlIGZpZWxkLCB0YWtpbmcgYWR2YW50YWdlIG9mIGxleGljb2dyYXBoaWMgc29ydGluZy4gV2UgbmVlZCBhIGJldHRlciBhcHByb2FjaCwgXG4gICAqIGJ1dCBmaXJlYmFzZSBkb2Vzbid0IGFsbG93IGl0IGF0bS5cbiAgICogXG4gICAqIEBwYXJhbSBncm91cFF1ZXJ5OiBzdHJpbmdcbiAgICogQHBhcmFtIGdyb3VwVG9TZWFyY2g6IHN0cmluZyAtIHRoZSBncm91cCB3ZSBhcmUgc2VhcmNoaW5nIGZvclxuICAgKiBAcGFyYW0gc2VhcmNoUGFyYW1zOiBTZWFyY2hQYWdlUGFyYW1zIC0gcGFyYW1zIGZvciBwYWdpbmF0aW9uIGFuZCBsaW1pdGluZyBldGMuXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2VhcmNoRm9yUmVzb3VyY2VJbkdyb3VwKGdyb3VwUXVlcnk6IHN0cmluZywgZ3JvdXBUb1NlYXJjaDogc3RyaW5nLCBzZWFyY2hQYXJhbXM6IFNlYXJjaFBhZ2VQYXJhbXMpOlxuICBQcm9taXNlPFNvbWVSZXN1bHQ8U2VhcmNoUmVzdWx0PEFycmF5PFBhcnRpYWxSZXNvdXJjZVJlc3VsdD4+Pj4ge1xuXG4gICAgLy9CdWlsZCBiYXNlIHF1ZXJ5XG4gICAgLy9Gb3Igc29tZSByZWFzb24gaGFzIHRvIGJlIGFueVxuICAgIGxldCBxdWVyeTogYW55ID0gU2VhcmNoQXBpLnJlc291cmNlQ29sKHRoaXMuZmlyZXN0b3JlLCB0aGlzLm9yZ0lkKVxuICAgIC53aGVyZShgZ3JvdXBzLiR7Z3JvdXBUb1NlYXJjaH1gLCAnPj0nLCBncm91cFF1ZXJ5KVxuICAgIC53aGVyZShgZ3JvdXBzLiR7Z3JvdXBUb1NlYXJjaH1gLCAnPD0nLCBgJHtncm91cFF1ZXJ5fXpgKSAvL2FwcGVuZCBhIHogdG8gdGFrZSBhZHZhbnRhZ2Ugb2Ygc3RyaW5nIHNvcnRcbiAgICAvL1RoZSBub2RlanMgYXBpIGFsbG93cyB1cyB0byBvcmRlciBieSBJZCwgYnV0IFJOIEZpcmViYXNlIGRvZXNuJ3RcbiAgICAub3JkZXJCeShgZ3JvdXBzLiR7Z3JvdXBUb1NlYXJjaH1gKVxuXG4gICAgaWYgKHNlYXJjaFBhcmFtcy5sYXN0VmlzaWJsZSkge1xuICAgICAgcXVlcnkgPSBxdWVyeS5zdGFydEFmdGVyKHNlYXJjaFBhcmFtcy5sYXN0VmlzaWJsZSk7XG4gICAgfVxuICAgIHF1ZXJ5ID0gcXVlcnkubGltaXQoc2FmZUxvd2VyKHNlYXJjaFBhcmFtcy5saW1pdCwgMTAwKSk7XG5cbiAgICAvL1J1biB0aGUgcXVlcnlcbiAgICBsZXQgbGFzdFZpc2libGU6IFF1ZXJ5RG9jdW1lbnRTbmFwc2hvdDtcbiAgICByZXR1cm4gYXdhaXQgcXVlcnkuZ2V0KClcbiAgICAudGhlbigoc246IFF1ZXJ5U25hcHNob3QpID0+IHtcbiAgICAgIGNvbnN0IHF1ZXJ5UmVzdWx0czogUGFydGlhbFJlc291cmNlUmVzdWx0W10gPSBbXTtcbiAgICAgIGxhc3RWaXNpYmxlID0gc24uZG9jc1tzbi5kb2NzLmxlbmd0aCAtIDFdO1xuXG4gICAgICBzbi5mb3JFYWNoKGRvYyA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBkb2MuZGF0YSgpO1xuICAgICAgICBpZiAoZGF0YS5faWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdWx0OiBQYXJ0aWFsUmVzb3VyY2VSZXN1bHQgPSB7XG4gICAgICAgICAgdHlwZTogU2VhcmNoUmVzdWx0VHlwZS5QYXJ0aWFsUmVzb3VyY2VSZXN1bHQsXG4gICAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgICAgc2hvcnRJZDogdW5kZWZpbmVkLFxuICAgICAgICAgIGdyb3VwczogZGF0YS5ncm91cHMsXG4gICAgICAgICAgb3duZXI6IGRhdGEub3duZXIsXG4gICAgICAgIH07XG4gICAgICAgIHF1ZXJ5UmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHF1ZXJ5UmVzdWx0cztcbiAgICB9KVxuICAgIC50aGVuKChyZXN1bHRzOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHNlYXJjaFJlc3VsdDogU2VhcmNoUmVzdWx0PEFycmF5PFBhcnRpYWxSZXNvdXJjZVJlc3VsdD4+ID0ge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAuLi5zZWFyY2hQYXJhbXMsXG4gICAgICAgICAgbGFzdFZpc2libGUsXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VsdHMsXG4gICAgICAgIHR5cGU6IFNlYXJjaFJlc3VsdFR5cGUuUGFydGlhbFJlc291cmNlUmVzdWx0LFxuICAgICAgfTtcbiAgICAgIHJldHVybiBtYWtlU3VjY2VzczxTZWFyY2hSZXN1bHQ8QXJyYXk8UGFydGlhbFJlc291cmNlUmVzdWx0Pj4+KHNlYXJjaFJlc3VsdCk7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcjxTZWFyY2hSZXN1bHQ8QXJyYXk8UGFydGlhbFJlc291cmNlUmVzdWx0Pj4+KGVyci5tZXNzYWdlKSk7XG4gIH1cblxuICAvKipcbiAgICogc2VhcmNoQnlTaG9ydElkXG4gICAqIFxuICAgKiBTZWFyY2ggZm9yIGEgcmVzb3VyY2UgZ2l2ZW4gYSBzaG9ydElkIG9yIHNob3J0SWQgZnJhZ21lbnRcbiAgICogXG4gICAqIEBwYXJhbSBzaG9ydElkUXVlcnk6IHN0cmluZyAtIGEgNiBkaWdpdCBvciA5IGRpZ2l0IHNob3J0SWQsIG9yIHNob3J0SWQgZnJhZ21lbnRcbiAgICogQHBhcmFtIHNlYXJjaFBhcmFtczogU2VhcmNoUGFnZVBhcmFtcyAtIHBhcmFtcyBmb3IgcGFnaW5hdGlvbiBhbmQgbGltaXRpbmcgZXRjLlxuICAgKiBAcmV0dXJucyBQcm9taXNlPFNvbWVSZXN1bHQ8U2VhcmNoUmVzdWx0Pj4gLSBQYXJ0aWFsUmVzb3VyY2VSZXN1bHRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzZWFyY2hCeVNob3J0SWQoc2hvcnRJZFF1ZXJ5OiBzdHJpbmcsIHNlYXJjaFBhcmFtczogU2VhcmNoUGFnZVBhcmFtcyk6IFxuICBQcm9taXNlPFNvbWVSZXN1bHQ8U2VhcmNoUmVzdWx0PEFycmF5PFBhcnRpYWxSZXNvdXJjZVJlc3VsdD4+Pj4ge1xuXG4gICAgY29uc3Qgc2VhcmNoUmFuZ2VSZXN1bHQgPSBTZWFyY2hBcGkucmFuZ2VGcm9tU2hvcnRJZFN0cmluZyhzaG9ydElkUXVlcnkpO1xuICAgIGlmIChzZWFyY2hSYW5nZVJlc3VsdC50eXBlID09PSBSZXN1bHRUeXBlLkVSUk9SKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNlYXJjaFJhbmdlUmVzdWx0KTtcbiAgICB9XG4gICAgY29uc3QgW2xvd2VyUmFuZ2UsIHVwcGVyUmFuZ2VdID0gc2VhcmNoUmFuZ2VSZXN1bHQucmVzdWx0O1xuXG4gICAgLy9CdWlsZCBiYXNlIHF1ZXJ5XG4gICAgLy9Gb3Igc29tZSByZWFzb24gaGFzIHRvIGJlIGFueVxuICAgIGxldCBxdWVyeTogYW55ID0gU2VhcmNoQXBpLnNob3J0SWRDb2wodGhpcy5maXJlc3RvcmUsIHRoaXMub3JnSWQpO1xuICAgIFxuICAgIGlmIChsb3dlclJhbmdlICE9PSB1cHBlclJhbmdlKSB7XG4gICAgICBxdWVyeSA9IHF1ZXJ5LndoZXJlKCdpZCcsICc+PScsIGxvd2VyUmFuZ2UpLndoZXJlKCdpZCcsICc8JywgdXBwZXJSYW5nZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vSWRlYWxseSB3ZSBjb3VsZCBkbyBhbiAnPScsIGJ1dCBSTkYgZG9lc24ndCBsaWtlIHRoYXRcbiAgICAgIHF1ZXJ5ID0gcXVlcnkud2hlcmUoJ2lkJywgJz49JywgbG93ZXJSYW5nZSkud2hlcmUoJ2lkJywgJzw9JywgdXBwZXJSYW5nZSk7XG4gICAgfVxuXG4gICAgcXVlcnkgPSBxdWVyeS5vcmRlckJ5KCdpZCcpO1xuICAgIGlmIChzZWFyY2hQYXJhbXMubGFzdFZpc2libGUpIHtcbiAgICAgIHF1ZXJ5ID0gcXVlcnkuc3RhcnRBZnRlcihzZWFyY2hQYXJhbXMubGFzdFZpc2libGUpO1xuICAgIH1cblxuICAgIC8vTWF4IGxpbWl0IGlzIDEwMFxuICAgIHF1ZXJ5ID0gcXVlcnkubGltaXQoc2FmZUxvd2VyKHNlYXJjaFBhcmFtcy5saW1pdCwgMTAwKSk7XG5cbiAgICAvL1J1biB0aGUgcXVlcnlcbiAgICBsZXQgbGFzdFZpc2libGU6IFF1ZXJ5RG9jdW1lbnRTbmFwc2hvdDtcbiAgICByZXR1cm4gYXdhaXQgcXVlcnkuZ2V0KClcbiAgICAudGhlbigoc246IFF1ZXJ5U25hcHNob3QpID0+IHsgIFxuICAgICAgY29uc3QgcXVlcnlSZXN1bHRzOiBQYXJ0aWFsUmVzb3VyY2VSZXN1bHRbXSA9IFtdO1xuICAgICAgbGFzdFZpc2libGUgPSBzbi5kb2NzW3NuLmRvY3MubGVuZ3RoIC0gMV07XG5cbiAgICAgIHNuLmZvckVhY2goZG9jID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGRvYy5kYXRhKCk7XG4gICAgICAgIGlmIChkYXRhLl9pZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQ6IFBhcnRpYWxSZXNvdXJjZVJlc3VsdCA9IHtcbiAgICAgICAgICB0eXBlOiBTZWFyY2hSZXN1bHRUeXBlLlBhcnRpYWxSZXNvdXJjZVJlc3VsdCxcbiAgICAgICAgICBpZDogZGF0YS5sb25nSWQsXG4gICAgICAgICAgc2hvcnRJZDogZGF0YS5zaG9ydElkLFxuICAgICAgICAgIGdyb3Vwczoge30sXG4gICAgICAgICAgb3duZXI6IHt9XG4gICAgICAgIH07XG4gICAgICAgIHF1ZXJ5UmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHF1ZXJ5UmVzdWx0cztcbiAgICB9KVxuICAgIC50aGVuKChyZXN1bHRzOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHNlYXJjaFJlc3VsdDogU2VhcmNoUmVzdWx0PEFycmF5PFBhcnRpYWxSZXNvdXJjZVJlc3VsdD4+ID0ge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAuLi5zZWFyY2hQYXJhbXMsXG4gICAgICAgICAgbGFzdFZpc2libGUsXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VsdHMsXG4gICAgICAgIHR5cGU6IFNlYXJjaFJlc3VsdFR5cGUuUGFydGlhbFJlc291cmNlUmVzdWx0LFxuICAgICAgfTtcbiAgICAgIHJldHVybiBtYWtlU3VjY2VzczxTZWFyY2hSZXN1bHQ8QXJyYXk8UGFydGlhbFJlc291cmNlUmVzdWx0Pj4+KHNlYXJjaFJlc3VsdCk7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcjxTZWFyY2hSZXN1bHQ8QXJyYXk8UGFydGlhbFJlc291cmNlUmVzdWx0Pj4+KGVyci5tZXNzYWdlKSk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIEhlbHBlcnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHVibGljIHN0YXRpYyBzaG9ydElkQ29sKGZpcmVzdG9yZTogRmlyZXN0b3JlLCBvcmdJZDogc3RyaW5nKTogQ29sbGVjdGlvblJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIGZpcmVzdG9yZS5jb2xsZWN0aW9uKCdvcmcnKS5kb2Mob3JnSWQpLmNvbGxlY3Rpb24oJ3Nob3J0SWQnKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcmVzb3VyY2VDb2woZmlyZXN0b3JlOiBGaXJlc3RvcmUsIG9yZ0lkOiBzdHJpbmcpOiBDb2xsZWN0aW9uUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gZmlyZXN0b3JlLmNvbGxlY3Rpb24oJ29yZycpLmRvYyhvcmdJZCkuY29sbGVjdGlvbigncmVzb3VyY2UnKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIHJhbmdlRnJvbVNob3J0SWRTdHJpbmdcbiAgICogXG4gICAqIFxuICAgKiBUcmFuc2Zvcm0gdGhlIHNob3J0SWQgb3Igc2hvcnRJZCBwYXJ0aWFsIGludG8gYSBzZWFyY2hhYmxlIHN0cmluZy4gRm9yIGV4YW1wbGU6XG4gICAqIFxuICAgKiAgIDEwMC0wMDAgIC0+IDAwMDEwMDAwMCwgMDAwMTAwMDAwIHwgZXhhY3RseSBpZCAwMDAtMTAwLTAwMFxuICAgKiAgIDEwMCAgICAgIC0+IDAwMDEwMDAwMCwgMDAwMTAxMDAwIHwgYW55IHNob3J0SWQgc3RhcnRpbmcgd2l0aCAwMDAtMTAwXG4gICAqICAgMTAwMSAgICAgLT4gMDAwMTAwMTAwLCAwMDAxMDAyMDAgfCBBbnkgc2hvcnQgaWQgYmV0d2VlbiAwMDAtMTAwLTEwMCBhbmQgMDAwLTEwMC0yMDBcbiAgICogICAwMDAxMDAwMSAtPiAwMDAxMDAwMTAsIDAwMDEwMDAyMCB8IEFueSBzaG9ydCBpZCBiZXR3ZWVuIDAwMC0xMDAtMDEwIGFuZCAwMDAtMTAwLTAyMFxuICAgKiBcbiAgICogXG4gICAqIEBwYXJhbSBzaG9ydElkOiBzaG9ydElkIHN0cmluZyBvciBwYXJ0aWFsIHN0cmluZ1xuICAgKiBAcmV0dXJucyBTb21lUmVzdWx0PFtzdHJpbmcsIHN0cmluZ10+OiB0aGUgcmFuZ2Ugb2Ygc3RyaW5ncyB0byBzZWFyY2ggZm9yLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByYW5nZUZyb21TaG9ydElkU3RyaW5nKHNob3J0SWQ6IHN0cmluZyk6IFNvbWVSZXN1bHQ8W3N0cmluZywgc3RyaW5nXT4ge1xuICAgIGxldCBsb3dlclJhbmdlOiBzdHJpbmcgPSBcIlwiO1xuICAgIGxldCB1cHBlclJhbmdlOiBzdHJpbmcgPSBcIlwiO1xuXG4gICAgLy9TdHJpcCBvdXQgYWxsIHNwYWNlcywgZGFzaGVzLCBldGNcbiAgICAvLyBsZXQgYmFzZSA9IHNob3J0SWQucmVwbGFjZShuZXcgUmVnRXhwKC9bXlxcZF0rLywgJ2cnKSwgJycpO1xuICAgIGxldCBiYXNlID0gc2hvcnRJZC5yZXBsYWNlKC9bXlxcZF0rL2lnLCAnJyk7XG5cbiAgICAvL01ha2Ugc3VyZSBpdCdzIHdpdGhpbiB0aGUgcmFuZ2VcbiAgICBpZiAoYmFzZS5sZW5ndGggPT09IDAgfHwgYmFzZS5sZW5ndGggPiA5KSB7XG4gICAgICByZXR1cm4gbWFrZUVycm9yPFtzdHJpbmcsIHN0cmluZ10+KFwic2VhcmNoIHNob3J0IGlkIGlzIHRvbyBsb25nIG9yIHNob3J0XCIpO1xuICAgIH1cblxuICAgIC8vSWYgaXQncyBzaG9ydGVyIHRoYW4gNiBkaWdpdHMsIGxvbmcsIGFzc3VtZSB3ZSBoYXZlIGFuIGV4dHJhIHRocmVlIDAwMHMgYXRcbiAgICAvL3RoZSBzdGFydC4gVGhpcyBtYXkgYnJlYWsgdGhpbmdzIGxhdGVyIG9uLCBidXQgb25seSB3aGVuIHdlIGhhdmUgNTMwLDAwMCsgaWRzXG4gICAgaWYgKGJhc2UubGVuZ3RoIDw9IDYpIHtcbiAgICAgIGJhc2UgPSBcIjAwMFwiICsgYmFzZTtcbiAgICB9XG5cbiAgICAvL0lmIHdlIGFyZSB1c2luZyBhIGZ1bGxJZCwgdGhlbiBqdXN0IHJldHVybiB0aGF0IGlkIHR3aWNlXG4gICAgaWYgKGJhc2UubGVuZ3RoID09PSA5KSB7XG4gICAgICByZXR1cm4gbWFrZVN1Y2Nlc3M8W3N0cmluZywgc3RyaW5nXT4oW2Jhc2UsIGJhc2VdKTtcbiAgICB9XG5cbiAgICAvL1dlIGhhdmUgYSBwYXJ0aWFsIHNob3J0IGlkLlxuICAgIC8vVGhpcyBtZWFucyB3ZSBuZWVkIHRvIGNvbnZlcnQgaXQgaW50byBhIG51bWJlciBhbmQgYWRkIG9uZSwgdGhlbiBjb252ZXJ0XG4gICAgLy9iYWNrIGFuZCBhZGQgYW55IGxlZnQgemVyb3Mgd2UgbWF5IGhhdmUgcmVtb3ZlZC5cbiAgICBsb3dlclJhbmdlID0gYmFzZTtcbiAgICBsZXQgbG93ZXJOdW1iZXJcbiAgICBsZXQgdXBwZXJOdW1iZXI7XG4gICAgdHJ5IHtcbiAgICAgIGxvd2VyTnVtYmVyID0gcGFyc2VJbnQobG93ZXJSYW5nZSk7XG4gICAgICBpZiAobG93ZXJOdW1iZXIgPT09IE5hTikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHBhcnNpbmcgc2hvcnRJZCBiYXNlIHN0cmluZzogJHtsb3dlck51bWJlcn1gKTtcbiAgICAgIH1cbiAgICAgIHVwcGVyTnVtYmVyID0gbG93ZXJOdW1iZXIgKyAxO1xuICAgICAgdXBwZXJSYW5nZSA9IHVwcGVyTnVtYmVyLnRvU3RyaW5nKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gbWFrZUVycm9yPFtzdHJpbmcsIHN0cmluZ10+KGVyci5tZXNzYWdlKTtcbiAgICB9XG5cbiAgICBpZiAoIXVwcGVyTnVtYmVyKSB7XG4gICAgICByZXR1cm4gbWFrZUVycm9yPFtzdHJpbmcsIHN0cmluZ10+KGBFcnJvciBwYXJzaW5nIHNob3J0SWQgYmFzZSBzdHJpbmcgYW5kIGFkZGluZyAxOiAke2xvd2VyTnVtYmVyfWApO1xuICAgIH1cblxuICAgIC8vUGFkIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHN0cmluZyB0byBnZXQgdGhlIGxlYWRpbmcgMDAncyBiYWNrXG4gICAgdXBwZXJSYW5nZSA9IGxlZnRQYWQodXBwZXJSYW5nZSwgJzAnLCBsb3dlclJhbmdlLmxlbmd0aCk7XG5cbiAgICAvL1BhZCB0aGUgcmlnaHQgaGFuZCBzaWRlIHRvIG1ha2UgYSA5IGRpZ2l0IG51bWJlclxuICAgIGxvd2VyUmFuZ2UgPSByaWdodFBhZChsb3dlclJhbmdlLCAnMCcsIDkpO1xuICAgIHVwcGVyUmFuZ2UgPSByaWdodFBhZCh1cHBlclJhbmdlLCAnMCcsIDkpO1xuXG5cbiAgICByZXR1cm4gbWFrZVN1Y2Nlc3M8W3N0cmluZywgc3RyaW5nXT4oW2xvd2VyUmFuZ2UsIHVwcGVyUmFuZ2VdKTtcbiAgfVxufSJdfQ==