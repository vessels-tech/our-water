"use strict";

require("mocha");

var assert = _interopRequireWildcard(require("assert"));

var _UserApi = require("./UserApi");

var _mockCloudFirestore = _interopRequireDefault(require("mock-cloud-firestore"));

var _User = require("../model/User");

var _Resource = require("../model/Resource");

var _AppProviderTypes = require("../utils/AppProviderTypes");

var _UserStatus = _interopRequireDefault(require("../enums/UserStatus"));

var _UserType = _interopRequireDefault(require("../enums/UserType"));

var _model = require("../model");

var _utils = require("../utils");

var _ow_translations = require("ow_translations");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../test/testConfig.json'),
    orgId = _require.orgId;

var defaultResource = {
  type: _Resource.ResourceType.Any,
  id: 'resource_1',
  coords: {
    latitude: 12,
    longitude: 13
  },
  timeseries: {}
};
describe('User Api', function () {
  describe('favourites',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    var firestore, userApi, userId;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            firestore = new _mockCloudFirestore.default({}).firestore();
            userApi = new _UserApi.UserApi(firestore, orgId);
            userId = 'user_id_1';
            this.beforeEach(
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee() {
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return userApi.userRef(orgId, userId).set(_User.DefaultUser);

                    case 2:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee, this);
            })));
            it('addFavouriteResource adds a favourite resource',
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee2() {
              var addFavResult, favouriteResources;
              return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return userApi.addFavouriteResource(userId, defaultResource);

                    case 2:
                      addFavResult = _context2.sent;
                      (0, _AppProviderTypes.unsafeUnwrap)(addFavResult);
                      _context2.t0 = _AppProviderTypes.unsafeUnwrap;
                      _context2.next = 7;
                      return userApi.getFavouriteResources(userId);

                    case 7:
                      _context2.t1 = _context2.sent;
                      favouriteResources = (0, _context2.t0)(_context2.t1);
                      //Assert
                      assert.deepEqual({
                        resource_1: defaultResource
                      }, favouriteResources);

                    case 10:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2, this);
            })));
            it('removeFavouriteResource removes a favourite resource',
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee3() {
              var addFavResult, removeFavResult, favouriteResources;
              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      _context3.next = 2;
                      return userApi.addFavouriteResource(userId, defaultResource);

                    case 2:
                      addFavResult = _context3.sent;
                      (0, _AppProviderTypes.unsafeUnwrap)(addFavResult); //Act

                      _context3.next = 6;
                      return userApi.removeFavouriteResource(userId, defaultResource.id);

                    case 6:
                      removeFavResult = _context3.sent;
                      (0, _AppProviderTypes.unsafeUnwrap)(removeFavResult);
                      _context3.t0 = _AppProviderTypes.unsafeUnwrap;
                      _context3.next = 11;
                      return userApi.getFavouriteResources(userId);

                    case 11:
                      _context3.t1 = _context3.sent;
                      favouriteResources = (0, _context3.t0)(_context3.t1);
                      //Assert
                      assert.deepEqual(favouriteResources, {});

                    case 14:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, _callee3, this);
            })));
            this.afterEach(
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee4() {
              return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      _context4.next = 2;
                      return userApi.userRef(orgId, userId).delete();

                    case 2:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4, this);
            })));

          case 7:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  })));
  describe('recents', function () {
    var firestore = new _mockCloudFirestore.default({}).firestore();
    var userApi = new _UserApi.UserApi(firestore, orgId);
    var userId = 'user_id_1';
    var expectedResources = [_objectSpread({}, defaultResource, {
      id: '1'
    }), _objectSpread({}, defaultResource, {
      id: '2'
    }), _objectSpread({}, defaultResource, {
      id: '3'
    })];
    this.beforeEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6() {
      var defaultUser;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              defaultUser = _objectSpread({}, _User.DefaultUser, {
                recentResources: expectedResources
              });
              _context6.next = 3;
              return userApi.userRef(orgId, userId).set(defaultUser);

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    })));
    it('getRecentResources gets the most recent resources',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee7() {
      var actual;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.t0 = _AppProviderTypes.unsafeUnwrap;
              _context7.next = 3;
              return userApi.getRecentResources(userId);

            case 3:
              _context7.t1 = _context7.sent;
              actual = (0, _context7.t0)(_context7.t1);
              //Assert
              assert.deepEqual(actual, expectedResources);

            case 6:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    })));
    this.afterEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee8() {
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return userApi.userRef(orgId, userId).delete();

            case 2:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    })));
  });
  describe('changeUserStatus', function () {
    var firestore = new _mockCloudFirestore.default({}).firestore();
    var userApi = new _UserApi.UserApi(firestore, orgId);
    var userId = 'user_id_1';
    this.beforeEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee9() {
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return userApi.userRef(orgId, userId).set(_User.DefaultUser);

            case 2:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    })));
    it('approves a user',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee10() {
      var expected, user, actual;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              //Arrange
              expected = _UserStatus.default.Approved; //Act

              _context10.t0 = _AppProviderTypes.unsafeUnwrap;
              _context10.next = 4;
              return userApi.changeUserStatus(userId, _UserStatus.default.Approved);

            case 4:
              _context10.t1 = _context10.sent;
              (0, _context10.t0)(_context10.t1);
              _context10.t2 = _AppProviderTypes.unsafeUnwrap;
              _context10.next = 9;
              return userApi.getUser(userApi.userRef(orgId, userId));

            case 9:
              _context10.t3 = _context10.sent;
              user = (0, _context10.t2)(_context10.t3);
              actual = user.status; //Assert

              assert.equal(actual, expected);

            case 13:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    })));
    it('rejects a user',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee11() {
      var expected, user, actual;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              //Arrange
              expected = _UserStatus.default.Rejected; //Act

              _context11.t0 = _AppProviderTypes.unsafeUnwrap;
              _context11.next = 4;
              return userApi.changeUserStatus(userId, _UserStatus.default.Rejected);

            case 4:
              _context11.t1 = _context11.sent;
              (0, _context11.t0)(_context11.t1);
              _context11.t2 = _AppProviderTypes.unsafeUnwrap;
              _context11.next = 9;
              return userApi.getUser(userApi.userRef(orgId, userId));

            case 9:
              _context11.t3 = _context11.sent;
              user = (0, _context11.t2)(_context11.t3);
              actual = user.status; //Assert

              assert.equal(actual, expected);

            case 13:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    })));
    this.afterEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee12() {
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return userApi.userRef(orgId, userId).delete();

            case 2:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12, this);
    })));
  });
  describe('change user type', function () {
    var firestore = new _mockCloudFirestore.default({}).firestore();
    var userApi = new _UserApi.UserApi(firestore, orgId);
    var userId = 'user_id_1';
    this.beforeEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee13() {
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return userApi.userRef(orgId, userId).set(_User.DefaultUser);

            case 2:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, this);
    })));
    it('elevates a user to Admin',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee14() {
      var expected, user, actual;
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              //Arrange
              expected = _UserType.default.Admin; //Act

              _context14.t0 = _AppProviderTypes.unsafeUnwrap;
              _context14.next = 4;
              return userApi.changeUserType(userId, expected);

            case 4:
              _context14.t1 = _context14.sent;
              (0, _context14.t0)(_context14.t1);
              _context14.t2 = _AppProviderTypes.unsafeUnwrap;
              _context14.next = 9;
              return userApi.getUser(userApi.userRef(orgId, userId));

            case 9:
              _context14.t3 = _context14.sent;
              user = (0, _context14.t2)(_context14.t3);
              actual = user.type; //Assert

              assert.equal(actual, expected);

            case 13:
            case "end":
              return _context14.stop();
          }
        }
      }, _callee14, this);
    })));
    it('demotes a user to User',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee15() {
      var expected, user, actual;
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              //Arrange
              expected = _UserType.default.User;
              _context15.t0 = _AppProviderTypes.unsafeUnwrap;
              _context15.next = 4;
              return userApi.changeUserType(userId, _UserType.default.Admin);

            case 4:
              _context15.t1 = _context15.sent;
              (0, _context15.t0)(_context15.t1);
              _context15.t2 = _AppProviderTypes.unsafeUnwrap;
              _context15.next = 9;
              return userApi.changeUserType(userId, _UserType.default.User);

            case 9:
              _context15.t3 = _context15.sent;
              (0, _context15.t2)(_context15.t3);
              _context15.t4 = _AppProviderTypes.unsafeUnwrap;
              _context15.next = 14;
              return userApi.getUser(userApi.userRef(orgId, userId));

            case 14:
              _context15.t5 = _context15.sent;
              user = (0, _context15.t4)(_context15.t5);
              actual = user.type;
              assert.equal(actual, expected);

            case 18:
            case "end":
              return _context15.stop();
          }
        }
      }, _callee15, this);
    })));
    this.afterEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee16() {
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return userApi.userRef(orgId, userId).delete();

            case 2:
            case "end":
              return _context16.stop();
          }
        }
      }, _callee16, this);
    })));
  });
  describe('new resource add/delete', function () {
    this.timeout(5000);
    var firestore = new _mockCloudFirestore.default({}).firestore();
    var userApi = new _UserApi.UserApi(firestore, orgId);
    var userId = 'user_id_1';
    this.beforeEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee17() {
      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return userApi.userRef(orgId, userId).set(_User.DefaultUser);

            case 2:
            case "end":
              return _context17.stop();
          }
        }
      }, _callee17, this);
    })));
    it('adds new resource ids to the user',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee18() {
      var resourceIds, newResources;
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              //Arrange
              resourceIds = ["00001", "00002", "00003", "00004", "00005"]; //Act

              _context18.t0 = _AppProviderTypes.unsafeUnwrap;
              _context18.next = 4;
              return userApi.markAsNewResources(userId, resourceIds);

            case 4:
              _context18.t1 = _context18.sent;
              (0, _context18.t0)(_context18.t1);
              _context18.t2 = _AppProviderTypes.unsafeUnwrap;
              _context18.next = 9;
              return userApi.getNewResources(userId);

            case 9:
              _context18.t3 = _context18.sent;
              newResources = (0, _context18.t2)(_context18.t3);
              assert.equal(Object.keys(newResources).length, resourceIds.length);

            case 12:
            case "end":
              return _context18.stop();
          }
        }
      }, _callee18, this);
    })));
    it('delete a resource id from the user',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee19() {
      var resourceIds, newResources;
      return regeneratorRuntime.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              //Arrange
              resourceIds = ["00001", "00002", "00003", "00004", "00005"]; //Act

              _context19.t0 = _AppProviderTypes.unsafeUnwrap;
              _context19.next = 4;
              return userApi.markAsNewResources(userId, resourceIds);

            case 4:
              _context19.t1 = _context19.sent;
              (0, _context19.t0)(_context19.t1);
              _context19.t2 = _AppProviderTypes.unsafeUnwrap;
              _context19.next = 9;
              return userApi.removeNewResource(userId, "00004");

            case 9:
              _context19.t3 = _context19.sent;
              (0, _context19.t2)(_context19.t3);
              _context19.t4 = _AppProviderTypes.unsafeUnwrap;
              _context19.next = 14;
              return userApi.getNewResources(userId);

            case 14:
              _context19.t5 = _context19.sent;
              newResources = (0, _context19.t4)(_context19.t5);
              assert.equal(Object.keys(newResources).length, resourceIds.length - 1);

            case 17:
            case "end":
              return _context19.stop();
          }
        }
      }, _callee19, this);
    })));
    this.afterEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee20() {
      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              _context20.next = 2;
              return userApi.userRef(orgId, userId).delete();

            case 2:
            case "end":
              return _context20.stop();
          }
        }
      }, _callee20, this);
    })));
  });
  describe('merge users', function () {
    this.timeout(10000);
    var firestore = new _mockCloudFirestore.default({}).firestore();
    var userApi = new _UserApi.UserApi(firestore, orgId);
    var oldUserId = "old_user_1234";
    var newUserId = "new_user_1234";
    this.beforeEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee21() {
      var oldUserOwner, newUserOwner;
      return regeneratorRuntime.wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              _context21.next = 2;
              return userApi.userRef(orgId, oldUserId).set(_objectSpread({}, _User.DefaultUser, {
                id: oldUserId,
                favouriteResources: {
                  "1234": _objectSpread({}, _Resource.DefaultMyWellResource),
                  "5678": _objectSpread({}, _Resource.DefaultMyWellResource)
                },
                newResources: {
                  "123": "123",
                  "456": "456"
                },
                status: _UserStatus.default.Unapproved,
                translation: _ow_translations.TranslationEnum.en_US,
                type: _UserType.default.Admin
              }));

            case 2:
              _context21.next = 4;
              return userApi.userRef(orgId, newUserId).set(_objectSpread({}, _User.DefaultUser, {
                id: newUserId,
                newResources: {
                  "567": "567",
                  "890": "890"
                },
                status: _UserStatus.default.Approved,
                type: _UserType.default.User
              }));

            case 4:
              oldUserOwner = {
                name: "Lewis ji",
                createdByUserId: oldUserId
              };
              newUserOwner = {
                name: "Lewis ji",
                createdByUserId: newUserId
              }; //Create Pending Resources

              _context21.next = 8;
              return userApi.userRef(orgId, oldUserId).collection('pendingResources').doc('00001').set(_objectSpread({}, _Resource.DefaultPendingResource, {
                owner: _objectSpread({}, oldUserOwner),
                id: "00001",
                groups: {
                  country: "IN",
                  pincode: "313603"
                }
              }));

            case 8:
              _context21.next = 10;
              return userApi.userRef(orgId, oldUserId).collection('pendingResources').doc('00002').set(_objectSpread({}, _Resource.DefaultPendingResource, {
                owner: _objectSpread({}, oldUserOwner),
                id: "00002",
                groups: {
                  country: "IN",
                  pincode: "313603"
                }
              }));

            case 10:
              _context21.next = 12;
              return userApi.userRef(orgId, oldUserId).collection('pendingResources').doc('00003').set(_objectSpread({}, _Resource.DefaultPendingResource, {
                id: "00003",
                groups: {
                  country: "IN",
                  pincode: "313603"
                }
              }));

            case 12:
              _context21.next = 14;
              return userApi.userRef(orgId, newUserId).collection('pendingResources').doc('00004').set(_objectSpread({}, _Resource.DefaultPendingResource, {
                owner: _objectSpread({}, newUserOwner),
                id: "00004",
                groups: {
                  country: "IN",
                  pincode: "313603"
                }
              }));

            case 14:
              _context21.next = 16;
              return userApi.userRef(orgId, newUserId).collection('pendingResources').doc('00005').set(_objectSpread({}, _Resource.DefaultPendingResource, {
                owner: _objectSpread({}, newUserOwner),
                id: "00005",
                groups: {
                  country: "IN",
                  pincode: "313603"
                }
              }));

            case 16:
              _context21.next = 18;
              return userApi.userRef(orgId, newUserId).collection('pendingResources').doc('00006').set(_objectSpread({}, _Resource.DefaultPendingResource, {
                owner: _objectSpread({}, newUserOwner),
                id: "00006",
                groups: {
                  country: "IN",
                  pincode: "313603"
                }
              }));

            case 18:
              _context21.next = 20;
              return userApi.userRef(orgId, oldUserId).collection('pendingReadings').doc("reading_001").set(_objectSpread({}, _model.DefaultReading, {
                resourceId: "00001",
                timeseriesId: 'default'
              }));

            case 20:
              _context21.next = 22;
              return userApi.userRef(orgId, oldUserId).collection('pendingReadings').doc("reading_002").set(_objectSpread({}, _model.DefaultReading, {
                resourceId: "00001",
                timeseriesId: 'default'
              }));

            case 22:
              _context21.next = 24;
              return userApi.userRef(orgId, oldUserId).collection('pendingReadings').doc("reading_003").set(_objectSpread({}, _model.DefaultReading, {
                resourceId: "00002",
                datetime: '2017-01-01T01:11:01Z',
                value: 1,
                timeseriesId: 'default'
              }));

            case 24:
              _context21.next = 26;
              return userApi.userRef(orgId, newUserId).collection('pendingReadings').doc("reading_001").set(_objectSpread({}, _model.DefaultReading, {
                resourceId: "00003",
                datetime: '2017-01-02T01:11:01Z',
                value: 2,
                timeseriesId: 'default'
              }));

            case 26:
              _context21.next = 28;
              return userApi.userRef(orgId, newUserId).collection('pendingReadings').doc("reading_002").set(_objectSpread({}, _model.DefaultReading, {
                resourceId: "00004",
                datetime: '2017-01-03T01:11:01Z',
                value: 3,
                timeseriesId: 'default'
              }));

            case 28:
            case "end":
              return _context21.stop();
          }
        }
      }, _callee21, this);
    })));
    it('merges together the pendingReadings',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee22() {
      var newPendingReadings;
      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              _context22.t0 = _AppProviderTypes.unsafeUnwrap;
              _context22.next = 3;
              return userApi.mergeUserPendingReadings(oldUserId, newUserId);

            case 3:
              _context22.t1 = _context22.sent;
              (0, _context22.t0)(_context22.t1);
              _context22.t2 = _AppProviderTypes.unsafeUnwrap;
              _context22.next = 8;
              return userApi.getPendingReadings(userApi.userRef(orgId, newUserId));

            case 8:
              _context22.t3 = _context22.sent;
              newPendingReadings = (0, _context22.t2)(_context22.t3);
              //Assert
              assert.equal(newPendingReadings.length, 5);

            case 11:
            case "end":
              return _context22.stop();
          }
        }
      }, _callee22, this);
    })));
    it('merges together pending resources, and updates the createdByUserId',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee23() {
      var newPendingReadings;
      return regeneratorRuntime.wrap(function _callee23$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              _context23.t0 = _AppProviderTypes.unsafeUnwrap;
              _context23.next = 3;
              return userApi.mergeUserPendingResources(oldUserId, newUserId);

            case 3:
              _context23.t1 = _context23.sent;
              (0, _context23.t0)(_context23.t1);
              _context23.t2 = _AppProviderTypes.unsafeUnwrap;
              _context23.next = 8;
              return userApi.getPendingResources(userApi.userRef(orgId, newUserId));

            case 8:
              _context23.t3 = _context23.sent;
              newPendingReadings = (0, _context23.t2)(_context23.t3);
              //Assert
              assert.equal(newPendingReadings.length, 6);
              newPendingReadings.forEach(function (r) {
                var createdByUserId = (0, _utils.safeGetNested)(r, ['owner', 'createdByUserId']);
                assert.strictEqual(createdByUserId, newUserId);
              });

            case 12:
            case "end":
              return _context23.stop();
          }
        }
      }, _callee23, this);
    })));
    it('merges together two users',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee24() {
      var expected, updatedUser;
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              //Arrange
              expected = {
                id: newUserId,
                favouriteResources: {
                  "1234": _objectSpread({}, _Resource.DefaultMyWellResource),
                  "5678": _objectSpread({}, _Resource.DefaultMyWellResource)
                },
                newResources: {
                  "123": "123",
                  "456": "456",
                  "567": "567",
                  "890": "890"
                },
                pendingSavedReadings: [],
                pendingSavedResources: [],
                recentResources: [],
                recentSearches: [],
                status: _UserStatus.default.Approved,
                translation: _ow_translations.TranslationEnum.en_AU,
                type: _UserType.default.User
              }; //Act

              _context24.t0 = _AppProviderTypes.unsafeUnwrap;
              _context24.next = 4;
              return userApi.mergeUsers(oldUserId, newUserId);

            case 4:
              _context24.t1 = _context24.sent;
              (0, _context24.t0)(_context24.t1);
              _context24.t2 = _AppProviderTypes.unsafeUnwrap;
              _context24.next = 9;
              return userApi.getUser(userApi.userRef(orgId, newUserId));

            case 9:
              _context24.t3 = _context24.sent;
              updatedUser = (0, _context24.t2)(_context24.t3);
              assert.deepStrictEqual(updatedUser, expected);

            case 12:
            case "end":
              return _context24.stop();
          }
        }
      }, _callee24, this);
    })));
    this.afterEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee25() {
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              _context25.next = 2;
              return userApi.userRef(orgId, oldUserId).delete();

            case 2:
              _context25.next = 4;
              return userApi.userRef(orgId, newUserId).delete();

            case 4:
            case "end":
              return _context25.stop();
          }
        }
      }, _callee25, this);
    })));
  });
  describe('Merge Users 2', function () {
    this.timeout(10000);
    var firestore = new _mockCloudFirestore.default({}).firestore();
    var userApi = new _UserApi.UserApi(firestore, orgId);
    var oldUserId = "old_user_1234";
    var newUserId = "new_user_1234"; //TODO: create the users only

    this.beforeEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee26() {
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              _context26.next = 2;
              return userApi.userRef(orgId, oldUserId).set(_objectSpread({}, _User.DefaultUser, {
                id: oldUserId,
                favouriteResources: {
                  "1234": _objectSpread({}, _Resource.DefaultMyWellResource),
                  "5678": _objectSpread({}, _Resource.DefaultMyWellResource)
                },
                newResources: {
                  "123": "123",
                  "456": "456"
                },
                status: _UserStatus.default.Unapproved,
                translation: _ow_translations.TranslationEnum.en_US,
                type: _UserType.default.Admin
              }));

            case 2:
              _context26.next = 4;
              return userApi.userRef(orgId, newUserId).set(_objectSpread({}, _User.DefaultUser, {
                id: newUserId,
                newResources: {
                  "567": "567",
                  "890": "890"
                },
                status: _UserStatus.default.Approved,
                type: _UserType.default.User
              }));

            case 4:
            case "end":
              return _context26.stop();
          }
        }
      }, _callee26, this);
    })));
    it('merges together pending resources when none exist',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee27() {
      var newPendingReadings;
      return regeneratorRuntime.wrap(function _callee27$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              _context27.t0 = _AppProviderTypes.unsafeUnwrap;
              _context27.next = 3;
              return userApi.mergeUserPendingResources(oldUserId, newUserId);

            case 3:
              _context27.t1 = _context27.sent;
              (0, _context27.t0)(_context27.t1);
              _context27.t2 = _AppProviderTypes.unsafeUnwrap;
              _context27.next = 8;
              return userApi.getPendingResources(userApi.userRef(orgId, newUserId));

            case 8:
              _context27.t3 = _context27.sent;
              newPendingReadings = (0, _context27.t2)(_context27.t3);
              //Assert
              assert.equal(newPendingReadings.length, 0);

            case 11:
            case "end":
              return _context27.stop();
          }
        }
      }, _callee27, this);
    })));
    it('merges together the pendingReadings when none exist',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee28() {
      var newPendingReadings;
      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              _context28.t0 = _AppProviderTypes.unsafeUnwrap;
              _context28.next = 3;
              return userApi.mergeUserPendingReadings(oldUserId, newUserId);

            case 3:
              _context28.t1 = _context28.sent;
              (0, _context28.t0)(_context28.t1);
              _context28.t2 = _AppProviderTypes.unsafeUnwrap;
              _context28.next = 8;
              return userApi.getPendingReadings(userApi.userRef(orgId, newUserId));

            case 8:
              _context28.t3 = _context28.sent;
              newPendingReadings = (0, _context28.t2)(_context28.t3);
              //Assert
              assert.equal(newPendingReadings.length, 0);

            case 11:
            case "end":
              return _context28.stop();
          }
        }
      }, _callee28, this);
    })));
    this.afterEach(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee29() {
      return regeneratorRuntime.wrap(function _callee29$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              _context29.next = 2;
              return userApi.userRef(orgId, oldUserId).delete();

            case 2:
              _context29.next = 4;
              return userApi.userRef(orgId, newUserId).delete();

            case 4:
            case "end":
              return _context29.stop();
          }
        }
      }, _callee29, this);
    })));
  });
  describe("getPendingResources", function () {
    this.timeout(10000);
    var firestore = new _mockCloudFirestore.default({}).firestore();
    var userApi = new _UserApi.UserApi(firestore, orgId);
    var oldUserId = "old_user_1234";

    var pendingResource = _objectSpread({}, _Resource.DefaultMyWellResource);

    delete pendingResource.id;
    var oldUserOwner = {
      name: "Lewis ji",
      createdByUserId: oldUserId
    };
    this.beforeAll(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee30() {
      return regeneratorRuntime.wrap(function _callee30$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              _context30.next = 2;
              return userApi.userRef(orgId, oldUserId).collection('pendingResources').doc("custom_id").set(_objectSpread({}, pendingResource, {
                owner: _objectSpread({}, oldUserOwner),
                groups: {
                  country: "IN",
                  pincode: "313603"
                }
              }));

            case 2:
            case "end":
              return _context30.stop();
          }
        }
      }, _callee30, this);
    })));
    it('if the resource has no id, gets the id from the snapshot',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee31() {
      var pendingResources;
      return regeneratorRuntime.wrap(function _callee31$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              _context31.t0 = _AppProviderTypes.unsafeUnwrap;
              _context31.next = 3;
              return userApi.getPendingResources(userApi.userRef(orgId, oldUserId));

            case 3:
              _context31.t1 = _context31.sent;
              pendingResources = (0, _context31.t0)(_context31.t1);
              //Assert
              assert.equal(pendingResources[0].id, 'custom_id');

            case 6:
            case "end":
              return _context31.stop();
          }
        }
      }, _callee31, this);
    })));
    this.afterAll(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee32() {
      return regeneratorRuntime.wrap(function _callee32$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              _context32.next = 2;
              return userApi.userRef(orgId, oldUserId).delete();

            case 2:
            case "end":
              return _context32.stop();
          }
        }
      }, _callee32, this);
    })));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvVXNlckFwaS51bml0LnRzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJvcmdJZCIsImRlZmF1bHRSZXNvdXJjZSIsInR5cGUiLCJSZXNvdXJjZVR5cGUiLCJBbnkiLCJpZCIsImNvb3JkcyIsImxhdGl0dWRlIiwibG9uZ2l0dWRlIiwidGltZXNlcmllcyIsImRlc2NyaWJlIiwiZmlyZXN0b3JlIiwiTW9ja0ZpcmVzdG9yZSIsInVzZXJBcGkiLCJVc2VyQXBpIiwidXNlcklkIiwiYmVmb3JlRWFjaCIsInVzZXJSZWYiLCJzZXQiLCJEZWZhdWx0VXNlciIsIml0IiwiYWRkRmF2b3VyaXRlUmVzb3VyY2UiLCJhZGRGYXZSZXN1bHQiLCJ1bnNhZmVVbndyYXAiLCJnZXRGYXZvdXJpdGVSZXNvdXJjZXMiLCJmYXZvdXJpdGVSZXNvdXJjZXMiLCJhc3NlcnQiLCJkZWVwRXF1YWwiLCJyZXNvdXJjZV8xIiwicmVtb3ZlRmF2b3VyaXRlUmVzb3VyY2UiLCJyZW1vdmVGYXZSZXN1bHQiLCJhZnRlckVhY2giLCJkZWxldGUiLCJleHBlY3RlZFJlc291cmNlcyIsImRlZmF1bHRVc2VyIiwicmVjZW50UmVzb3VyY2VzIiwiZ2V0UmVjZW50UmVzb3VyY2VzIiwiYWN0dWFsIiwiZXhwZWN0ZWQiLCJVc2VyU3RhdHVzIiwiQXBwcm92ZWQiLCJjaGFuZ2VVc2VyU3RhdHVzIiwiZ2V0VXNlciIsInVzZXIiLCJzdGF0dXMiLCJlcXVhbCIsIlJlamVjdGVkIiwiVXNlclR5cGUiLCJBZG1pbiIsImNoYW5nZVVzZXJUeXBlIiwiVXNlciIsInRpbWVvdXQiLCJyZXNvdXJjZUlkcyIsIm1hcmtBc05ld1Jlc291cmNlcyIsImdldE5ld1Jlc291cmNlcyIsIm5ld1Jlc291cmNlcyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJyZW1vdmVOZXdSZXNvdXJjZSIsIm9sZFVzZXJJZCIsIm5ld1VzZXJJZCIsIkRlZmF1bHRNeVdlbGxSZXNvdXJjZSIsIlVuYXBwcm92ZWQiLCJ0cmFuc2xhdGlvbiIsIlRyYW5zbGF0aW9uRW51bSIsImVuX1VTIiwib2xkVXNlck93bmVyIiwibmFtZSIsImNyZWF0ZWRCeVVzZXJJZCIsIm5ld1VzZXJPd25lciIsImNvbGxlY3Rpb24iLCJkb2MiLCJEZWZhdWx0UGVuZGluZ1Jlc291cmNlIiwib3duZXIiLCJncm91cHMiLCJjb3VudHJ5IiwicGluY29kZSIsIkRlZmF1bHRSZWFkaW5nIiwicmVzb3VyY2VJZCIsInRpbWVzZXJpZXNJZCIsImRhdGV0aW1lIiwidmFsdWUiLCJtZXJnZVVzZXJQZW5kaW5nUmVhZGluZ3MiLCJnZXRQZW5kaW5nUmVhZGluZ3MiLCJuZXdQZW5kaW5nUmVhZGluZ3MiLCJtZXJnZVVzZXJQZW5kaW5nUmVzb3VyY2VzIiwiZ2V0UGVuZGluZ1Jlc291cmNlcyIsImZvckVhY2giLCJyIiwic3RyaWN0RXF1YWwiLCJwZW5kaW5nU2F2ZWRSZWFkaW5ncyIsInBlbmRpbmdTYXZlZFJlc291cmNlcyIsInJlY2VudFNlYXJjaGVzIiwiZW5fQVUiLCJtZXJnZVVzZXJzIiwidXBkYXRlZFVzZXIiLCJkZWVwU3RyaWN0RXF1YWwiLCJwZW5kaW5nUmVzb3VyY2UiLCJiZWZvcmVBbGwiLCJwZW5kaW5nUmVzb3VyY2VzIiwiYWZ0ZXJBbGwiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O2VBS0lBLE9BQU8sQ0FBQyx5QkFBRCxDO0lBRFRDLEssWUFBQUEsSzs7QUFJRixJQUFNQyxlQUF5QixHQUFHO0FBQ2hDQyxFQUFBQSxJQUFJLEVBQUVDLHVCQUFhQyxHQURhO0FBRWhDQyxFQUFBQSxFQUFFLEVBQUUsWUFGNEI7QUFHaENDLEVBQUFBLE1BQU0sRUFBRTtBQUFFQyxJQUFBQSxRQUFRLEVBQUUsRUFBWjtBQUFnQkMsSUFBQUEsU0FBUyxFQUFFO0FBQTNCLEdBSHdCO0FBSWhDQyxFQUFBQSxVQUFVLEVBQUU7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L0YsRUFBakMsRUFBcUMsV0FBckM7O0FBUDZEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQTdELEdBQUY7QUFVQSxTQUFLZ0csUUFBTDtBQUFBO0FBQUE7QUFBQTtBQUFBLDRCQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUNOeEYsT0FBTyxDQUFDSSxPQUFSLENBQWdCakIsS0FBaEIsRUFBdUI0RCxTQUF2QixFQUFrQzVCLE1BQWxDLEVBRE07O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBZDtBQUdELEdBN0JPLENBQVI7QUE4QkQsQ0F6Wk8sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnbW9jaGEnO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBVc2VyQXBpIH0gZnJvbSAnLi9Vc2VyQXBpJztcbi8vQHRzLWlnbm9yZVxuaW1wb3J0IE1vY2tGaXJlc3RvcmUgZnJvbSAnbW9jay1jbG91ZC1maXJlc3RvcmUnO1xuaW1wb3J0IHsgRGVmYXVsdFVzZXIsIFVzZXIgfSBmcm9tICcuLi9tb2RlbC9Vc2VyJztcbmltcG9ydCB7IFJlc291cmNlLCBSZXNvdXJjZVR5cGUsIERlZmF1bHRQZW5kaW5nUmVzb3VyY2UsIERlZmF1bHRNeVdlbGxSZXNvdXJjZSB9IGZyb20gJy4uL21vZGVsL1Jlc291cmNlJztcbmltcG9ydCB7IHVuc2FmZVVud3JhcCB9IGZyb20gJy4uL3V0aWxzL0FwcFByb3ZpZGVyVHlwZXMnO1xuaW1wb3J0IFVzZXJTdGF0dXMgZnJvbSAnLi4vZW51bXMvVXNlclN0YXR1cyc7XG5pbXBvcnQgVXNlclR5cGUgZnJvbSAnLi4vZW51bXMvVXNlclR5cGUnO1xuaW1wb3J0IHsgYWRtaW4gfSBmcm9tICcuLi90ZXN0L1Rlc3RGaXJlYmFzZSc7XG5pbXBvcnQgeyBEZWZhdWx0UmVhZGluZyB9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7IHNhZmVHZXROZXN0ZWQgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBUcmFuc2xhdGlvbkVudW0gfSBmcm9tICdvd190cmFuc2xhdGlvbnMnO1xudHlwZSBGaXJlc3RvcmUgPSBhZG1pbi5maXJlc3RvcmUuRmlyZXN0b3JlO1xuXG5jb25zdCB7IFxuICBvcmdJZCxcbn0gPSByZXF1aXJlKCcuLi90ZXN0L3Rlc3RDb25maWcuanNvbicpO1xuXG5cbmNvbnN0IGRlZmF1bHRSZXNvdXJjZTogUmVzb3VyY2UgPSB7XG4gIHR5cGU6IFJlc291cmNlVHlwZS5BbnksXG4gIGlkOiAncmVzb3VyY2VfMScsXG4gIGNvb3JkczogeyBsYXRpdHVkZTogMTIsIGxvbmdpdHVkZTogMTMgfSxcbiAgdGltZXNlcmllczoge30sXG59XG5cbmRlc2NyaWJlKCdVc2VyIEFwaScsIGZ1bmN0aW9uKCkge1xuXG4gIGRlc2NyaWJlKCdmYXZvdXJpdGVzJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgZmlyZXN0b3JlOiBGaXJlc3RvcmUgPSBuZXcgTW9ja0ZpcmVzdG9yZSh7fSkuZmlyZXN0b3JlKCk7XG4gICAgY29uc3QgdXNlckFwaSA9IG5ldyBVc2VyQXBpKGZpcmVzdG9yZSwgb3JnSWQpO1xuICAgIGNvbnN0IHVzZXJJZCA9ICd1c2VyX2lkXzEnO1xuICAgIFxuICAgIHRoaXMuYmVmb3JlRWFjaChhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIHVzZXJJZCkuc2V0KERlZmF1bHRVc2VyKTtcbiAgICB9KTtcblxuICAgIGl0KCdhZGRGYXZvdXJpdGVSZXNvdXJjZSBhZGRzIGEgZmF2b3VyaXRlIHJlc291cmNlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgLy9BcnJhbmdlXG4gICAgICAvL0FjdCBcbiAgICAgIGNvbnN0IGFkZEZhdlJlc3VsdCA9IGF3YWl0IHVzZXJBcGkuYWRkRmF2b3VyaXRlUmVzb3VyY2UodXNlcklkLCBkZWZhdWx0UmVzb3VyY2UpO1xuICAgICAgdW5zYWZlVW53cmFwKGFkZEZhdlJlc3VsdCk7XG4gICAgICBjb25zdCBmYXZvdXJpdGVSZXNvdXJjZXMgPSB1bnNhZmVVbndyYXAoYXdhaXQgdXNlckFwaS5nZXRGYXZvdXJpdGVSZXNvdXJjZXModXNlcklkKSk7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBhc3NlcnQuZGVlcEVxdWFsKHtyZXNvdXJjZV8xOiBkZWZhdWx0UmVzb3VyY2V9LCBmYXZvdXJpdGVSZXNvdXJjZXMpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3JlbW92ZUZhdm91cml0ZVJlc291cmNlIHJlbW92ZXMgYSBmYXZvdXJpdGUgcmVzb3VyY2UnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvL0FycmFuZ2VcbiAgICAgIGNvbnN0IGFkZEZhdlJlc3VsdCA9IGF3YWl0IHVzZXJBcGkuYWRkRmF2b3VyaXRlUmVzb3VyY2UodXNlcklkLCBkZWZhdWx0UmVzb3VyY2UpO1xuICAgICAgdW5zYWZlVW53cmFwKGFkZEZhdlJlc3VsdCk7XG5cbiAgICAgIC8vQWN0XG4gICAgICBjb25zdCByZW1vdmVGYXZSZXN1bHQgPSBhd2FpdCB1c2VyQXBpLnJlbW92ZUZhdm91cml0ZVJlc291cmNlKHVzZXJJZCwgZGVmYXVsdFJlc291cmNlLmlkKTtcbiAgICAgIHVuc2FmZVVud3JhcChyZW1vdmVGYXZSZXN1bHQpO1xuICAgICAgY29uc3QgZmF2b3VyaXRlUmVzb3VyY2VzID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0RmF2b3VyaXRlUmVzb3VyY2VzKHVzZXJJZCkpO1xuXG4gICAgICAvL0Fzc2VydFxuICAgICAgYXNzZXJ0LmRlZXBFcXVhbChmYXZvdXJpdGVSZXNvdXJjZXMsIHt9KTtcblxuICAgIH0pO1xuXG4gICAgdGhpcy5hZnRlckVhY2goYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgdXNlckFwaS51c2VyUmVmKG9yZ0lkLCB1c2VySWQpLmRlbGV0ZSgpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVjZW50cycsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGZpcmVzdG9yZTogRmlyZXN0b3JlID0gbmV3IE1vY2tGaXJlc3RvcmUoe30pLmZpcmVzdG9yZSgpO1xuICAgIGNvbnN0IHVzZXJBcGkgPSBuZXcgVXNlckFwaShmaXJlc3RvcmUsIG9yZ0lkKTtcbiAgICBjb25zdCB1c2VySWQgPSAndXNlcl9pZF8xJztcbiAgICBjb25zdCBleHBlY3RlZFJlc291cmNlcyA9IFtcbiAgICAgIHsgLi4uZGVmYXVsdFJlc291cmNlLCBpZDogJzEnIH0sXG4gICAgICB7IC4uLmRlZmF1bHRSZXNvdXJjZSwgaWQ6ICcyJyB9LFxuICAgICAgeyAuLi5kZWZhdWx0UmVzb3VyY2UsIGlkOiAnMycgfSxcbiAgICBdO1xuXG4gICAgdGhpcy5iZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGRlZmF1bHRVc2VyOiBVc2VyID0ge1xuICAgICAgICAuLi5EZWZhdWx0VXNlcixcbiAgICAgICAgcmVjZW50UmVzb3VyY2VzOiBleHBlY3RlZFJlc291cmNlcyxcbiAgICAgIH07XG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIHVzZXJJZCkuc2V0KGRlZmF1bHRVc2VyKTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ2dldFJlY2VudFJlc291cmNlcyBnZXRzIHRoZSBtb3N0IHJlY2VudCByZXNvdXJjZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvL0FycmFuZ2VcbiAgICAgIC8vQWN0XG4gICAgICBjb25zdCBhY3R1YWwgPSB1bnNhZmVVbndyYXAoYXdhaXQgdXNlckFwaS5nZXRSZWNlbnRSZXNvdXJjZXModXNlcklkKSk7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBhc3NlcnQuZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWRSZXNvdXJjZXMpXG4gICAgfSk7XG5cbiAgICB0aGlzLmFmdGVyRWFjaChhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIHVzZXJJZCkuZGVsZXRlKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjaGFuZ2VVc2VyU3RhdHVzJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgZmlyZXN0b3JlOiBGaXJlc3RvcmUgPSBuZXcgTW9ja0ZpcmVzdG9yZSh7fSkuZmlyZXN0b3JlKCk7XG4gICAgY29uc3QgdXNlckFwaSA9IG5ldyBVc2VyQXBpKGZpcmVzdG9yZSwgb3JnSWQpO1xuICAgIGNvbnN0IHVzZXJJZCA9ICd1c2VyX2lkXzEnO1xuXG4gICAgdGhpcy5iZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgdXNlcklkKS5zZXQoRGVmYXVsdFVzZXIpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2FwcHJvdmVzIGEgdXNlcicsIGFzeW5jICgpID0+IHtcbiAgICAgIC8vQXJyYW5nZVxuICAgICAgY29uc3QgZXhwZWN0ZWQ6IFVzZXJTdGF0dXMgPSBVc2VyU3RhdHVzLkFwcHJvdmVkO1xuXG4gICAgICAvL0FjdFxuICAgICAgdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuY2hhbmdlVXNlclN0YXR1cyh1c2VySWQsIFVzZXJTdGF0dXMuQXBwcm92ZWQpKTtcbiAgICAgIGNvbnN0IHVzZXIgPSB1bnNhZmVVbndyYXAoYXdhaXQgdXNlckFwaS5nZXRVc2VyKHVzZXJBcGkudXNlclJlZihvcmdJZCwgdXNlcklkKSkpO1xuICAgICAgY29uc3QgYWN0dWFsID0gdXNlci5zdGF0dXM7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBhc3NlcnQuZXF1YWwoYWN0dWFsLCBleHBlY3RlZCk7XG4gICAgfSk7XG5cbiAgICBpdCgncmVqZWN0cyBhIHVzZXInLCBhc3luYyAoKSA9PiB7XG4gICAgICAvL0FycmFuZ2VcbiAgICAgIGNvbnN0IGV4cGVjdGVkOiBVc2VyU3RhdHVzID0gVXNlclN0YXR1cy5SZWplY3RlZDtcblxuICAgICAgLy9BY3RcbiAgICAgIHVuc2FmZVVud3JhcChhd2FpdCB1c2VyQXBpLmNoYW5nZVVzZXJTdGF0dXModXNlcklkLCBVc2VyU3RhdHVzLlJlamVjdGVkKSk7XG4gICAgICBjb25zdCB1c2VyID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0VXNlcih1c2VyQXBpLnVzZXJSZWYob3JnSWQsIHVzZXJJZCkpKTtcbiAgICAgIGNvbnN0IGFjdHVhbCA9IHVzZXIuc3RhdHVzO1xuXG4gICAgICAvL0Fzc2VydFxuICAgICAgYXNzZXJ0LmVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5hZnRlckVhY2goYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgdXNlckFwaS51c2VyUmVmKG9yZ0lkLCB1c2VySWQpLmRlbGV0ZSgpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnY2hhbmdlIHVzZXIgdHlwZScsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGZpcmVzdG9yZTogRmlyZXN0b3JlID0gbmV3IE1vY2tGaXJlc3RvcmUoe30pLmZpcmVzdG9yZSgpO1xuICAgIGNvbnN0IHVzZXJBcGkgPSBuZXcgVXNlckFwaShmaXJlc3RvcmUsIG9yZ0lkKTtcbiAgICBjb25zdCB1c2VySWQgPSAndXNlcl9pZF8xJztcblxuICAgIHRoaXMuYmVmb3JlRWFjaChhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIHVzZXJJZCkuc2V0KERlZmF1bHRVc2VyKTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ2VsZXZhdGVzIGEgdXNlciB0byBBZG1pbicsIGFzeW5jICgpID0+IHtcbiAgICAgIC8vQXJyYW5nZVxuICAgICAgY29uc3QgZXhwZWN0ZWQ6IFVzZXJUeXBlID0gVXNlclR5cGUuQWRtaW47XG5cbiAgICAgIC8vQWN0XG4gICAgICB1bnNhZmVVbndyYXAoYXdhaXQgdXNlckFwaS5jaGFuZ2VVc2VyVHlwZSh1c2VySWQsIGV4cGVjdGVkKSk7XG4gICAgICBjb25zdCB1c2VyID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0VXNlcih1c2VyQXBpLnVzZXJSZWYob3JnSWQsIHVzZXJJZCkpKTtcbiAgICAgIGNvbnN0IGFjdHVhbCA9IHVzZXIudHlwZTtcblxuICAgICAgLy9Bc3NlcnRcbiAgICAgIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkKTtcbiAgICB9KTtcblxuICAgIGl0KCdkZW1vdGVzIGEgdXNlciB0byBVc2VyJywgYXN5bmMgKCkgPT4ge1xuICAgICAgLy9BcnJhbmdlXG4gICAgICBjb25zdCBleHBlY3RlZDogVXNlclR5cGUgPSBVc2VyVHlwZS5Vc2VyO1xuICAgICAgdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuY2hhbmdlVXNlclR5cGUodXNlcklkLCBVc2VyVHlwZS5BZG1pbikpO1xuXG4gICAgICAvL0FjdFxuICAgICAgdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuY2hhbmdlVXNlclR5cGUodXNlcklkLCBVc2VyVHlwZS5Vc2VyKSk7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBjb25zdCB1c2VyID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0VXNlcih1c2VyQXBpLnVzZXJSZWYob3JnSWQsIHVzZXJJZCkpKTtcbiAgICAgIGNvbnN0IGFjdHVhbCA9IHVzZXIudHlwZTtcbiAgICAgIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWZ0ZXJFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgdXNlcklkKS5kZWxldGUoKTtcbiAgICB9KTtcbiAgfSk7XG5cblxuICBkZXNjcmliZSgnbmV3IHJlc291cmNlIGFkZC9kZWxldGUnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRpbWVvdXQoNTAwMCk7XG4gICAgY29uc3QgZmlyZXN0b3JlOiBGaXJlc3RvcmUgPSBuZXcgTW9ja0ZpcmVzdG9yZSh7fSkuZmlyZXN0b3JlKCk7XG5cbiAgICBjb25zdCB1c2VyQXBpID0gbmV3IFVzZXJBcGkoZmlyZXN0b3JlLCBvcmdJZCk7XG4gICAgY29uc3QgdXNlcklkID0gJ3VzZXJfaWRfMSc7XG5cbiAgICB0aGlzLmJlZm9yZUVhY2goYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgdXNlckFwaS51c2VyUmVmKG9yZ0lkLCB1c2VySWQpLnNldChEZWZhdWx0VXNlcik7XG4gICAgfSk7XG5cbiAgICBpdCgnYWRkcyBuZXcgcmVzb3VyY2UgaWRzIHRvIHRoZSB1c2VyJywgYXN5bmMgKCkgPT4ge1xuICAgICAgLy9BcnJhbmdlXG4gICAgICBjb25zdCByZXNvdXJjZUlkcyA9IFtcIjAwMDAxXCIsIFwiMDAwMDJcIiwgXCIwMDAwM1wiLCBcIjAwMDA0XCIsIFwiMDAwMDVcIl07XG5cbiAgICAgIC8vQWN0XG4gICAgICB1bnNhZmVVbndyYXAoYXdhaXQgdXNlckFwaS5tYXJrQXNOZXdSZXNvdXJjZXModXNlcklkLCByZXNvdXJjZUlkcykpO1xuXG4gICAgICAvL0Fzc2VydFxuICAgICAgY29uc3QgbmV3UmVzb3VyY2VzID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0TmV3UmVzb3VyY2VzKHVzZXJJZCkpO1xuICAgICAgYXNzZXJ0LmVxdWFsKE9iamVjdC5rZXlzKG5ld1Jlc291cmNlcykubGVuZ3RoLCByZXNvdXJjZUlkcy5sZW5ndGgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2RlbGV0ZSBhIHJlc291cmNlIGlkIGZyb20gdGhlIHVzZXInLCBhc3luYyAoKSA9PiB7XG4gICAgICAvL0FycmFuZ2VcbiAgICAgIGNvbnN0IHJlc291cmNlSWRzID0gW1wiMDAwMDFcIiwgXCIwMDAwMlwiLCBcIjAwMDAzXCIsIFwiMDAwMDRcIiwgXCIwMDAwNVwiXTtcblxuICAgICAgLy9BY3RcbiAgICAgIHVuc2FmZVVud3JhcChhd2FpdCB1c2VyQXBpLm1hcmtBc05ld1Jlc291cmNlcyh1c2VySWQsIHJlc291cmNlSWRzKSk7XG4gICAgICB1bnNhZmVVbndyYXAoYXdhaXQgdXNlckFwaS5yZW1vdmVOZXdSZXNvdXJjZSh1c2VySWQsIFwiMDAwMDRcIikpO1xuXG4gICAgICAvL0Fzc2VydFxuICAgICAgY29uc3QgbmV3UmVzb3VyY2VzID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0TmV3UmVzb3VyY2VzKHVzZXJJZCkpO1xuICAgICAgYXNzZXJ0LmVxdWFsKE9iamVjdC5rZXlzKG5ld1Jlc291cmNlcykubGVuZ3RoLCByZXNvdXJjZUlkcy5sZW5ndGggLSAxKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWZ0ZXJFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgdXNlcklkKS5kZWxldGUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ21lcmdlIHVzZXJzJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aW1lb3V0KDEwMDAwKTtcbiAgICBjb25zdCBmaXJlc3RvcmU6IEZpcmVzdG9yZSA9IG5ldyBNb2NrRmlyZXN0b3JlKHt9KS5maXJlc3RvcmUoKTtcbiAgICBjb25zdCB1c2VyQXBpID0gbmV3IFVzZXJBcGkoZmlyZXN0b3JlLCBvcmdJZCk7XG4gICAgY29uc3Qgb2xkVXNlcklkID0gXCJvbGRfdXNlcl8xMjM0XCI7XG4gICAgY29uc3QgbmV3VXNlcklkID0gXCJuZXdfdXNlcl8xMjM0XCI7XG5cbiAgICB0aGlzLmJlZm9yZUVhY2goYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAvL0NyZWF0ZSAyIHVzZXJzXG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG9sZFVzZXJJZCkuc2V0KHsgXG4gICAgICAgIC4uLkRlZmF1bHRVc2VyLCBcbiAgICAgICAgaWQ6IG9sZFVzZXJJZCwgXG4gICAgICAgIGZhdm91cml0ZVJlc291cmNlczoge1xuICAgICAgICAgIFwiMTIzNFwiOiB7IC4uLkRlZmF1bHRNeVdlbGxSZXNvdXJjZSB9LFxuICAgICAgICAgIFwiNTY3OFwiOiB7IC4uLkRlZmF1bHRNeVdlbGxSZXNvdXJjZSB9LFxuICAgICAgICB9LFxuICAgICAgICBuZXdSZXNvdXJjZXM6IHtcbiAgICAgICAgICBcIjEyM1wiOiBcIjEyM1wiLFxuICAgICAgICAgIFwiNDU2XCI6IFwiNDU2XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXR1czogVXNlclN0YXR1cy5VbmFwcHJvdmVkLFxuICAgICAgICB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb25FbnVtLmVuX1VTLCBcbiAgICAgICAgdHlwZTogVXNlclR5cGUuQWRtaW4sXG4gICAgICB9KTtcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgbmV3VXNlcklkKS5zZXQoe1xuICAgICAgICAuLi5EZWZhdWx0VXNlcixcbiAgICAgICAgaWQ6IG5ld1VzZXJJZCwgXG4gICAgICAgIG5ld1Jlc291cmNlczoge1xuICAgICAgICAgIFwiNTY3XCI6IFwiNTY3XCIsXG4gICAgICAgICAgXCI4OTBcIjogXCI4OTBcIixcbiAgICAgICAgfSxcbiAgICAgICAgc3RhdHVzOiBVc2VyU3RhdHVzLkFwcHJvdmVkLFxuICAgICAgICB0eXBlOiBVc2VyVHlwZS5Vc2VyLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IG9sZFVzZXJPd25lciA9IHsgbmFtZTogXCJMZXdpcyBqaVwiLCBjcmVhdGVkQnlVc2VySWQ6IG9sZFVzZXJJZCB9O1xuICAgICAgY29uc3QgbmV3VXNlck93bmVyID0geyBuYW1lOiBcIkxld2lzIGppXCIsIGNyZWF0ZWRCeVVzZXJJZDogbmV3VXNlcklkIH07XG5cbiAgICAgIC8vQ3JlYXRlIFBlbmRpbmcgUmVzb3VyY2VzXG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG9sZFVzZXJJZCkuY29sbGVjdGlvbigncGVuZGluZ1Jlc291cmNlcycpLmRvYygnMDAwMDEnKS5zZXQoeyAuLi5EZWZhdWx0UGVuZGluZ1Jlc291cmNlLCBvd25lcjogey4uLm9sZFVzZXJPd25lcn0sIGlkOiBcIjAwMDAxXCIsIGdyb3VwczogeyBjb3VudHJ5OiBcIklOXCIsIHBpbmNvZGU6IFwiMzEzNjAzXCIgfSB9KTtcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgb2xkVXNlcklkKS5jb2xsZWN0aW9uKCdwZW5kaW5nUmVzb3VyY2VzJykuZG9jKCcwMDAwMicpLnNldCh7IC4uLkRlZmF1bHRQZW5kaW5nUmVzb3VyY2UsIG93bmVyOiB7Li4ub2xkVXNlck93bmVyfSwgaWQ6IFwiMDAwMDJcIiwgZ3JvdXBzOiB7IGNvdW50cnk6IFwiSU5cIiwgcGluY29kZTogXCIzMTM2MDNcIiB9IH0pO1xuICAgICAgYXdhaXQgdXNlckFwaS51c2VyUmVmKG9yZ0lkLCBvbGRVc2VySWQpLmNvbGxlY3Rpb24oJ3BlbmRpbmdSZXNvdXJjZXMnKS5kb2MoJzAwMDAzJykuc2V0KHsgLi4uRGVmYXVsdFBlbmRpbmdSZXNvdXJjZSwgaWQ6IFwiMDAwMDNcIiwgZ3JvdXBzOiB7IGNvdW50cnk6IFwiSU5cIiwgcGluY29kZTogXCIzMTM2MDNcIiB9IH0pO1xuXG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG5ld1VzZXJJZCkuY29sbGVjdGlvbigncGVuZGluZ1Jlc291cmNlcycpLmRvYygnMDAwMDQnKS5zZXQoeyAuLi5EZWZhdWx0UGVuZGluZ1Jlc291cmNlLCBvd25lcjogey4uLm5ld1VzZXJPd25lcn0sIGlkOiBcIjAwMDA0XCIsIGdyb3VwczogeyBjb3VudHJ5OiBcIklOXCIsIHBpbmNvZGU6IFwiMzEzNjAzXCIgfSB9KTtcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgbmV3VXNlcklkKS5jb2xsZWN0aW9uKCdwZW5kaW5nUmVzb3VyY2VzJykuZG9jKCcwMDAwNScpLnNldCh7IC4uLkRlZmF1bHRQZW5kaW5nUmVzb3VyY2UsIG93bmVyOiB7Li4ubmV3VXNlck93bmVyfSwgaWQ6IFwiMDAwMDVcIiwgZ3JvdXBzOiB7IGNvdW50cnk6IFwiSU5cIiwgcGluY29kZTogXCIzMTM2MDNcIiB9IH0pO1xuICAgICAgYXdhaXQgdXNlckFwaS51c2VyUmVmKG9yZ0lkLCBuZXdVc2VySWQpLmNvbGxlY3Rpb24oJ3BlbmRpbmdSZXNvdXJjZXMnKS5kb2MoJzAwMDA2Jykuc2V0KHsgLi4uRGVmYXVsdFBlbmRpbmdSZXNvdXJjZSwgb3duZXI6IHsuLi5uZXdVc2VyT3duZXJ9LCBpZDogXCIwMDAwNlwiLCBncm91cHM6IHsgY291bnRyeTogXCJJTlwiLCBwaW5jb2RlOiBcIjMxMzYwM1wiIH0gfSk7XG5cbiAgICAgIC8vQ3JlYXRlIHBlbmRpbmcgcmVhZGluZ3M6XG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG9sZFVzZXJJZCkuY29sbGVjdGlvbigncGVuZGluZ1JlYWRpbmdzJykuZG9jKFwicmVhZGluZ18wMDFcIikuc2V0KHsgLi4uRGVmYXVsdFJlYWRpbmcsIHJlc291cmNlSWQ6IFwiMDAwMDFcIiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCcgfSlcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgb2xkVXNlcklkKS5jb2xsZWN0aW9uKCdwZW5kaW5nUmVhZGluZ3MnKS5kb2MoXCJyZWFkaW5nXzAwMlwiKS5zZXQoeyAuLi5EZWZhdWx0UmVhZGluZywgcmVzb3VyY2VJZDogXCIwMDAwMVwiLCB0aW1lc2VyaWVzSWQ6ICdkZWZhdWx0JyB9KVxuICAgICAgYXdhaXQgdXNlckFwaS51c2VyUmVmKG9yZ0lkLCBvbGRVc2VySWQpLmNvbGxlY3Rpb24oJ3BlbmRpbmdSZWFkaW5ncycpLmRvYyhcInJlYWRpbmdfMDAzXCIpLnNldCh7IC4uLkRlZmF1bHRSZWFkaW5nLCByZXNvdXJjZUlkOiBcIjAwMDAyXCIsIGRhdGV0aW1lOiAnMjAxNy0wMS0wMVQwMToxMTowMVonLCB2YWx1ZTogMSwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCcgfSlcblxuICAgICAgYXdhaXQgdXNlckFwaS51c2VyUmVmKG9yZ0lkLCBuZXdVc2VySWQpLmNvbGxlY3Rpb24oJ3BlbmRpbmdSZWFkaW5ncycpLmRvYyhcInJlYWRpbmdfMDAxXCIpLnNldCh7IC4uLkRlZmF1bHRSZWFkaW5nLCByZXNvdXJjZUlkOiBcIjAwMDAzXCIsIGRhdGV0aW1lOiAnMjAxNy0wMS0wMlQwMToxMTowMVonLCB2YWx1ZTogMiwgdGltZXNlcmllc0lkOiAnZGVmYXVsdCcgfSlcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgbmV3VXNlcklkKS5jb2xsZWN0aW9uKCdwZW5kaW5nUmVhZGluZ3MnKS5kb2MoXCJyZWFkaW5nXzAwMlwiKS5zZXQoeyAuLi5EZWZhdWx0UmVhZGluZywgcmVzb3VyY2VJZDogXCIwMDAwNFwiLCBkYXRldGltZTogJzIwMTctMDEtMDNUMDE6MTE6MDFaJywgdmFsdWU6IDMsIHRpbWVzZXJpZXNJZDogJ2RlZmF1bHQnIH0pXG4gICAgfSk7XG5cbiAgICBpdCgnbWVyZ2VzIHRvZ2V0aGVyIHRoZSBwZW5kaW5nUmVhZGluZ3MnLCBhc3luYygpID0+IHtcbiAgICAgIC8vQXJyYW5nZVxuICAgICAgLy9BY3RcbiAgICAgIHVuc2FmZVVud3JhcChhd2FpdCB1c2VyQXBpLm1lcmdlVXNlclBlbmRpbmdSZWFkaW5ncyhvbGRVc2VySWQsIG5ld1VzZXJJZCkpO1xuICAgICAgY29uc3QgbmV3UGVuZGluZ1JlYWRpbmdzID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0UGVuZGluZ1JlYWRpbmdzKHVzZXJBcGkudXNlclJlZihvcmdJZCwgbmV3VXNlcklkKSkpO1xuXG4gICAgICAvL0Fzc2VydFxuICAgICAgYXNzZXJ0LmVxdWFsKG5ld1BlbmRpbmdSZWFkaW5ncy5sZW5ndGgsIDUpO1xuICAgIH0pO1xuXG4gICAgaXQoJ21lcmdlcyB0b2dldGhlciBwZW5kaW5nIHJlc291cmNlcywgYW5kIHVwZGF0ZXMgdGhlIGNyZWF0ZWRCeVVzZXJJZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIC8vQXJyYW5nZVxuICAgICAgLy9BY3RcbiAgICAgIHVuc2FmZVVud3JhcChhd2FpdCB1c2VyQXBpLm1lcmdlVXNlclBlbmRpbmdSZXNvdXJjZXMob2xkVXNlcklkLCBuZXdVc2VySWQpKTtcbiAgICAgIGNvbnN0IG5ld1BlbmRpbmdSZWFkaW5ncyA9IHVuc2FmZVVud3JhcChhd2FpdCB1c2VyQXBpLmdldFBlbmRpbmdSZXNvdXJjZXModXNlckFwaS51c2VyUmVmKG9yZ0lkLCBuZXdVc2VySWQpKSk7XG5cbiAgICAgIC8vQXNzZXJ0XG4gICAgICBhc3NlcnQuZXF1YWwobmV3UGVuZGluZ1JlYWRpbmdzLmxlbmd0aCwgNik7XG4gICAgICBuZXdQZW5kaW5nUmVhZGluZ3MuZm9yRWFjaChyID0+IHtcbiAgICAgICAgY29uc3QgY3JlYXRlZEJ5VXNlcklkID0gc2FmZUdldE5lc3RlZChyLCBbJ293bmVyJywgJ2NyZWF0ZWRCeVVzZXJJZCddKTtcbiAgICAgICAgYXNzZXJ0LnN0cmljdEVxdWFsKGNyZWF0ZWRCeVVzZXJJZCwgbmV3VXNlcklkKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ21lcmdlcyB0b2dldGhlciB0d28gdXNlcnMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvL0FycmFuZ2VcbiAgICAgIGNvbnN0IGV4cGVjdGVkID0ge1xuICAgICAgICBpZDogbmV3VXNlcklkLFxuICAgICAgICBmYXZvdXJpdGVSZXNvdXJjZXM6IHtcbiAgICAgICAgICBcIjEyMzRcIjogey4uLkRlZmF1bHRNeVdlbGxSZXNvdXJjZSB9LFxuICAgICAgICAgIFwiNTY3OFwiOiB7IC4uLkRlZmF1bHRNeVdlbGxSZXNvdXJjZSB9LFxuICAgICAgICB9LFxuICAgICAgICBuZXdSZXNvdXJjZXM6IHtcbiAgICAgICAgICBcIjEyM1wiOiBcIjEyM1wiLFxuICAgICAgICAgIFwiNDU2XCI6IFwiNDU2XCIsXG4gICAgICAgICAgXCI1NjdcIjogXCI1NjdcIixcbiAgICAgICAgICBcIjg5MFwiOiBcIjg5MFwiLFxuICAgICAgICB9LFxuICAgICAgICBwZW5kaW5nU2F2ZWRSZWFkaW5nczogW10sXG4gICAgICAgIHBlbmRpbmdTYXZlZFJlc291cmNlczogW10sXG4gICAgICAgIHJlY2VudFJlc291cmNlczogW10sXG4gICAgICAgIHJlY2VudFNlYXJjaGVzOiBbXSxcbiAgICAgICAgc3RhdHVzOiBVc2VyU3RhdHVzLkFwcHJvdmVkLFxuICAgICAgICB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb25FbnVtLmVuX0FVLFxuICAgICAgICB0eXBlOiBVc2VyVHlwZS5Vc2VyLFxuICAgICAgfTtcblxuICAgICAgLy9BY3RcbiAgICAgIHVuc2FmZVVud3JhcChhd2FpdCB1c2VyQXBpLm1lcmdlVXNlcnMob2xkVXNlcklkLCBuZXdVc2VySWQpKTtcbiAgICAgIGNvbnN0IHVwZGF0ZWRVc2VyID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0VXNlcih1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG5ld1VzZXJJZCkpKTtcblxuICAgICAgYXNzZXJ0LmRlZXBTdHJpY3RFcXVhbCh1cGRhdGVkVXNlciwgZXhwZWN0ZWQpXG4gICAgfSk7XG5cbiAgICB0aGlzLmFmdGVyRWFjaChhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAvL1RoaXMgd2lsbCBjbGVhciBuZXN0ZWQgc3ViY29sbGVjdGlvbnMuXG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG9sZFVzZXJJZCkuZGVsZXRlKCk7XG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG5ld1VzZXJJZCkuZGVsZXRlKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdNZXJnZSBVc2VycyAyJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aW1lb3V0KDEwMDAwKTtcbiAgICBjb25zdCBmaXJlc3RvcmU6IEZpcmVzdG9yZSA9IG5ldyBNb2NrRmlyZXN0b3JlKHt9KS5maXJlc3RvcmUoKTtcbiAgICBjb25zdCB1c2VyQXBpID0gbmV3IFVzZXJBcGkoZmlyZXN0b3JlLCBvcmdJZCk7XG4gICAgY29uc3Qgb2xkVXNlcklkID0gXCJvbGRfdXNlcl8xMjM0XCI7XG4gICAgY29uc3QgbmV3VXNlcklkID0gXCJuZXdfdXNlcl8xMjM0XCI7XG5cbiAgICAvL1RPRE86IGNyZWF0ZSB0aGUgdXNlcnMgb25seVxuICAgIHRoaXMuYmVmb3JlRWFjaChhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgb2xkVXNlcklkKS5zZXQoe1xuICAgICAgICAuLi5EZWZhdWx0VXNlcixcbiAgICAgICAgaWQ6IG9sZFVzZXJJZCxcbiAgICAgICAgZmF2b3VyaXRlUmVzb3VyY2VzOiB7XG4gICAgICAgICAgXCIxMjM0XCI6IHsgLi4uRGVmYXVsdE15V2VsbFJlc291cmNlIH0sXG4gICAgICAgICAgXCI1Njc4XCI6IHsgLi4uRGVmYXVsdE15V2VsbFJlc291cmNlIH0sXG4gICAgICAgIH0sXG4gICAgICAgIG5ld1Jlc291cmNlczoge1xuICAgICAgICAgIFwiMTIzXCI6IFwiMTIzXCIsXG4gICAgICAgICAgXCI0NTZcIjogXCI0NTZcIixcbiAgICAgICAgfSxcbiAgICAgICAgc3RhdHVzOiBVc2VyU3RhdHVzLlVuYXBwcm92ZWQsXG4gICAgICAgIHRyYW5zbGF0aW9uOiBUcmFuc2xhdGlvbkVudW0uZW5fVVMsXG4gICAgICAgIHR5cGU6IFVzZXJUeXBlLkFkbWluLFxuICAgICAgfSk7XG4gICAgICBhd2FpdCB1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG5ld1VzZXJJZCkuc2V0KHtcbiAgICAgICAgLi4uRGVmYXVsdFVzZXIsXG4gICAgICAgIGlkOiBuZXdVc2VySWQsXG4gICAgICAgIG5ld1Jlc291cmNlczoge1xuICAgICAgICAgIFwiNTY3XCI6IFwiNTY3XCIsXG4gICAgICAgICAgXCI4OTBcIjogXCI4OTBcIixcbiAgICAgICAgfSxcbiAgICAgICAgc3RhdHVzOiBVc2VyU3RhdHVzLkFwcHJvdmVkLFxuICAgICAgICB0eXBlOiBVc2VyVHlwZS5Vc2VyLFxuICAgICAgfSk7XG4gICAgfSlcblxuICAgIGl0KCdtZXJnZXMgdG9nZXRoZXIgcGVuZGluZyByZXNvdXJjZXMgd2hlbiBub25lIGV4aXN0JywgYXN5bmMgKCkgPT4ge1xuICAgICAgLy9BcnJhbmdlXG4gICAgICAvL0FjdFxuICAgICAgdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkubWVyZ2VVc2VyUGVuZGluZ1Jlc291cmNlcyhvbGRVc2VySWQsIG5ld1VzZXJJZCkpO1xuICAgICAgY29uc3QgbmV3UGVuZGluZ1JlYWRpbmdzID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0UGVuZGluZ1Jlc291cmNlcyh1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG5ld1VzZXJJZCkpKTtcblxuICAgICAgLy9Bc3NlcnRcbiAgICAgIGFzc2VydC5lcXVhbChuZXdQZW5kaW5nUmVhZGluZ3MubGVuZ3RoLCAwKTtcbiAgICB9KTtcblxuICAgIGl0KCdtZXJnZXMgdG9nZXRoZXIgdGhlIHBlbmRpbmdSZWFkaW5ncyB3aGVuIG5vbmUgZXhpc3QnLCBhc3luYyAoKSA9PiB7XG4gICAgICAvL0FycmFuZ2VcbiAgICAgIC8vQWN0XG4gICAgICB1bnNhZmVVbndyYXAoYXdhaXQgdXNlckFwaS5tZXJnZVVzZXJQZW5kaW5nUmVhZGluZ3Mob2xkVXNlcklkLCBuZXdVc2VySWQpKTtcbiAgICAgIGNvbnN0IG5ld1BlbmRpbmdSZWFkaW5ncyA9IHVuc2FmZVVud3JhcChhd2FpdCB1c2VyQXBpLmdldFBlbmRpbmdSZWFkaW5ncyh1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG5ld1VzZXJJZCkpKTtcblxuICAgICAgLy9Bc3NlcnRcbiAgICAgIGFzc2VydC5lcXVhbChuZXdQZW5kaW5nUmVhZGluZ3MubGVuZ3RoLCAwKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWZ0ZXJFYWNoKGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vVGhpcyB3aWxsIGNsZWFyIG5lc3RlZCBzdWJjb2xsZWN0aW9ucy5cbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgb2xkVXNlcklkKS5kZWxldGUoKTtcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgbmV3VXNlcklkKS5kZWxldGUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJnZXRQZW5kaW5nUmVzb3VyY2VzXCIsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGltZW91dCgxMDAwMCk7XG4gICAgY29uc3QgZmlyZXN0b3JlOiBGaXJlc3RvcmUgPSBuZXcgTW9ja0ZpcmVzdG9yZSh7fSkuZmlyZXN0b3JlKCk7XG4gICAgY29uc3QgdXNlckFwaSA9IG5ldyBVc2VyQXBpKGZpcmVzdG9yZSwgb3JnSWQpO1xuICAgIGNvbnN0IG9sZFVzZXJJZCA9IFwib2xkX3VzZXJfMTIzNFwiO1xuXG4gICAgY29uc3QgcGVuZGluZ1Jlc291cmNlID0ge1xuICAgICAgLi4uRGVmYXVsdE15V2VsbFJlc291cmNlLFxuICAgIH07XG4gICAgZGVsZXRlIHBlbmRpbmdSZXNvdXJjZS5pZDtcbiAgICBjb25zdCBvbGRVc2VyT3duZXIgPSB7IG5hbWU6IFwiTGV3aXMgamlcIiwgY3JlYXRlZEJ5VXNlcklkOiBvbGRVc2VySWQgfTtcblxuICAgIHRoaXMuYmVmb3JlQWxsKGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgYXdhaXQgdXNlckFwaS51c2VyUmVmKG9yZ0lkLCBvbGRVc2VySWQpLmNvbGxlY3Rpb24oJ3BlbmRpbmdSZXNvdXJjZXMnKS5kb2MoXCJjdXN0b21faWRcIikuc2V0KHsgLi4ucGVuZGluZ1Jlc291cmNlLCBvd25lcjogeyAuLi5vbGRVc2VyT3duZXIgfSwgZ3JvdXBzOiB7IGNvdW50cnk6IFwiSU5cIiwgcGluY29kZTogXCIzMTM2MDNcIiB9IH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ2lmIHRoZSByZXNvdXJjZSBoYXMgbm8gaWQsIGdldHMgdGhlIGlkIGZyb20gdGhlIHNuYXBzaG90JywgYXN5bmMgKCkgPT4ge1xuICAgICAgLy9BcnJhbmdlXG5cbiAgICAgIC8vQWN0XG4gICAgICBjb25zdCBwZW5kaW5nUmVzb3VyY2VzID0gdW5zYWZlVW53cmFwKGF3YWl0IHVzZXJBcGkuZ2V0UGVuZGluZ1Jlc291cmNlcyh1c2VyQXBpLnVzZXJSZWYob3JnSWQsIG9sZFVzZXJJZCkpKTtcblxuICAgICAgLy9Bc3NlcnRcbiAgICAgIGFzc2VydC5lcXVhbChwZW5kaW5nUmVzb3VyY2VzWzBdLmlkLCAnY3VzdG9tX2lkJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFmdGVyQWxsKGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGF3YWl0IHVzZXJBcGkudXNlclJlZihvcmdJZCwgb2xkVXNlcklkKS5kZWxldGUoKTtcbiAgICB9KTtcbiAgfSk7XG59KTsiXX0=