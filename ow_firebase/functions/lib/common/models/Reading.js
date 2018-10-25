"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Reading = void 0;

var _ResourceType = require("../enums/ResourceType");

var _FirestoreDoc2 = _interopRequireDefault(require("./FirestoreDoc"));

var _utils = require("../utils");

var _ResourceIdType = _interopRequireDefault(require("../types/ResourceIdType"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Reading =
/*#__PURE__*/
function (_FirestoreDoc) {
  _inherits(Reading, _FirestoreDoc);

  //simple dict with key of GroupId, value of true
  function Reading(orgId, resourceId, coords, resourceType, groups, datetime, value, externalIds) {
    var _this;

    _classCallCheck(this, Reading);

    _this = _possibleConstructorReturn(this, (Reading.__proto__ || Object.getPrototypeOf(Reading)).call(this));
    Object.defineProperty(_this, "docName", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: 'reading'
    });
    Object.defineProperty(_this, "id", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "resourceId", {
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
    Object.defineProperty(_this, "groups", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "datetime", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "value", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, "isLegacy", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    _this.orgId = orgId;
    _this.resourceId = resourceId;
    _this.coords = coords;
    _this.resourceType = resourceType;
    _this.groups = groups;
    _this.datetime = datetime;
    _this.value = value;
    _this.externalIds = externalIds;
    return _this;
  }
  /**
   * Create a reading from legacy data
   * we put in empty fields, as they will be filled in later by a batch job
   */


  _createClass(Reading, [{
    key: "serialize",
    value: function serialize() {
      //Required fields:
      var serialized = {
        id: this.id,
        docName: this.docName,
        orgId: this.orgId,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        resourceType: this.resourceType,
        datetime: this.datetime,
        value: this.value //optional params

      };

      if (this.resourceId) {
        serialized['resourceId'] = this.resourceId;
      }

      if (this.externalIds) {
        serialized['externalIds'] = this.externalIds.serialize();
      }

      if (this.coords) {
        serialized['coords'] = this.coords;
      }

      if (this.groups) {
        serialized['groups'] = (0, _utils.serializeMap)(this.groups);
      }

      if (this.isLegacy) {
        serialized['isLegacy'] = this.isLegacy;
      }

      return serialized;
    }
    /**
      * Deserialize from a document
      * @param sn 
      */

  }], [{
    key: "legacyReading",
    value: function legacyReading(orgId, resourceType, datetime, value, externalIds) {
      var resourceId = '-1';
      var coords = null;
      var reading = new Reading(orgId, null, null, resourceType, null, datetime, value, externalIds);
      reading.isLegacy = true;
      return reading;
    }
  }, {
    key: "deserialize",
    value: function deserialize(doc) {
      var _doc$data = doc.data(),
          docName = _doc$data.docName,
          orgId = _doc$data.orgId,
          createdAt = _doc$data.createdAt,
          updatedAt = _doc$data.updatedAt,
          datetime = _doc$data.datetime,
          value = _doc$data.value,
          resourceId = _doc$data.resourceId,
          groups = _doc$data.groups,
          isLegacy = _doc$data.isLegacy,
          resourceType = _doc$data.resourceType,
          externalIds = _doc$data.externalIds,
          coords = _doc$data.coords; //nested variables


      var resourceTypeObj = (0, _ResourceType.resourceTypeFromString)(resourceType);

      var externalIdsObj = _ResourceIdType.default.deserialize(externalIds);

      var des = new Reading(orgId, resourceId, coords, resourceTypeObj, groups, datetime, value, externalIdsObj); //private vars

      des.id = des.id;
      des.docName = docName;
      des.createdAt = createdAt;
      des.updatedAt = updatedAt;
      des.isLegacy = isLegacy;
      return des;
    }
  }]);

  return Reading;
}(_FirestoreDoc2.default);

exports.Reading = Reading;