"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DatasourceType = require("../../enums/DatasourceType");

var request = _interopRequireWildcard(require("request-promise-native"));

var _Group = require("../Group");

var _OWGeoPoint = _interopRequireDefault(require("../../models/OWGeoPoint"));

var moment = _interopRequireWildcard(require("moment"));

var _utils = require("../../utils");

var _GroupType = require("../../enums/GroupType");

var _Resource = require("../Resource");

var _ResourceIdType = _interopRequireDefault(require("../../types/ResourceIdType"));

var _ResourceType = require("../../enums/ResourceType");

var _Reading = require("../Reading");

var _env = require("../../env");

var _FileDatasourceTypes = require("../../enums/FileDatasourceTypes");

var _DefaultSyncRunResult = require("../DefaultSyncRunResult");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var LegacyMyWellDatasource =
/*#__PURE__*/
function () {
  function LegacyMyWellDatasource(baseUrl, selectedDatatypes) {
    _classCallCheck(this, LegacyMyWellDatasource);

    Object.defineProperty(this, "baseUrl", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "type", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "selectedDatatypes", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    this.baseUrl = baseUrl;
    this.type = _DatasourceType.DatasourceType.LegacyMyWellDatasource;
    this.selectedDatatypes = selectedDatatypes;
  }

  _createClass(LegacyMyWellDatasource, [{
    key: "getGroupData",

    /**
     * Iterates through pincodes and villages from MyWell datasource
     * 
     * As villages have only a single point, we create our own
     * imaginary bounding box for the new group
     * 
     */
    value: function getGroupData() {
      // https://mywell-server.vessels.tech/api/villages
      //TODO proper Legacy Api Client
      var uriVillage = "".concat(this.baseUrl, "/api/villages");
      var options = {
        method: 'GET',
        uri: uriVillage,
        json: true
      };
      return (0, request)(options).then(function (response) {
        return response;
      });
    }
  }, {
    key: "saveGroups",
    value: function saveGroups(orgId, fs, groups) {
      var errors = [];
      var savedGroups = [];
      return Promise.all(groups.map(function (group) {
        return group.create({
          fs: fs
        }).then(function (savedGroup) {
          return savedGroups.push(savedGroup);
        }).catch(function (err) {
          return errors.push(err);
        });
      })).then(function () {
        return {
          results: savedGroups,
          warnings: [],
          errors: errors
        };
      });
    }
  }, {
    key: "getGroupAndSave",
    value: function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(orgId, fs) {
        var legacyVillages, newGroups;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.getGroupData();

              case 2:
                legacyVillages = _context.sent;
                newGroups = LegacyMyWellDatasource.transformLegacyVillagesToGroups(orgId, legacyVillages);
                _context.next = 6;
                return this.saveGroups(orgId, fs, newGroups);

              case 6:
                return _context.abrupt("return", _context.sent);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getGroupAndSave(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return getGroupAndSave;
    }()
    /**
     * Create groups based on inferred pincode data
     * 
     */

  }, {
    key: "getPincodeData",
    value: function getPincodeData(orgId, fs) {
      //Get all villages, and for each village within a pincode, create a bounding box based on the center
      var uriVillage = "".concat(this.baseUrl, "/api/villages");
      var options = {
        method: 'GET',
        uri: uriVillage,
        json: true
      };
      var pincodeGroups = null;
      var pincodeIds = {};
      return (0, request)(options).then(function (villages) {
        //group the villages by id
        villages.forEach(function (v) {
          var groupList = pincodeIds[v.postcode];

          if (!groupList) {
            groupList = [];
          }

          groupList.push(v);
          pincodeIds[v.postcode] = groupList;
        }); //Now go through each pincode group, and create a single group

        pincodeGroups = Object.keys(pincodeIds).map(function (pincode) {
          var legacyVillages = pincodeIds[pincode]; //TODO: the only issue with this approach is that the coordinates aren't in order.

          var coords = legacyVillages.map(function (v) {
            return new _OWGeoPoint.default(v.coordinates.lat, v.coordinates.lng);
          });

          var externalIds = _ResourceIdType.default.fromLegacyPincode(pincode);

          return new _Group.Group(pincode, orgId, _GroupType.GroupType.Pincode, coords, externalIds);
        });
        var errors = [];
        var savedGroups = [];
        pincodeGroups.forEach(function (group) {
          return group.create({
            fs: fs
          }).then(function (savedGroup) {
            return savedGroups.push(savedGroup);
          }).catch(function (err) {
            console.log("err", err);
            errors.push(err);
          });
        });
        return {
          results: pincodeGroups,
          warnings: [],
          errors: errors
        };
      });
    }
    /**
     * get all resources from MyWell
     * 
     * This doesn't require pagination, so we won't bother implementing it yet.
     * convert legacy MyWell resources into OW resources
     * return
     */

  }, {
    key: "getResourcesData",
    value: function getResourcesData(orgId, fs) {
      // const uriResources = `${this.baseUrl}/api/resources?filter=%7B%22where%22%3A%7B%22resourceId%22%3A1110%7D%7D`;
      var uriResources = "".concat(this.baseUrl, "/api/resources");
      console.log("Getting resources data");
      var options = {
        method: 'GET',
        uri: uriResources,
        json: true
      };
      var resources = [];
      var legacyGroups = null;
      return (0, _utils.getLegacyMyWellGroups)(orgId, fs).then(function (_legacyGroups) {
        return legacyGroups = _legacyGroups;
      }).then(function () {
        return (0, request)(options);
      }).then(function (legacyRes) {
        legacyRes.forEach(function (r) {
          var externalIds = _ResourceIdType.default.fromLegacyMyWellId(r.postcode, r.id);

          var coords = new _OWGeoPoint.default(r.geo.lat, r.geo.lng);
          var resourceType = (0, _ResourceType.resourceTypeFromString)(r.type);
          var owner = {
            name: r.owner,
            createdByUserId: 'default'
          };
          var groups = (0, _utils.findGroupMembershipsForResource)(r, legacyGroups);
          var newResource = new _Resource.Resource(orgId, externalIds, coords, resourceType, owner, groups);
          newResource.lastReadingDatetime = (0, moment)(r.last_date).toDate();
          newResource.lastValue = r.last_value;
          resources.push(newResource);
        });
        var errors = [];
        var savedResources = [];
        resources.forEach(function (res) {
          return res.create({
            fs: fs
          }).then(function (savedRes) {
            return savedResources.push(savedRes);
          }).catch(function (err) {
            return errors.push(err);
          });
        });
        return {
          results: savedResources,
          warnings: [],
          errors: errors
        };
      });
    }
    /**
     * Get all readings from MyWell
     * 
     * This also doesn't require pagination, but is expensive.
     * Perhaps we should test with just a small number of readings for now
     * 
     */

  }, {
    key: "getReadingsData",
    value: function getReadingsData(orgId, fs) {
      var uriReadings = "".concat(this.baseUrl, "/api/readings?access_token=").concat(_env.mywellLegacyAccessToken); //TODO: add filter for testing purposes
      // const uriReadings = `${this.baseUrl}/api/resources`;

      var options = {
        method: 'GET',
        uri: uriReadings,
        json: true
      };
      var readings = [];
      var legacyResources = null;
      var legacyGroups = null; //TODO: load a map of all saved resources, where key is the legacyId (pincode.resourceId)
      //This will enable us to easily map
      //We also need to have the groups first

      return Promise.all([(0, _utils.getLegacyMyWellResources)(orgId, fs), (0, _utils.getLegacyMyWellGroups)(orgId, fs)]).then(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            _legacyResources = _ref3[0],
            _legacyGroups = _ref3[1];

        legacyResources = _legacyResources;
        legacyGroups = _legacyGroups;
      }).then(function () {
        return (0, request)(options);
      }).then(function (legacyReadings) {
        var errors = [];
        var warnings = [];
        legacyReadings.forEach(function (r) {
          if (_typeof(r.value) === undefined) {
            console.log("warning: found reading with no value", r);
            return;
          } //get metadata that didn't exist on original reading


          var resource;

          try {
            resource = (0, _utils.findResourceMembershipsForResource)(r, legacyResources);
          } catch (err) {
            warnings.push(err.message);
            return;
          }

          var externalIds = _ResourceIdType.default.fromLegacyReadingId(r.id, r.postcode, r.resourceId);

          var groups = (0, _utils.findGroupMembershipsForReading)(r, legacyGroups);
          var newReading = new _Reading.Reading(orgId, resource.id, resource.coords, resource.resourceType, groups, (0, moment)(r.createdAt).toDate(), r.value, externalIds);
          newReading.isLegacy = true; //set the isLegacy flag to true to skip updating the resource every time

          readings.push(newReading);
        });
        var savedReadings = [];
        readings.forEach(function (res) {
          return res.create({
            fs: fs
          }).then(function (savedRes) {
            return savedReadings.push(savedRes);
          }).catch(function (err) {
            return errors.push(err);
          });
        });
        return {
          results: savedReadings,
          warnings: warnings,
          errors: errors
        };
      }) //Catch fatal errors here
      .catch(function (err) {
        console.log("getReadingsData error, ", err.message);
        return {
          results: [],
          warnings: [],
          errors: [err.message]
        };
      });
    }
  }, {
    key: "validate",
    value: function () {
      var _ref4 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(orgId, fs) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                throw new Error("validate not implemented for this data source");

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function validate(_x3, _x4) {
        return _ref4.apply(this, arguments);
      }

      return validate;
    }()
  }, {
    key: "pullDataFromDataSource",
    value: function () {
      var _ref5 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(orgId, fs, options) {
        var _this = this;

        var villageGroupResult, pincodeGroups, resources, readings;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                console.log("pull from data source", this.selectedDatatypes);
                villageGroupResult = new _DefaultSyncRunResult.DefaultSyncRunResult();
                pincodeGroups = new _DefaultSyncRunResult.DefaultSyncRunResult();
                resources = new _DefaultSyncRunResult.DefaultSyncRunResult();
                readings = new _DefaultSyncRunResult.DefaultSyncRunResult();
                this.selectedDatatypes.forEach(function () {
                  var _ref6 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee3(datatypeStr) {
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            _context3.t0 = datatypeStr;
                            _context3.next = _context3.t0 === _FileDatasourceTypes.DataType.Resource ? 3 : _context3.t0 === _FileDatasourceTypes.DataType.Reading ? 7 : _context3.t0 === _FileDatasourceTypes.DataType.Group ? 11 : 18;
                            break;

                          case 3:
                            _context3.next = 5;
                            return _this.getResourcesData(orgId, fs);

                          case 5:
                            resources = _context3.sent;
                            return _context3.abrupt("break", 19);

                          case 7:
                            _context3.next = 9;
                            return _this.getReadingsData(orgId, fs);

                          case 9:
                            readings = _context3.sent;
                            return _context3.abrupt("break", 19);

                          case 11:
                            _context3.next = 13;
                            return _this.getGroupAndSave(orgId, fs);

                          case 13:
                            villageGroupResult = _context3.sent;
                            _context3.next = 16;
                            return _this.getPincodeData(orgId, fs);

                          case 16:
                            pincodeGroups = _context3.sent;
                            return _context3.abrupt("break", 19);

                          case 18:
                            throw new Error("pullDataFromDataSource not implemented for DataType: ".concat(datatypeStr));

                          case 19:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3, this);
                  }));

                  return function (_x8) {
                    return _ref6.apply(this, arguments);
                  };
                }());
                return _context4.abrupt("return", (0, _utils.concatSaveResults)([villageGroupResult, pincodeGroups, resources, readings]));

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function pullDataFromDataSource(_x5, _x6, _x7) {
        return _ref5.apply(this, arguments);
      }

      return pullDataFromDataSource;
    }()
    /**
     * Get readings from OurWater that are eligible to be saved into LegacyMyWell
     * 
     * Filters based on the following properties:
     * - createdAt: when the reading was created (not the datetime of the reading), and
     * - externalIds.hasLegacyMyWellResourceId: a boolean flag indicating that the reading
     *     has a relationship to an external data source
     */

  }, {
    key: "getNewReadings",
    value: function getNewReadings(orgId, fs, filterAfterDate) {
      return fs.collection('org').doc(orgId).collection('reading').where('externalIds.hasLegacyMyWellResourceId', '==', true).where('createdAt', '>=', filterAfterDate) //TODO: we need to set a maximum on this, and paginate properly
      .limit(50).get().then(function (sn) {
        var readings = [];
        sn.forEach(function (doc) {
          return readings.push(_Reading.Reading.deserialize(doc));
        });
        return readings;
      });
    }
    /**
     * Get resources from OurWater that are eligble to be saved into LegacyMyWell
     * 
     * A NEW resource is one that:
     * - has a pincode
     * - does not have a MyWellId, a villageId or resourceId
     * 
     */

  }, {
    key: "getNewResources",
    value: function getNewResources(orgId, fs, filterAfterDate) {
      return fs.collection('org').doc(orgId).collection('resource').where('externalIds.hasLegacyMyWellPincode', '==', true).where('externalIds.hasLegacyMyWellId', '==', false).where('createdAt', '>=', filterAfterDate).limit(50).get().then(function (sn) {
        return (0, _utils.snapshotToResourceList)(sn);
      });
    }
    /* TODO: implement and use in addition to getNewResources.
    We're not too worried about updating resources at this stage
     public getUpdatedResources(orgId: string, fs, filterAfterDate: number): Promise<Array<Resource>> {
      return fs.collection('org').doc(orgId).collection('resource')
      //TODO: should we also check for isLegacy?
        .where('externalIds.hasLegacyMyWellId', '==', true)
        .where('createdAt', '>=', filterAfterDate)
        .limit(50).get()
        .then(sn => {
          const resources: Array<Resource> = [];
          sn.forEach(doc => resources.push(Resource.fromDoc(doc)));
          return resources;
        });
    }
    */

  }, {
    key: "saveReadingsToLegacyMyWell",
    value: function saveReadingsToLegacyMyWell(readings) {
      //TODO: Eventually make this a proper, mockable web client
      var uriReadings = "".concat(this.baseUrl, "/api/readings?access_token=").concat(_env.mywellLegacyAccessToken); //TODO: add filter for testing purposes

      var options = {
        method: 'POST',
        uri: uriReadings,
        json: true,
        body: readings
      };
      return (0, request)(options).then(function (res) {
        var results = res.map(function (resource) {
          return resource.id;
        });
        return {
          results: results,
          warnings: [],
          errors: []
        };
      }).catch(function (err) {
        return (0, _utils.resultWithError)(err.message);
      });
    }
    /**
     * Convert a list of SyncRunResults containing only one item each into a list of
     * nulls and ids
     */

  }, {
    key: "saveNewResourcesToLegacyMyWell",

    /**
     * Save New resources to LegacyMyWell.
     * 
     * Saves them one at a time, and when the resources are saved, gets the resourceId and updates the 
     * External IDs on the OW side.
     * 
     */
    value: function () {
      var _ref7 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(resources) {
        var _this2 = this;

        var legacyResources;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return LegacyMyWellDatasource.transformResourcesToLegacyMyWell(resources);

              case 2:
                legacyResources = _context5.sent;
                return _context5.abrupt("return", Promise.all(legacyResources.map(function (resource) {
                  //If this dies, it will return a SyncRunResult with one error, and end up as a null below
                  return _this2.saveResourcesToLegacyMyWell([resource]);
                })).then(function (results) {
                  return LegacyMyWellDatasource.convertSyncRunResultsToList(results);
                }));

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function saveNewResourcesToLegacyMyWell(_x9) {
        return _ref7.apply(this, arguments);
      }

      return saveNewResourcesToLegacyMyWell;
    }()
    /**
     * Given a list of ids or nulls, and a list of OW Resources, update the OW Resources to have
     * the correct external ids
     * 
     * //TODO: we assume that they will be in the same order. TODO: check this assumption!
     */

  }, {
    key: "updateExistingResources",
    value: function () {
      var _ref8 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(resources, ids, fs) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt("return", ids.reduce(function () {
                  var _ref9 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee6(acc, curr, idx) {
                    var result, owResource, pincode;
                    return regeneratorRuntime.wrap(function _callee6$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            _context6.next = 2;
                            return acc;

                          case 2:
                            result = _context6.sent;
                            owResource = resources[idx];

                            if (!(curr === null)) {
                              _context6.next = 7;
                              break;
                            }

                            result.warnings.push("Failed to save resource with id:".concat(owResource.id, "."));
                            return _context6.abrupt("return", Promise.resolve(result));

                          case 7:
                            pincode = owResource.externalIds.getPostcode();
                            owResource.externalIds = _ResourceIdType.default.fromLegacyMyWellId(pincode, curr);
                            return _context6.abrupt("return", owResource.save({
                              fs: fs
                            }).then(function () {
                              return result.results.push(curr);
                            }).catch(function (err) {
                              return result.errors.push(err.message);
                            }).then(function () {
                              return result;
                            }));

                          case 10:
                          case "end":
                            return _context6.stop();
                        }
                      }
                    }, _callee6, this);
                  }));

                  return function (_x13, _x14, _x15) {
                    return _ref9.apply(this, arguments);
                  };
                }(), Promise.resolve(new _DefaultSyncRunResult.DefaultSyncRunResult())));

              case 1:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function updateExistingResources(_x10, _x11, _x12) {
        return _ref8.apply(this, arguments);
      }

      return updateExistingResources;
    }()
    /**
     * Save a number of resources in bulk.
     * 
     * Use for updating a number of resources at a time. Don't use for creating new resources that don't have Ids yet.
     */

  }, {
    key: "saveResourcesToLegacyMyWell",
    value: function saveResourcesToLegacyMyWell(resources) {
      //TODO: Eventually make this a proper, mockable web client
      var uriReadings = "".concat(this.baseUrl, "/api/resources?access_token=").concat(_env.mywellLegacyAccessToken); //TODO: add filter for testing purposes

      var options = {
        method: 'POST',
        uri: uriReadings,
        json: true,
        body: resources
      };
      return (0, request)(options).then(function (res) {
        var results = res.map(function (resource) {
          return resource.id;
        });
        return {
          results: results,
          warnings: [],
          errors: []
        };
      }).catch(function (err) {
        console.log("ERROR saveResourcesToLegacyMyWell", err.message);
        return (0, _utils.resultWithError)(err.message);
      });
    }
  }, {
    key: "pushDataToDataSource",
    value: function () {
      var _ref10 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(orgId, fs, options) {
        var _this3 = this;

        var villageGroupResult, pincodeGroupResult, resourceResult, readingResult;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                villageGroupResult = new _DefaultSyncRunResult.DefaultSyncRunResult();
                pincodeGroupResult = new _DefaultSyncRunResult.DefaultSyncRunResult();
                resourceResult = new _DefaultSyncRunResult.DefaultSyncRunResult();
                readingResult = new _DefaultSyncRunResult.DefaultSyncRunResult();
                this.selectedDatatypes.forEach(function () {
                  var _ref11 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee8(datatypeStr) {
                    var readings, legacyReadings, newResources, ids;
                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
                      while (1) {
                        switch (_context8.prev = _context8.next) {
                          case 0:
                            _context8.t0 = datatypeStr;
                            _context8.next = _context8.t0 === _FileDatasourceTypes.DataType.Reading ? 3 : _context8.t0 === _FileDatasourceTypes.DataType.Resource ? 14 : 25;
                            break;

                          case 3:
                            _context8.next = 5;
                            return _this3.getNewReadings(orgId, fs, options.filterAfterDate);

                          case 5:
                            readings = _context8.sent;
                            console.log("pushDataToDataSource, found ".concat(readings.length, " new/updated readings"));
                            _context8.next = 9;
                            return LegacyMyWellDatasource.transformReadingsToLegacyMyWell(readings);

                          case 9:
                            legacyReadings = _context8.sent;
                            _context8.next = 12;
                            return _this3.saveReadingsToLegacyMyWell(legacyReadings);

                          case 12:
                            readingResult = _context8.sent;
                            return _context8.abrupt("break", 26);

                          case 14:
                            _context8.next = 16;
                            return _this3.getNewResources(orgId, fs, options.filterAfterDate);

                          case 16:
                            newResources = _context8.sent;
                            console.log("pushDataToDataSource, found ".concat(newResources.length, " new resources"));
                            _context8.next = 20;
                            return _this3.saveNewResourcesToLegacyMyWell(newResources);

                          case 20:
                            ids = _context8.sent;
                            _context8.next = 23;
                            return _this3.updateExistingResources(newResources, ids, fs);

                          case 23:
                            resourceResult = _context8.sent;
                            return _context8.abrupt("break", 26);

                          case 25:
                            throw new Error("pullDataFromDataSource not implemented for DataType: ".concat(datatypeStr));

                          case 26:
                            return _context8.abrupt("return", true);

                          case 27:
                          case "end":
                            return _context8.stop();
                        }
                      }
                    }, _callee8, this);
                  }));

                  return function (_x19) {
                    return _ref11.apply(this, arguments);
                  };
                }());
                return _context9.abrupt("return", (0, _utils.concatSaveResults)([villageGroupResult, pincodeGroupResult, resourceResult, readingResult]));

              case 6:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function pushDataToDataSource(_x16, _x17, _x18) {
        return _ref10.apply(this, arguments);
      }

      return pushDataToDataSource;
    }()
  }, {
    key: "serialize",
    value: function serialize() {
      return {
        baseUrl: this.baseUrl,
        type: this.type.toString(),
        selectedDatatypes: this.selectedDatatypes
      };
    }
  }], [{
    key: "transformLegacyVillagesToGroups",
    value: function transformLegacyVillagesToGroups(orgId, villages) {
      return villages.map(function (village) {
        var coords = (0, _utils.createDiamondFromLatLng)(village.coordinates.lat, village.coordinates.lng, 0.1);

        var externalIds = _ResourceIdType.default.fromLegacyVillageId(village.postcode, village.id);

        return new _Group.Group(village.name, orgId, _GroupType.GroupType.Village, coords, externalIds);
      });
    }
  }, {
    key: "transformReadingsToLegacyMyWell",
    value: function transformReadingsToLegacyMyWell(readings) {
      return readings.map(function (reading) {
        return {
          date: (0, moment)(reading.datetime).toISOString(),
          value: reading.value,
          villageId: reading.externalIds.getVillageId(),
          postcode: reading.externalIds.getPostcode(),
          resourceId: reading.externalIds.getResourceId(),
          createdAt: (0, moment)(reading.createdAt).toISOString(),
          updatedAt: (0, moment)(reading.updatedAt).toISOString()
        };
      });
    }
  }, {
    key: "transformResourcesToLegacyMyWell",
    value: function transformResourcesToLegacyMyWell(resources) {
      return resources.map(function (resource) {
        return {
          postcode: resource.externalIds.getPostcode(),
          geo: {
            lat: resource.coords._latitude,
            lng: resource.coords._longitude
          },
          last_value: resource.lastValue,
          //TODO: this may cause problems...
          last_date: (0, moment)(resource.lastReadingDatetime).toISOString(),
          owner: resource.owner.name,
          type: resource.resourceType,
          createdAt: (0, moment)(resource.createdAt).toISOString(),
          updatedAt: (0, moment)(resource.updatedAt).toISOString(),
          villageId: resource.externalIds.getVillageId()
        };
      });
    }
  }, {
    key: "convertSyncRunResultsToList",
    value: function convertSyncRunResultsToList(results) {
      return results.map(function (result) {
        return result.results[0] ? result.results[0] : null;
      });
    }
  }]);

  return LegacyMyWellDatasource;
}();

exports.default = LegacyMyWellDatasource;