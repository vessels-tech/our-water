"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Resource = void 0;

var _ResourceType = require("../enums/ResourceType");

var _ResourceIdType = _interopRequireDefault(require("../types/ResourceIdType"));

var _FirestoreDoc2 = _interopRequireDefault(require("./FirestoreDoc"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Resource =
/*#__PURE__*/
function (_FirestoreDoc) {
  _inherits(Resource, _FirestoreDoc);

  //simple dict with key of GroupId, value of true
  function Resource(orgId, externalIds, coords, resourceType, owner, groups) {
    var _this;

    _classCallCheck(this, Resource);

    _this = _possibleConstructorReturn(this, (Resource.__proto__ || Object.getPrototypeOf(Resource)).call(this));
    Object.defineProperty(_this, "docName", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: 'resource'
    });
    Object.defineProperty(_this, "id", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "externalIds", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "coords", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "resourceType", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "owner", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "groups", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "lastValue", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(_this, "lastReadingDatetime", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: new Date(0)
    });
    _this.orgId = orgId;
    _this.externalIds = externalIds;
    _this.coords = coords;
    _this.resourceType = resourceType;
    _this.owner = owner;
    _this.groups = groups;
    return _this;
  }

  _createClass(Resource, [{
    key: "serialize",
    value: function serialize() {
      return {
        id: this.id,
        orgId: this.orgId,
        externalIds: this.externalIds.serialize(),
        coords: this.coords,
        resourceType: this.resourceType,
        owner: this.owner,
        groups: (0, _utils.serializeMap)(this.groups),
        lastValue: this.lastValue,
        lastReadingDatetime: this.lastReadingDatetime,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
    /**
     * Deserialize from a json object
     */

  }], [{
    key: "deserialize",
    value: function deserialize(data) {
      var id = data.id,
          orgId = data.orgId,
          externalIds = data.externalIds,
          coords = data.coords,
          resourceType = data.resourceType,
          owner = data.owner,
          groups = data.groups,
          lastValue = data.lastValue,
          lastReadingDatetime = data.lastReadingDatetime,
          createdAt = data.createdAt,
          updatedAt = data.updatedAt; //Deserialize objects

      var resourceTypeObj = (0, _ResourceType.resourceTypeFromString)(resourceType);

      var externalIdsObj = _ResourceIdType.default.deserialize(externalIds);

      var des = new Resource(orgId, externalIdsObj, coords, resourceTypeObj, owner, groups); //private vars

      des.id = id;
      des.lastValue = lastValue;
      des.lastReadingDatetime = lastReadingDatetime;
      des.createdAt = createdAt;
      des.updatedAt = updatedAt;
      return des;
    }
    /**
     * Deserialize from a Firestore Document
     */

  }, {
    key: "fromDoc",
    value: function fromDoc(doc) {
      return this.deserialize(doc.data());
    }
    /**
     * getResource
     * 
     * Get the resource from an orgId and resourceId
     */

  }, {
    key: "getResource",
    value: function getResource(_ref) {
      var orgId = _ref.orgId,
          id = _ref.id,
          fs = _ref.fs;
      //TODO: make sure orgId is valid first
      return fs.collection('org').doc(orgId).collection('resource').doc(id).get().then(function (doc) {
        return Resource.fromDoc(doc);
      });
    }
  }]);

  return Resource;
}(_FirestoreDoc2.default);

exports.Resource = Resource;