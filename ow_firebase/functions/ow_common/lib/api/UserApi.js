"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserApi = void 0;

var _Resource = require("../model/Resource");

var _AppProviderTypes = require("../utils/AppProviderTypes");

var _User = require("../model/User");

var _ArrayUtils = _interopRequireDefault(require("../utils/ArrayUtils"));

var _model = require("../model");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var UserApi =
/*#__PURE__*/
function () {
  function UserApi(firestore, orgId) {
    _classCallCheck(this, UserApi);

    _defineProperty(this, "firestore", void 0);

    _defineProperty(this, "orgId", void 0);

    this.firestore = firestore;
    this.orgId = orgId;
  }

  _createClass(UserApi, [{
    key: "addFavouriteResource",
    value: function () {
      var _addFavouriteResource = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(userId, resource) {
        var favouritesResult, favourites;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.getFavouriteResources(userId);

              case 2:
                favouritesResult = _context.sent;

                if (!(favouritesResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", favouritesResult);

              case 5:
                favourites = favouritesResult.result;
                favourites[resource.id] = resource;
                return _context.abrupt("return", this.updateFavouriteResources(userId, favourites));

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function addFavouriteResource(_x, _x2) {
        return _addFavouriteResource.apply(this, arguments);
      }

      return addFavouriteResource;
    }()
    /**
     * Add a list of favourite resources to the user's favourites
     */

  }, {
    key: "addFavouriteResources",
    value: function () {
      var _addFavouriteResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(userId, resources) {
        var favouritesResult, favourites;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.getFavouriteResources(userId);

              case 2:
                favouritesResult = _context2.sent;

                if (!(favouritesResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return", favouritesResult);

              case 5:
                favourites = favouritesResult.result;
                resources.forEach(function (r) {
                  favourites[r.id] = r;
                });
                return _context2.abrupt("return", this.updateFavouriteResources(userId, favourites));

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function addFavouriteResources(_x3, _x4) {
        return _addFavouriteResources.apply(this, arguments);
      }

      return addFavouriteResources;
    }()
    /**
     * Add new resources to the User's object.
     */

  }, {
    key: "markAsNewResources",
    value: function () {
      var _markAsNewResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(userId, resourceIds) {
        var newResourcesResult, newResources;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.getNewResources(userId);

              case 2:
                newResourcesResult = _context3.sent;

                if (!(newResourcesResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", newResourcesResult);

              case 5:
                newResources = newResourcesResult.result;
                resourceIds.forEach(function (id) {
                  return newResources[id] = id;
                });
                return _context3.abrupt("return", this.updateNewResources(userId, newResources));

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function markAsNewResources(_x5, _x6) {
        return _markAsNewResources.apply(this, arguments);
      }

      return markAsNewResources;
    }()
  }, {
    key: "removeNewResource",
    value: function () {
      var _removeNewResource = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(userId, resourceId) {
        var newResourcesResult, newResources;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getNewResources(userId);

              case 2:
                newResourcesResult = _context4.sent;

                if (!(newResourcesResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context4.next = 5;
                  break;
                }

                return _context4.abrupt("return", newResourcesResult);

              case 5:
                newResources = newResourcesResult.result;
                delete newResources[resourceId];
                return _context4.abrupt("return", this.updateNewResources(userId, newResources));

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function removeNewResource(_x7, _x8) {
        return _removeNewResource.apply(this, arguments);
      }

      return removeNewResource;
    }()
  }, {
    key: "getNewResources",
    value: function () {
      var _getNewResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(userId) {
        var userResult, user;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.getUser(this.userRef(this.orgId, userId));

              case 2:
                userResult = _context5.sent;

                if (!(userResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context5.next = 5;
                  break;
                }

                return _context5.abrupt("return", userResult);

              case 5:
                user = userResult.result;
                return _context5.abrupt("return", (0, _AppProviderTypes.makeSuccess)(user.newResources));

              case 7:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getNewResources(_x9) {
        return _getNewResources.apply(this, arguments);
      }

      return getNewResources;
    }()
  }, {
    key: "updateNewResources",
    value: function () {
      var _updateNewResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(userId, newResources) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", this.userRef(this.orgId, userId).update({
                  newResources: newResources
                }).then(function () {
                  return (0, _AppProviderTypes.makeSuccess)(undefined);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                }));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function updateNewResources(_x10, _x11) {
        return _updateNewResources.apply(this, arguments);
      }

      return updateNewResources;
    }()
  }, {
    key: "removeFavouriteResource",
    value: function () {
      var _removeFavouriteResource = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(userId, resourceId) {
        var favouritesResult, favourites;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.getFavouriteResources(userId);

              case 2:
                favouritesResult = _context7.sent;

                if (!(favouritesResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context7.next = 5;
                  break;
                }

                return _context7.abrupt("return", favouritesResult);

              case 5:
                favourites = favouritesResult.result;
                delete favourites[resourceId];
                return _context7.abrupt("return", this.updateFavouriteResources(userId, favourites));

              case 8:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function removeFavouriteResource(_x12, _x13) {
        return _removeFavouriteResource.apply(this, arguments);
      }

      return removeFavouriteResource;
    }()
  }, {
    key: "updateFavouriteResources",
    value: function () {
      var _updateFavouriteResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(userId, favouriteResources) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                return _context8.abrupt("return", this.userRef(this.orgId, userId).set({
                  favouriteResources: favouriteResources
                }, {
                  merge: true
                }).then(function () {
                  return (0, _AppProviderTypes.makeSuccess)(undefined);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                }));

              case 1:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function updateFavouriteResources(_x14, _x15) {
        return _updateFavouriteResources.apply(this, arguments);
      }

      return updateFavouriteResources;
    }()
  }, {
    key: "getFavouriteResources",
    value: function () {
      var _getFavouriteResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(userId) {
        var userResult, user;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.getUser(this.userRef(this.orgId, userId));

              case 2:
                userResult = _context9.sent;

                if (!(userResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context9.next = 5;
                  break;
                }

                return _context9.abrupt("return", userResult);

              case 5:
                user = userResult.result;
                return _context9.abrupt("return", (0, _AppProviderTypes.makeSuccess)(user.favouriteResources));

              case 7:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getFavouriteResources(_x16) {
        return _getFavouriteResources.apply(this, arguments);
      }

      return getFavouriteResources;
    }()
  }, {
    key: "getRecentResources",
    value: function () {
      var _getRecentResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(userId) {
        var userResult, user;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.getUser(this.userRef(this.orgId, userId));

              case 2:
                userResult = _context10.sent;

                if (!(userResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context10.next = 5;
                  break;
                }

                return _context10.abrupt("return", userResult);

              case 5:
                user = userResult.result;
                return _context10.abrupt("return", (0, _AppProviderTypes.makeSuccess)(user.recentResources));

              case 7:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function getRecentResources(_x17) {
        return _getRecentResources.apply(this, arguments);
      }

      return getRecentResources;
    }()
    /**
     * Change the user's status
     */

  }, {
    key: "changeUserStatus",
    value: function () {
      var _changeUserStatus = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11(userId, status) {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                return _context11.abrupt("return", this.userRef(this.orgId, userId).set({
                  status: status
                }, {
                  merge: true
                }).then(function () {
                  return (0, _AppProviderTypes.makeSuccess)(undefined);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                }));

              case 1:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function changeUserStatus(_x18, _x19) {
        return _changeUserStatus.apply(this, arguments);
      }

      return changeUserStatus;
    }()
  }, {
    key: "changeUserType",
    value: function () {
      var _changeUserType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(userId, type) {
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                return _context12.abrupt("return", this.userRef(this.orgId, userId).set({
                  type: type
                }, {
                  merge: true
                }).then(function () {
                  return (0, _AppProviderTypes.makeSuccess)(undefined);
                }));

              case 1:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function changeUserType(_x20, _x21) {
        return _changeUserType.apply(this, arguments);
      }

      return changeUserType;
    }()
    /**
     * mergeUsers
     * 
     * Merge two user accounts together. Includes merging subcollections
     */

  }, {
    key: "mergeUsers",
    value: function () {
      var _mergeUsers = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(oldUserId, newUserId) {
        var oldUserResult, newUserResult, oldUser, newUser, mergePendingReadingsResult, mergePendingResourcesResult, userToSave;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return this.getUser(this.userRef(this.orgId, oldUserId));

              case 2:
                oldUserResult = _context13.sent;

                if (!(oldUserResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context13.next = 5;
                  break;
                }

                return _context13.abrupt("return", oldUserResult);

              case 5:
                _context13.next = 7;
                return this.getUser(this.userRef(this.orgId, newUserId));

              case 7:
                newUserResult = _context13.sent;

                if (!(newUserResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context13.next = 10;
                  break;
                }

                return _context13.abrupt("return", oldUserResult);

              case 10:
                oldUser = oldUserResult.result;
                newUser = newUserResult.result;
                _context13.next = 14;
                return this.mergeUserPendingReadings(oldUserId, newUserId);

              case 14:
                mergePendingReadingsResult = _context13.sent;

                if (!(mergePendingReadingsResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context13.next = 17;
                  break;
                }

                return _context13.abrupt("return", mergePendingReadingsResult);

              case 17:
                _context13.next = 19;
                return this.mergeUserPendingResources(oldUserId, newUserId);

              case 19:
                mergePendingResourcesResult = _context13.sent;

                if (!(mergePendingResourcesResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context13.next = 22;
                  break;
                }

                return _context13.abrupt("return", mergePendingResourcesResult);

              case 22:
                userToSave = {
                  id: newUser.id,
                  favouriteResources: _objectSpread({}, oldUser.favouriteResources, newUser.favouriteResources),
                  newResources: _objectSpread({}, oldUser.newResources, newUser.newResources),
                  pendingSavedReadings: [],
                  //this is a subcollection
                  pendingSavedResources: [],
                  //this is a subcollection
                  recentResources: _ArrayUtils.default.mergeArrays(oldUser.recentResources, newUser.recentResources, function (r) {
                    return r.id;
                  }),
                  recentSearches: _ArrayUtils.default.mergeArrays(oldUser.recentSearches, newUser.recentSearches, function (s) {
                    return s;
                  }),
                  status: newUser.status,
                  translation: newUser.translation,
                  type: newUser.type
                };
                return _context13.abrupt("return", this.userRef(this.orgId, newUserId).set(userToSave, {
                  merge: true
                }).then(function () {
                  return (0, _AppProviderTypes.makeSuccess)(undefined);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                }));

              case 24:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function mergeUsers(_x22, _x23) {
        return _mergeUsers.apply(this, arguments);
      }

      return mergeUsers;
    }()
    /**
     * mergeUserPendingReadings
     * 
     * Merge together a user's pending readings
     * 
     * @param oldUserId 
     * @param newUserId 
     */

  }, {
    key: "mergeUserPendingReadings",
    value: function () {
      var _mergeUserPendingReadings = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee14(oldUserId, newUserId) {
        var _this = this;

        var oldReadingsResult, oldReadings, saveReadingsResult;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _context14.next = 2;
                return this.getPendingReadings(this.userRef(this.orgId, oldUserId));

              case 2:
                oldReadingsResult = _context14.sent;

                if (!(oldReadingsResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context14.next = 5;
                  break;
                }

                return _context14.abrupt("return", oldReadingsResult);

              case 5:
                oldReadings = oldReadingsResult.result; //we don't care about the doc id here...

                _context14.t0 = _AppProviderTypes.summarizeResults;
                _context14.next = 9;
                return Promise.all(oldReadings.map(function (r) {
                  return _this.userRef(_this.orgId, newUserId).collection('pendingReadings').add(r).then(function () {
                    return (0, _AppProviderTypes.makeSuccess)(undefined);
                  }).catch(function (err) {
                    return (0, _AppProviderTypes.makeError)(err.message);
                  });
                }));

              case 9:
                _context14.t1 = _context14.sent;
                saveReadingsResult = (0, _context14.t0)(_context14.t1);
                return _context14.abrupt("return", saveReadingsResult);

              case 12:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function mergeUserPendingReadings(_x24, _x25) {
        return _mergeUserPendingReadings.apply(this, arguments);
      }

      return mergeUserPendingReadings;
    }()
    /**
     * mergeUserPendingResources
     *
     * Merge together a user's pending resources. Also updates the resource.owner.createdByUserId field to the
     * new user.
     *
     * @param oldUserId
     * @param newUserId
     */

  }, {
    key: "mergeUserPendingResources",
    value: function () {
      var _mergeUserPendingResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee15(oldUserId, newUserId) {
        var _this2 = this;

        var oldResourcesResult, oldResources, saveResourcesResult;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return this.getPendingResources(this.userRef(this.orgId, oldUserId));

              case 2:
                oldResourcesResult = _context15.sent;

                if (!(oldResourcesResult.type === _AppProviderTypes.ResultType.ERROR)) {
                  _context15.next = 5;
                  break;
                }

                return _context15.abrupt("return", oldResourcesResult);

              case 5:
                oldResources = oldResourcesResult.result;
                _context15.t0 = _AppProviderTypes.summarizeResults;
                _context15.next = 9;
                return Promise.all(oldResources.map(function (r) {
                  //Update the createdByUserId
                  var owner = JSON.parse(JSON.stringify((0, _utils.safeGetNestedDefault)(r, ['owner'], {})));
                  owner.createdByUserId = newUserId;
                  return _this2.userRef(_this2.orgId, newUserId).collection('pendingResources').doc(r.id).set(_objectSpread({}, r, {
                    owner: owner
                  })).then(function () {
                    return (0, _AppProviderTypes.makeSuccess)(undefined);
                  }).catch(function (err) {
                    return (0, _AppProviderTypes.makeError)(err.message);
                  });
                }));

              case 9:
                _context15.t1 = _context15.sent;
                saveResourcesResult = (0, _context15.t0)(_context15.t1);
                return _context15.abrupt("return", saveResourcesResult);

              case 12:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function mergeUserPendingResources(_x26, _x27) {
        return _mergeUserPendingResources.apply(this, arguments);
      }

      return mergeUserPendingResources;
    }() //
    // Helpers
    // ------------------------------------

  }, {
    key: "userRef",
    value: function userRef(orgId, userId) {
      return this.firestore.collection('org').doc(orgId).collection('user').doc(userId);
    }
  }, {
    key: "getUser",
    value: function () {
      var _getUser = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee16(userRef) {
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                return _context16.abrupt("return", userRef.get().then(function (sn) {
                  var data = (0, _utils.getOrElse)(sn.data(), {}); //Set the default user data here.

                  return (0, _AppProviderTypes.makeSuccess)(_objectSpread({}, _User.DefaultUser, data));
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                }));

              case 1:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function getUser(_x28) {
        return _getUser.apply(this, arguments);
      }

      return getUser;
    }()
  }, {
    key: "getPendingReadings",
    value: function () {
      var _getPendingReadings = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee17(userRef) {
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                return _context17.abrupt("return", userRef.collection('pendingReadings').get().then(function (qs) {
                  var readings = [];
                  qs.forEach(function (sn) {
                    if (!sn.data()) {
                      return;
                    }

                    readings.push(_objectSpread({}, _model.DefaultReading, sn.data()));
                  });
                  return readings;
                }).then(function (readings) {
                  return (0, _AppProviderTypes.makeSuccess)(readings);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                }));

              case 1:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function getPendingReadings(_x29) {
        return _getPendingReadings.apply(this, arguments);
      }

      return getPendingReadings;
    }()
  }, {
    key: "getPendingResources",
    value: function () {
      var _getPendingResources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee18(userRef) {
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                return _context18.abrupt("return", userRef.collection('pendingResources').get().then(function (qs) {
                  var resources = [];
                  qs.forEach(function (sn) {
                    if (!sn.data()) {
                      return;
                    }

                    resources.push(_objectSpread({}, _Resource.DefaultMyWellResource, sn.data(), {
                      id: sn.id
                    }));
                  });
                  return resources;
                }).then(function (readings) {
                  return (0, _AppProviderTypes.makeSuccess)(readings);
                }).catch(function (err) {
                  return (0, _AppProviderTypes.makeError)(err.message);
                }));

              case 1:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function getPendingResources(_x30) {
        return _getPendingResources.apply(this, arguments);
      }

      return getPendingResources;
    }()
  }]);

  return UserApi;
}();

exports.UserApi = UserApi;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvVXNlckFwaS50cyJdLCJuYW1lcyI6WyJVc2VyQXBpIiwiZmlyZXN0b3JlIiwib3JnSWQiLCJ1c2VySWQiLCJyZXNvdXJjZSIsImdldEZhdm91cml0ZVJlc291cmNlcyIsImZhdm91cml0ZXNSZXN1bHQiLCJ0eXBlIiwiUmVzdWx0VHlwZSIsIkVSUk9SIiwiZmF2b3VyaXRlcyIsInJlc3VsdCIsImlkIiwidXBkYXRlRmF2b3VyaXRlUmVzb3VyY2VzIiwicmVzb3VyY2VzIiwiZm9yRWFjaCIsInIiLCJyZXNvdXJjZUlkcyIsImdldE5ld1Jlc291cmNlcyIsIm5ld1Jlc291cmNlc1Jlc3VsdCIsIm5ld1Jlc291cmNlcyIsInVwZGF0ZU5ld1Jlc291cmNlcyIsInJlc291cmNlSWQiLCJnZXRVc2VyIiwidXNlclJlZiIsInVzZXJSZXN1bHQiLCJ1c2VyIiwidXBkYXRlIiwidGhlbiIsInVuZGVmaW5lZCIsImNhdGNoIiwiZXJyIiwibWVzc2FnZSIsImZhdm91cml0ZVJlc291cmNlcyIsInNldCIsIm1lcmdlIiwicmVjZW50UmVzb3VyY2VzIiwic3RhdHVzIiwib2xkVXNlcklkIiwibmV3VXNlcklkIiwib2xkVXNlclJlc3VsdCIsIm5ld1VzZXJSZXN1bHQiLCJvbGRVc2VyIiwibmV3VXNlciIsIm1lcmdlVXNlclBlbmRpbmdSZWFkaW5ncyIsIm1lcmdlUGVuZGluZ1JlYWRpbmdzUmVzdWx0IiwibWVyZ2VVc2VyUGVuZGluZ1Jlc291cmNlcyIsIm1lcmdlUGVuZGluZ1Jlc291cmNlc1Jlc3VsdCIsInVzZXJUb1NhdmUiLCJwZW5kaW5nU2F2ZWRSZWFkaW5ncyIsInBlbmRpbmdTYXZlZFJlc291cmNlcyIsIkFycmF5VXRpbHMiLCJtZXJnZUFycmF5cyIsInJlY2VudFNlYXJjaGVzIiwicyIsInRyYW5zbGF0aW9uIiwiZ2V0UGVuZGluZ1JlYWRpbmdzIiwib2xkUmVhZGluZ3NSZXN1bHQiLCJvbGRSZWFkaW5ncyIsInN1bW1hcml6ZVJlc3VsdHMiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiY29sbGVjdGlvbiIsImFkZCIsInNhdmVSZWFkaW5nc1Jlc3VsdCIsImdldFBlbmRpbmdSZXNvdXJjZXMiLCJvbGRSZXNvdXJjZXNSZXN1bHQiLCJvbGRSZXNvdXJjZXMiLCJvd25lciIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsImNyZWF0ZWRCeVVzZXJJZCIsImRvYyIsInNhdmVSZXNvdXJjZXNSZXN1bHQiLCJnZXQiLCJzbiIsImRhdGEiLCJEZWZhdWx0VXNlciIsInFzIiwicmVhZGluZ3MiLCJwdXNoIiwiRGVmYXVsdFJlYWRpbmciLCJEZWZhdWx0TXlXZWxsUmVzb3VyY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFQTs7QUFLQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBSWFBLE87OztBQUlYLG1CQUFZQyxTQUFaLEVBQWtDQyxLQUFsQyxFQUFpRDtBQUFBOztBQUFBOztBQUFBOztBQUMvQyxTQUFLRCxTQUFMLEdBQWlCQSxTQUFqQjtBQUNBLFNBQUtDLEtBQUwsR0FBYUEsS0FBYjtBQUNEOzs7Ozs7OytDQUVpQ0MsTSxFQUFnQkMsUTs7Ozs7Ozt1QkFDakIsS0FBS0MscUJBQUwsQ0FBMkJGLE1BQTNCLEM7OztBQUF6QkcsZ0JBQUFBLGdCOztzQkFDRkEsZ0JBQWdCLENBQUNDLElBQWpCLEtBQTBCQyw2QkFBV0MsSzs7Ozs7aURBQ2hDSCxnQjs7O0FBRUhJLGdCQUFBQSxVLEdBQWFKLGdCQUFnQixDQUFDSyxNO0FBQ3BDRCxnQkFBQUEsVUFBVSxDQUFDTixRQUFRLENBQUNRLEVBQVYsQ0FBVixHQUEwQlIsUUFBMUI7aURBRU8sS0FBS1Msd0JBQUwsQ0FBOEJWLE1BQTlCLEVBQXNDTyxVQUF0QyxDOzs7Ozs7Ozs7Ozs7Ozs7O0FBR1Q7Ozs7Ozs7OztnREFHbUNQLE0sRUFBZ0JXLFM7Ozs7Ozs7dUJBQ2xCLEtBQUtULHFCQUFMLENBQTJCRixNQUEzQixDOzs7QUFBekJHLGdCQUFBQSxnQjs7c0JBQ0ZBLGdC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LFFBQUQ7QUFBQSx5QkFBeUIsbUNBQVlBLFFBQVosQ0FBekI7QUFBQSxpQkFmQSxFQWdCTG5ELEtBaEJLLENBZ0JDLFVBQUNDLEdBQUQ7QUFBQSx5QkFBZ0IsaUNBQXFCQSxHQUFHLENBQUNDLE9BQXpCLENBQWhCO0FBQUEsaUJBaEJELEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztpREFtQnVCUixPOzs7OzttREFDdkJBLE9BQU8sQ0FBQ3VDLFVBQVIsQ0FBbUIsa0JBQW5CLEVBQXVDYSxHQUF2QyxHQUNMaEQsSUFESyxDQUNBLFVBQUFvRCxFQUFFLEVBQUk7QUFDVixzQkFBTWxFLFNBQXFCLEdBQUcsRUFBOUI7QUFDQWtFLGtCQUFBQSxFQUFFLENBQUNqRSxPQUFILENBQVcsVUFBQThELEVBQUUsRUFBSTtBQUNmLHdCQUFJLENBQUNBLEVBQUUsQ0FBQ0MsSUFBSCxFQUFMLEVBQWdCO0FBQ2Q7QUFDRDs7QUFDRGhFLG9CQUFBQSxTQUFTLENBQUNvRSxJQUFWLG1CQUNLRSwrQkFETCxFQUVLUCxFQUFFLENBQUNDLElBQUgsRUFGTDtBQUdFbEUsc0JBQUFBLEVBQUUsRUFBRWlFLEVBQUUsQ0FBQ2pFO0FBSFQ7QUFLRCxtQkFURDtBQVVBLHlCQUFPRSxTQUFQO0FBQ0QsaUJBZEssRUFlSmMsSUFmSSxDQWVDLFVBQUNxRCxRQUFEO0FBQUEseUJBQTBCLG1DQUFZQSxRQUFaLENBQTFCO0FBQUEsaUJBZkQsRUFnQkpuRCxLQWhCSSxDQWdCRSxVQUFDQyxHQUFEO0FBQUEseUJBQWdCLGlDQUFzQkEsR0FBRyxDQUFDQyxPQUExQixDQUFoQjtBQUFBLGlCQWhCRixDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVzb3VyY2UsIERlZmF1bHRNeVdlbGxSZXNvdXJjZSB9IGZyb20gXCIuLi9tb2RlbC9SZXNvdXJjZVwiO1xuaW1wb3J0IHsgU29tZVJlc3VsdCwgUmVzdWx0VHlwZSwgbWFrZVN1Y2Nlc3MsIG1ha2VFcnJvciwgc3VtbWFyaXplUmVzdWx0cyB9IGZyb20gXCIuLi91dGlscy9BcHBQcm92aWRlclR5cGVzXCI7XG5pbXBvcnQgeyBEaWN0VHlwZSB9IGZyb20gXCIuLi91dGlscy9EaWN0VHlwZVwiO1xuaW1wb3J0IHsgVXNlciwgRGVmYXVsdFVzZXIgfSBmcm9tIFwiLi4vbW9kZWwvVXNlclwiO1xuaW1wb3J0IFVzZXJTdGF0dXMgZnJvbSBcIi4uL2VudW1zL1VzZXJTdGF0dXNcIjtcbmltcG9ydCBVc2VyVHlwZSBmcm9tIFwiLi4vZW51bXMvVXNlclR5cGVcIjtcbmltcG9ydCAqIGFzIGFkbWluICBmcm9tIFwiZmlyZWJhc2UtYWRtaW5cIjtcbmltcG9ydCB7IERvY3VtZW50UmVmZXJlbmNlIH0gZnJvbSBcIkBnb29nbGUtY2xvdWQvZmlyZXN0b3JlXCI7XG5pbXBvcnQgQXJyYXlVdGlscyBmcm9tIFwiLi4vdXRpbHMvQXJyYXlVdGlsc1wiO1xuaW1wb3J0IHsgUmVhZGluZywgRGVmYXVsdFJlYWRpbmcgfSBmcm9tIFwiLi4vbW9kZWxcIjtcbmltcG9ydCB7IHNhZmVHZXROZXN0ZWREZWZhdWx0LCBnZXRPckVsc2UgfSBmcm9tIFwiLi4vdXRpbHNcIjtcblxudHlwZSBGaXJlc3RvcmUgPSBhZG1pbi5maXJlc3RvcmUuRmlyZXN0b3JlO1xuXG5leHBvcnQgY2xhc3MgVXNlckFwaSB7XG4gIGZpcmVzdG9yZTogRmlyZXN0b3JlO1xuICBvcmdJZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGZpcmVzdG9yZTogRmlyZXN0b3JlLCBvcmdJZDogc3RyaW5nKSB7XG4gICAgdGhpcy5maXJlc3RvcmUgPSBmaXJlc3RvcmU7XG4gICAgdGhpcy5vcmdJZCA9IG9yZ0lkO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGFkZEZhdm91cml0ZVJlc291cmNlKHVzZXJJZDogc3RyaW5nLCByZXNvdXJjZTogUmVzb3VyY2UpOiBQcm9taXNlPFNvbWVSZXN1bHQ8dm9pZD4+IHtcbiAgICBjb25zdCBmYXZvdXJpdGVzUmVzdWx0ID0gYXdhaXQgdGhpcy5nZXRGYXZvdXJpdGVSZXNvdXJjZXModXNlcklkKTtcbiAgICBpZiAoZmF2b3VyaXRlc1Jlc3VsdC50eXBlID09PSBSZXN1bHRUeXBlLkVSUk9SKSB7XG4gICAgICByZXR1cm4gZmF2b3VyaXRlc1Jlc3VsdDtcbiAgICB9XG4gICAgY29uc3QgZmF2b3VyaXRlcyA9IGZhdm91cml0ZXNSZXN1bHQucmVzdWx0O1xuICAgIGZhdm91cml0ZXNbcmVzb3VyY2UuaWRdID0gcmVzb3VyY2U7XG5cbiAgICByZXR1cm4gdGhpcy51cGRhdGVGYXZvdXJpdGVSZXNvdXJjZXModXNlcklkLCBmYXZvdXJpdGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0IG9mIGZhdm91cml0ZSByZXNvdXJjZXMgdG8gdGhlIHVzZXIncyBmYXZvdXJpdGVzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgYWRkRmF2b3VyaXRlUmVzb3VyY2VzKHVzZXJJZDogc3RyaW5nLCByZXNvdXJjZXM6IFJlc291cmNlW10pOiBQcm9taXNlPFNvbWVSZXN1bHQ8dm9pZD4+IHtcbiAgICBjb25zdCBmYXZvdXJpdGVzUmVzdWx0ID0gYXdhaXQgdGhpcy5nZXRGYXZvdXJpdGVSZXNvdXJjZXModXNlcklkKTtcbiAgICBpZiAoZmF2b3VyaXRlc1Jlc3VsdC50eXBlID09PSBSZXN1bHRUeXBlLkVSUk9SKSB7XG4gICAgICByZXR1cm4gZmF2b3VyaXRlc1Jlc3VsdDtcbiAgICB9XG4gICAgY29uc3QgZmF2b3VyaXRlcyA9IGZhdm91cml0ZXNSZXN1bHQucmVzdWx0O1xuICAgIHJlc291cmNlcy5mb3JFYWNoKHIgPT4ge1xuICAgICAgZmF2b3VyaXRlc1tyLmlkXSA9IHI7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy51cGRhdGVGYXZvdXJpdGVSZXNvdXJjZXModXNlcklkLCBmYXZvdXJpdGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgbmV3IHJlc291cmNlcyB0byB0aGUgVXNlcidzIG9iamVjdC5cbiAgICovXG4gIHB1YmxpYyBhc3luYyBtYXJrQXNOZXdSZXNvdXJjZXModXNlcklkOiBzdHJpbmcsIHJlc291cmNlSWRzOiBzdHJpbmdbXSk6IFByb21pc2U8U29tZVJlc3VsdDx2b2lkPj4ge1xuICAgIGNvbnN0IG5ld1Jlc291cmNlc1Jlc3VsdCA9IGF3YWl0IHRoaXMuZ2V0TmV3UmVzb3VyY2VzKHVzZXJJZCk7XG4gICAgaWYgKG5ld1Jlc291cmNlc1Jlc3VsdC50eXBlID09PSBSZXN1bHRUeXBlLkVSUk9SKSB7XG4gICAgICByZXR1cm4gbmV3UmVzb3VyY2VzUmVzdWx0O1xuICAgIH1cbiAgICBjb25zdCBuZXdSZXNvdXJjZXMgPSBuZXdSZXNvdXJjZXNSZXN1bHQucmVzdWx0O1xuICAgIHJlc291cmNlSWRzLmZvckVhY2goaWQgPT4gbmV3UmVzb3VyY2VzW2lkXSA9IGlkKTtcblxuICAgIHJldHVybiB0aGlzLnVwZGF0ZU5ld1Jlc291cmNlcyh1c2VySWQsIG5ld1Jlc291cmNlcyk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcmVtb3ZlTmV3UmVzb3VyY2UodXNlcklkOiBzdHJpbmcsIHJlc291cmNlSWQ6IHN0cmluZyk6IFByb21pc2U8U29tZVJlc3VsdDx2b2lkPj4ge1xuICAgIGNvbnN0IG5ld1Jlc291cmNlc1Jlc3VsdCA9IGF3YWl0IHRoaXMuZ2V0TmV3UmVzb3VyY2VzKHVzZXJJZCk7XG4gICAgaWYgKG5ld1Jlc291cmNlc1Jlc3VsdC50eXBlID09PSBSZXN1bHRUeXBlLkVSUk9SKSB7XG4gICAgICByZXR1cm4gbmV3UmVzb3VyY2VzUmVzdWx0O1xuICAgIH1cbiAgICBjb25zdCBuZXdSZXNvdXJjZXMgPSBuZXdSZXNvdXJjZXNSZXN1bHQucmVzdWx0O1xuICAgIGRlbGV0ZSBuZXdSZXNvdXJjZXNbcmVzb3VyY2VJZF07XG5cbiAgICByZXR1cm4gdGhpcy51cGRhdGVOZXdSZXNvdXJjZXModXNlcklkLCBuZXdSZXNvdXJjZXMpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldE5ld1Jlc291cmNlcyh1c2VySWQ6IHN0cmluZyk6IFByb21pc2U8U29tZVJlc3VsdDxEaWN0VHlwZTxzdHJpbmc+Pj4ge1xuICAgIGNvbnN0IHVzZXJSZXN1bHQgPSBhd2FpdCB0aGlzLmdldFVzZXIodGhpcy51c2VyUmVmKHRoaXMub3JnSWQsIHVzZXJJZCkpO1xuICAgIGlmICh1c2VyUmVzdWx0LnR5cGUgPT09IFJlc3VsdFR5cGUuRVJST1IpIHtcbiAgICAgIHJldHVybiB1c2VyUmVzdWx0O1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXIgPSB1c2VyUmVzdWx0LnJlc3VsdDtcbiAgICByZXR1cm4gbWFrZVN1Y2Nlc3ModXNlci5uZXdSZXNvdXJjZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB1cGRhdGVOZXdSZXNvdXJjZXModXNlcklkOiBzdHJpbmcsIG5ld1Jlc291cmNlczogRGljdFR5cGU8c3RyaW5nPik6IFByb21pc2U8U29tZVJlc3VsdDx2b2lkPj4ge1xuICAgIHJldHVybiB0aGlzLnVzZXJSZWYodGhpcy5vcmdJZCwgdXNlcklkKS51cGRhdGUoeyBuZXdSZXNvdXJjZXMgfSlcbiAgICAgIC50aGVuKCgpID0+IG1ha2VTdWNjZXNzKHVuZGVmaW5lZCkpXG4gICAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcihlcnIubWVzc2FnZSkpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcmVtb3ZlRmF2b3VyaXRlUmVzb3VyY2UodXNlcklkOiBzdHJpbmcsIHJlc291cmNlSWQ6IHN0cmluZyk6IFByb21pc2U8U29tZVJlc3VsdDx2b2lkPj4ge1xuICAgIGNvbnN0IGZhdm91cml0ZXNSZXN1bHQgPSBhd2FpdCB0aGlzLmdldEZhdm91cml0ZVJlc291cmNlcyh1c2VySWQpO1xuICAgIGlmIChmYXZvdXJpdGVzUmVzdWx0LnR5cGUgPT09IFJlc3VsdFR5cGUuRVJST1IpIHtcbiAgICAgIHJldHVybiBmYXZvdXJpdGVzUmVzdWx0O1xuICAgIH1cbiAgICBjb25zdCBmYXZvdXJpdGVzID0gZmF2b3VyaXRlc1Jlc3VsdC5yZXN1bHQ7XG4gICAgZGVsZXRlIGZhdm91cml0ZXNbcmVzb3VyY2VJZF07XG5cbiAgICByZXR1cm4gdGhpcy51cGRhdGVGYXZvdXJpdGVSZXNvdXJjZXModXNlcklkLCBmYXZvdXJpdGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdXBkYXRlRmF2b3VyaXRlUmVzb3VyY2VzKHVzZXJJZDogc3RyaW5nLCBmYXZvdXJpdGVSZXNvdXJjZXM6IERpY3RUeXBlPFJlc291cmNlPik6IFByb21pc2U8U29tZVJlc3VsdDxhbnk+PiB7XG4gICAgcmV0dXJuIHRoaXMudXNlclJlZih0aGlzLm9yZ0lkLCB1c2VySWQpLnNldCh7IGZhdm91cml0ZVJlc291cmNlcyB9LCB7IG1lcmdlOiB0cnVlIH0pXG4gICAgICAudGhlbigoKSA9PiBtYWtlU3VjY2Vzcyh1bmRlZmluZWQpKVxuICAgICAgLmNhdGNoKChlcnI6IEVycm9yKSA9PiBtYWtlRXJyb3IoZXJyLm1lc3NhZ2UpKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEZhdm91cml0ZVJlc291cmNlcyh1c2VySWQ6IHN0cmluZyk6IFByb21pc2U8U29tZVJlc3VsdDxEaWN0VHlwZTxSZXNvdXJjZT4+PiB7XG4gICAgY29uc3QgdXNlclJlc3VsdCA9IGF3YWl0IHRoaXMuZ2V0VXNlcih0aGlzLnVzZXJSZWYodGhpcy5vcmdJZCwgdXNlcklkKSk7XG4gICAgaWYgKHVzZXJSZXN1bHQudHlwZSA9PT0gUmVzdWx0VHlwZS5FUlJPUikge1xuICAgICAgcmV0dXJuIHVzZXJSZXN1bHQ7XG4gICAgfVxuXG4gICAgY29uc3QgdXNlciA9IHVzZXJSZXN1bHQucmVzdWx0O1xuICAgIHJldHVybiBtYWtlU3VjY2Vzcyh1c2VyLmZhdm91cml0ZVJlc291cmNlcyk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0UmVjZW50UmVzb3VyY2VzKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxTb21lUmVzdWx0PFJlc291cmNlW10+PiB7XG4gICAgY29uc3QgdXNlclJlc3VsdCA9IGF3YWl0IHRoaXMuZ2V0VXNlcih0aGlzLnVzZXJSZWYodGhpcy5vcmdJZCwgdXNlcklkKSk7XG4gICAgaWYgKHVzZXJSZXN1bHQudHlwZSA9PT0gUmVzdWx0VHlwZS5FUlJPUikge1xuICAgICAgcmV0dXJuIHVzZXJSZXN1bHQ7XG4gICAgfVxuXG4gICAgY29uc3QgdXNlciA9IHVzZXJSZXN1bHQucmVzdWx0O1xuICAgIHJldHVybiBtYWtlU3VjY2Vzcyh1c2VyLnJlY2VudFJlc291cmNlcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSB1c2VyJ3Mgc3RhdHVzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY2hhbmdlVXNlclN0YXR1cyh1c2VySWQ6IHN0cmluZywgc3RhdHVzOiBVc2VyU3RhdHVzLkFwcHJvdmVkIHwgVXNlclN0YXR1cy5SZWplY3RlZCk6IFByb21pc2U8U29tZVJlc3VsdDx2b2lkPj4ge1xuICAgIHJldHVybiB0aGlzLnVzZXJSZWYodGhpcy5vcmdJZCwgdXNlcklkKS5zZXQoeyBzdGF0dXMgfSwgeyBtZXJnZTogdHJ1ZSB9KVxuICAgICAgLnRoZW4oKCkgPT4gbWFrZVN1Y2Nlc3ModW5kZWZpbmVkKSlcbiAgICAgIC5jYXRjaCgoZXJyOiBFcnJvcikgPT4gbWFrZUVycm9yKGVyci5tZXNzYWdlKSlcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjaGFuZ2VVc2VyVHlwZSh1c2VySWQ6IHN0cmluZywgdHlwZTogVXNlclR5cGUpOiBQcm9taXNlPFNvbWVSZXN1bHQ8dm9pZD4+IHtcbiAgICByZXR1cm4gdGhpcy51c2VyUmVmKHRoaXMub3JnSWQsIHVzZXJJZCkuc2V0KHt0eXBlfSwgeyBtZXJnZTogdHJ1ZX0pXG4gICAgLnRoZW4oKCkgPT4gbWFrZVN1Y2Nlc3ModW5kZWZpbmVkKSlcbiAgfVxuXG5cbiAgLyoqXG4gICAqIG1lcmdlVXNlcnNcbiAgICogXG4gICAqIE1lcmdlIHR3byB1c2VyIGFjY291bnRzIHRvZ2V0aGVyLiBJbmNsdWRlcyBtZXJnaW5nIHN1YmNvbGxlY3Rpb25zXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgbWVyZ2VVc2VycyhvbGRVc2VySWQ6IHN0cmluZywgbmV3VXNlcklkOiBzdHJpbmcpOiBQcm9taXNlPFNvbWVSZXN1bHQ8YW55Pj4ge1xuXG4gICAgY29uc3Qgb2xkVXNlclJlc3VsdCA9IGF3YWl0IHRoaXMuZ2V0VXNlcih0aGlzLnVzZXJSZWYodGhpcy5vcmdJZCwgb2xkVXNlcklkKSk7XG4gICAgaWYgKG9sZFVzZXJSZXN1bHQudHlwZSA9PT0gUmVzdWx0VHlwZS5FUlJPUikge1xuICAgICAgcmV0dXJuIG9sZFVzZXJSZXN1bHQ7XG4gICAgfVxuICAgIGNvbnN0IG5ld1VzZXJSZXN1bHQgPSBhd2FpdCB0aGlzLmdldFVzZXIodGhpcy51c2VyUmVmKHRoaXMub3JnSWQsIG5ld1VzZXJJZCkpO1xuICAgIGlmIChuZXdVc2VyUmVzdWx0LnR5cGUgPT09IFJlc3VsdFR5cGUuRVJST1IpIHtcbiAgICAgIHJldHVybiBvbGRVc2VyUmVzdWx0O1xuICAgIH1cbiAgICBjb25zdCBvbGRVc2VyID0gb2xkVXNlclJlc3VsdC5yZXN1bHQ7XG4gICAgY29uc3QgbmV3VXNlciA9IG5ld1VzZXJSZXN1bHQucmVzdWx0O1xuXG4gICAgY29uc3QgbWVyZ2VQZW5kaW5nUmVhZGluZ3NSZXN1bHQgPSBhd2FpdCB0aGlzLm1lcmdlVXNlclBlbmRpbmdSZWFkaW5ncyhvbGRVc2VySWQsIG5ld1VzZXJJZCk7XG4gICAgaWYgKG1lcmdlUGVuZGluZ1JlYWRpbmdzUmVzdWx0LnR5cGUgPT09IFJlc3VsdFR5cGUuRVJST1IpIHtcbiAgICAgIHJldHVybiBtZXJnZVBlbmRpbmdSZWFkaW5nc1Jlc3VsdDtcbiAgICB9XG5cbiAgICBjb25zdCBtZXJnZVBlbmRpbmdSZXNvdXJjZXNSZXN1bHQgPSBhd2FpdCB0aGlzLm1lcmdlVXNlclBlbmRpbmdSZXNvdXJjZXMob2xkVXNlcklkLCBuZXdVc2VySWQpO1xuICAgIGlmIChtZXJnZVBlbmRpbmdSZXNvdXJjZXNSZXN1bHQudHlwZSA9PT0gUmVzdWx0VHlwZS5FUlJPUikge1xuICAgICAgcmV0dXJuIG1lcmdlUGVuZGluZ1Jlc291cmNlc1Jlc3VsdDtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VyVG9TYXZlOiBVc2VyID0ge1xuICAgICAgaWQ6IG5ld1VzZXIuaWQsXG4gICAgICBmYXZvdXJpdGVSZXNvdXJjZXM6IHsuLi5vbGRVc2VyLmZhdm91cml0ZVJlc291cmNlcywgLi4ubmV3VXNlci5mYXZvdXJpdGVSZXNvdXJjZXN9LFxuICAgICAgbmV3UmVzb3VyY2VzOiB7Li4ub2xkVXNlci5uZXdSZXNvdXJjZXMsIC4uLm5ld1VzZXIubmV3UmVzb3VyY2VzfSxcbiAgICAgIHBlbmRpbmdTYXZlZFJlYWRpbmdzOiBbXSwgLy90aGlzIGlzIGEgc3ViY29sbGVjdGlvblxuICAgICAgcGVuZGluZ1NhdmVkUmVzb3VyY2VzOiBbXSwgLy90aGlzIGlzIGEgc3ViY29sbGVjdGlvblxuICAgICAgcmVjZW50UmVzb3VyY2VzOiBBcnJheVV0aWxzLm1lcmdlQXJyYXlzPFJlc291cmNlPihvbGRVc2VyLnJlY2VudFJlc291cmNlcywgbmV3VXNlci5yZWNlbnRSZXNvdXJjZXMsIChyKSA9PiByLmlkKSxcbiAgICAgIHJlY2VudFNlYXJjaGVzOiBBcnJheVV0aWxzLm1lcmdlQXJyYXlzPHN0cmluZz4ob2xkVXNlci5yZWNlbnRTZWFyY2hlcywgbmV3VXNlci5yZWNlbnRTZWFyY2hlcywgKHM6IHN0cmluZykgPT4gcyksXG4gICAgICBzdGF0dXM6IG5ld1VzZXIuc3RhdHVzLFxuICAgICAgdHJhbnNsYXRpb246IG5ld1VzZXIudHJhbnNsYXRpb24sXG4gICAgICB0eXBlOiBuZXdVc2VyLnR5cGVcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMudXNlclJlZih0aGlzLm9yZ0lkLCBuZXdVc2VySWQpLnNldCh1c2VyVG9TYXZlLCB7IG1lcmdlOiB0cnVlIH0pXG4gICAgLnRoZW4oKCkgPT4gbWFrZVN1Y2Nlc3ModW5kZWZpbmVkKSlcbiAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcihlcnIubWVzc2FnZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIG1lcmdlVXNlclBlbmRpbmdSZWFkaW5nc1xuICAgKiBcbiAgICogTWVyZ2UgdG9nZXRoZXIgYSB1c2VyJ3MgcGVuZGluZyByZWFkaW5nc1xuICAgKiBcbiAgICogQHBhcmFtIG9sZFVzZXJJZCBcbiAgICogQHBhcmFtIG5ld1VzZXJJZCBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBtZXJnZVVzZXJQZW5kaW5nUmVhZGluZ3Mob2xkVXNlcklkOiBzdHJpbmcsIG5ld1VzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxTb21lUmVzdWx0PGFueT4+IHtcbiAgICBjb25zdCBvbGRSZWFkaW5nc1Jlc3VsdCA9IGF3YWl0IHRoaXMuZ2V0UGVuZGluZ1JlYWRpbmdzKHRoaXMudXNlclJlZih0aGlzLm9yZ0lkLCBvbGRVc2VySWQpKTtcbiAgICBpZiAob2xkUmVhZGluZ3NSZXN1bHQudHlwZSA9PT0gUmVzdWx0VHlwZS5FUlJPUikge1xuICAgICAgcmV0dXJuIG9sZFJlYWRpbmdzUmVzdWx0O1xuICAgIH1cblxuICAgIGNvbnN0IG9sZFJlYWRpbmdzID0gb2xkUmVhZGluZ3NSZXN1bHQucmVzdWx0O1xuICAgIC8vd2UgZG9uJ3QgY2FyZSBhYm91dCB0aGUgZG9jIGlkIGhlcmUuLi5cbiAgICBjb25zdCBzYXZlUmVhZGluZ3NSZXN1bHQgPSBzdW1tYXJpemVSZXN1bHRzKGF3YWl0IFByb21pc2UuYWxsKG9sZFJlYWRpbmdzLm1hcChyID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnVzZXJSZWYodGhpcy5vcmdJZCwgbmV3VXNlcklkKS5jb2xsZWN0aW9uKCdwZW5kaW5nUmVhZGluZ3MnKS5hZGQocilcbiAgICAgIC50aGVuKCgpID0+IG1ha2VTdWNjZXNzPHZvaWQ+KHVuZGVmaW5lZCkpXG4gICAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcjx2b2lkPihlcnIubWVzc2FnZSkpO1xuICAgIH0pKSk7XG5cbiAgICByZXR1cm4gc2F2ZVJlYWRpbmdzUmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIG1lcmdlVXNlclBlbmRpbmdSZXNvdXJjZXNcbiAgICpcbiAgICogTWVyZ2UgdG9nZXRoZXIgYSB1c2VyJ3MgcGVuZGluZyByZXNvdXJjZXMuIEFsc28gdXBkYXRlcyB0aGUgcmVzb3VyY2Uub3duZXIuY3JlYXRlZEJ5VXNlcklkIGZpZWxkIHRvIHRoZVxuICAgKiBuZXcgdXNlci5cbiAgICpcbiAgICogQHBhcmFtIG9sZFVzZXJJZFxuICAgKiBAcGFyYW0gbmV3VXNlcklkXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgbWVyZ2VVc2VyUGVuZGluZ1Jlc291cmNlcyhvbGRVc2VySWQ6IHN0cmluZywgbmV3VXNlcklkOiBzdHJpbmcpOiBQcm9taXNlPFNvbWVSZXN1bHQ8YW55Pj4ge1xuICAgIGNvbnN0IG9sZFJlc291cmNlc1Jlc3VsdCA9IGF3YWl0IHRoaXMuZ2V0UGVuZGluZ1Jlc291cmNlcyh0aGlzLnVzZXJSZWYodGhpcy5vcmdJZCwgb2xkVXNlcklkKSk7XG4gICAgaWYgKG9sZFJlc291cmNlc1Jlc3VsdC50eXBlID09PSBSZXN1bHRUeXBlLkVSUk9SKSB7XG4gICAgICByZXR1cm4gb2xkUmVzb3VyY2VzUmVzdWx0O1xuICAgIH1cblxuICAgIGNvbnN0IG9sZFJlc291cmNlcyA9IG9sZFJlc291cmNlc1Jlc3VsdC5yZXN1bHQ7XG4gICAgY29uc3Qgc2F2ZVJlc291cmNlc1Jlc3VsdCA9IHN1bW1hcml6ZVJlc3VsdHMoYXdhaXQgUHJvbWlzZS5hbGwob2xkUmVzb3VyY2VzLm1hcChyID0+IHtcblxuICAgICAgLy9VcGRhdGUgdGhlIGNyZWF0ZWRCeVVzZXJJZFxuICAgICAgLy9UT0RPOiBURDogZm9yIHNvbWUgcmVhc29uIHdlIG5lZWQgdG8gY2xvbmUgaGVyZSBmb3IgdGVzdHMgdG8gcGFzcy4uLiBub3Qgc3VyZSB3aHkuXG4gICAgICBjb25zdCBvd25lcjogRGljdFR5cGU8c3RyaW5nPiA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2FmZUdldE5lc3RlZERlZmF1bHQociwgWydvd25lciddLCB7fSkpKTtcbiAgICAgIG93bmVyLmNyZWF0ZWRCeVVzZXJJZCA9IG5ld1VzZXJJZDtcblxuICAgICAgcmV0dXJuIHRoaXMudXNlclJlZih0aGlzLm9yZ0lkLCBuZXdVc2VySWQpLmNvbGxlY3Rpb24oJ3BlbmRpbmdSZXNvdXJjZXMnKS5kb2Moci5pZCkuc2V0KHtcbiAgICAgICAgLi4ucixcbiAgICAgICAgb3duZXIsXG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4gbWFrZVN1Y2Nlc3M8dm9pZD4odW5kZWZpbmVkKSlcbiAgICAgIC5jYXRjaCgoZXJyOiBFcnJvcikgPT4gbWFrZUVycm9yPHZvaWQ+KGVyci5tZXNzYWdlKSk7XG4gICAgfSkpKTtcblxuICAgIHJldHVybiBzYXZlUmVzb3VyY2VzUmVzdWx0O1xuICB9XG4gICAgICAgICAgIFxuICAvL1xuICAvLyBIZWxwZXJzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHB1YmxpYyB1c2VyUmVmKG9yZ0lkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKTogRG9jdW1lbnRSZWZlcmVuY2Uge1xuICAgIHJldHVybiB0aGlzLmZpcmVzdG9yZS5jb2xsZWN0aW9uKCdvcmcnKS5kb2Mob3JnSWQpLmNvbGxlY3Rpb24oJ3VzZXInKS5kb2ModXNlcklkKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRVc2VyKHVzZXJSZWY6IERvY3VtZW50UmVmZXJlbmNlKTogUHJvbWlzZTxTb21lUmVzdWx0PFVzZXI+PiB7XG4gICAgcmV0dXJuIHVzZXJSZWYuZ2V0KClcbiAgICAudGhlbihzbiA9PiB7XG4gICAgICBsZXQgZGF0YSA9IGdldE9yRWxzZShzbi5kYXRhKCksIHt9KTtcblxuICAgICAgLy9TZXQgdGhlIGRlZmF1bHQgdXNlciBkYXRhIGhlcmUuXG4gICAgICByZXR1cm4gbWFrZVN1Y2Nlc3Moe1xuICAgICAgICAuLi5EZWZhdWx0VXNlcixcbiAgICAgICAgLi4uZGF0YVxuICAgICAgfSk7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcjxVc2VyPihlcnIubWVzc2FnZSkpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0UGVuZGluZ1JlYWRpbmdzKHVzZXJSZWY6IERvY3VtZW50UmVmZXJlbmNlKTogUHJvbWlzZTxTb21lUmVzdWx0PFJlYWRpbmdbXT4+IHtcbiAgICAgcmV0dXJuIHVzZXJSZWYuY29sbGVjdGlvbigncGVuZGluZ1JlYWRpbmdzJykuZ2V0KClcbiAgICAgIC50aGVuKHFzID0+IHtcbiAgICAgICAgY29uc3QgcmVhZGluZ3M6IFJlYWRpbmdbXSA9IFtdO1xuICAgICAgICBxcy5mb3JFYWNoKHNuID0+IHtcbiAgICAgICAgICBpZiAoIXNuLmRhdGEoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWFkaW5ncy5wdXNoKHtcbiAgICAgICAgICAgIC4uLkRlZmF1bHRSZWFkaW5nLFxuICAgICAgICAgICAgLi4uc24uZGF0YSgpLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlYWRpbmdzO1xuXG4gICAgICB9KVxuICAgICAgLnRoZW4oKHJlYWRpbmdzOiBSZWFkaW5nW10pID0+IG1ha2VTdWNjZXNzKHJlYWRpbmdzKSlcbiAgICAgIC5jYXRjaCgoZXJyOiBFcnJvcikgPT4gbWFrZUVycm9yPFJlYWRpbmdbXT4oZXJyLm1lc3NhZ2UpKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldFBlbmRpbmdSZXNvdXJjZXModXNlclJlZjogRG9jdW1lbnRSZWZlcmVuY2UpOiBQcm9taXNlPFNvbWVSZXN1bHQ8UmVzb3VyY2VbXT4+IHtcbiAgICAgcmV0dXJuIHVzZXJSZWYuY29sbGVjdGlvbigncGVuZGluZ1Jlc291cmNlcycpLmdldCgpXG4gICAgICAudGhlbihxcyA9PiB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlczogUmVzb3VyY2VbXSA9IFtdO1xuICAgICAgICBxcy5mb3JFYWNoKHNuID0+IHtcbiAgICAgICAgICBpZiAoIXNuLmRhdGEoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvdXJjZXMucHVzaCh7XG4gICAgICAgICAgICAuLi5EZWZhdWx0TXlXZWxsUmVzb3VyY2UsXG4gICAgICAgICAgICAuLi5zbi5kYXRhKCksXG4gICAgICAgICAgICBpZDogc24uaWQsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzb3VyY2VzO1xuICAgICAgfSlcbiAgICAgICAudGhlbigocmVhZGluZ3M6IFJlc291cmNlW10pID0+IG1ha2VTdWNjZXNzKHJlYWRpbmdzKSlcbiAgICAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IG1ha2VFcnJvcjxSZXNvdXJjZVtdPihlcnIubWVzc2FnZSkpXG4gIH1cblxufSJdfQ==