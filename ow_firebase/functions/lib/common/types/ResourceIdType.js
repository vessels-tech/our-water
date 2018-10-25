"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ResourceIdType =
/*#__PURE__*/
function () {
  function ResourceIdType() {
    _classCallCheck(this, ResourceIdType);

    Object.defineProperty(this, "legacyMyWellId", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "hasLegacyMyWellId", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "legacyMyWellResourceId", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "hasLegacyMyWellResourceId", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "legacyMyWellVillageId", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "hasLegacyMyWellVillageId", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "legacyMyWellPincode", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "hasLegacyMyWellPincode", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: false
    });
  }

  _createClass(ResourceIdType, [{
    key: "getMyWellId",

    /**
     * Get the generic Id string.
     * Could be for a pincode, village, resource or reading
     */
    value: function getMyWellId() {
      if (!this.hasLegacyMyWellId) {
        throw new Error('Tried to getMyWellId, but resource has no myWellId');
      }

      return this.legacyMyWellId;
    }
    /**
    * Parse the legacyMyWellResourceId, get the resourceId
    * throws if there is no legacyMyWellResourceId
    */

  }, {
    key: "getResourceId",
    value: function getResourceId() {
      if (!this.hasLegacyMyWellResourceId) {
        throw new Error('tried to getResourceId, but resource has no resourceId');
      }

      return parseInt(this.legacyMyWellResourceId);
    }
    /**
     * Parse the legacyMyWellResourceId, get the villageId
     * throws if there is no legacyMyWellResourceId
     */

  }, {
    key: "getVillageId",
    value: function getVillageId() {
      if (!this.hasLegacyMyWellVillageId) {
        throw new Error('tried to getVillageId, but could not find legacyMyWellVillageId.');
      }

      return parseInt(this.legacyMyWellVillageId);
    }
    /**
     * Parse the legacyMyWellResourceId, get postcode
     */

  }, {
    key: "getPostcode",
    value: function getPostcode() {
      if (!this.hasLegacyMyWellPincode) {
        throw new Error('tried to getPostcode, but could not find legacyMyWellPincode.');
      }

      return parseInt(this.legacyMyWellPincode);
    }
  }, {
    key: "serialize",
    value: function serialize() {
      return JSON.parse(JSON.stringify(this));
    }
  }], [{
    key: "none",
    //Add other bits and pieces here as needed
    value: function none() {
      return new ResourceIdType();
    }
    /**
     * When we create a resource in OW, and want to sync it to LegacyMyWell, 
     * it MUST have a postcode and villageId,  and NOT have a MyWellId
     */

  }, {
    key: "newOWResource",
    value: function newOWResource(pincode) {
      var legacyId = new ResourceIdType();
      legacyId.legacyMyWellPincode = "".concat(pincode);
      legacyId.hasLegacyMyWellPincode = true;
      legacyId.legacyMyWellVillageId = "11";
      legacyId.hasLegacyMyWellVillageId = true;
      return legacyId;
    }
  }, {
    key: "fromLegacyPincode",
    value: function fromLegacyPincode(pincode) {
      var legacyId = new ResourceIdType();
      legacyId.legacyMyWellPincode = "".concat(pincode);
      legacyId.hasLegacyMyWellPincode = true;
      legacyId.legacyMyWellId = "".concat(pincode);
      legacyId.hasLegacyMyWellId = true;
      return legacyId;
    }
  }, {
    key: "fromLegacyVillageId",
    value: function fromLegacyVillageId(pincode, villageId) {
      var legacyId = new ResourceIdType();
      legacyId.legacyMyWellId = "".concat(pincode, ".").concat(villageId);
      legacyId.hasLegacyMyWellId = true;
      legacyId.legacyMyWellPincode = "".concat(pincode);
      legacyId.hasLegacyMyWellPincode = true;
      legacyId.legacyMyWellVillageId = "".concat(villageId);
      legacyId.hasLegacyMyWellVillageId = true;
      return legacyId;
    }
  }, {
    key: "fromLegacyMyWellId",
    value: function fromLegacyMyWellId(pincode, resourceId) {
      var legacyId = new ResourceIdType();
      legacyId.legacyMyWellId = "".concat(pincode, ".").concat(resourceId);
      legacyId.hasLegacyMyWellId = true;
      legacyId.legacyMyWellPincode = "".concat(pincode);
      legacyId.hasLegacyMyWellPincode = true;
      legacyId.legacyMyWellVillageId = "".concat(resourceId).substring(0, 2);
      legacyId.hasLegacyMyWellVillageId = true;
      legacyId.legacyMyWellResourceId = "".concat(resourceId);
      legacyId.hasLegacyMyWellResourceId = true;
      return legacyId;
    }
  }, {
    key: "fromLegacyReadingId",
    value: function fromLegacyReadingId(id, pincode, resourceId) {
      var legacyId = new ResourceIdType();
      legacyId.legacyMyWellId = "".concat(id); //identifies this specific reading

      legacyId.hasLegacyMyWellId = true;
      legacyId.legacyMyWellPincode = "".concat(pincode);
      legacyId.hasLegacyMyWellPincode = true;
      legacyId.legacyMyWellVillageId = "".concat(resourceId).substring(0, 2);
      legacyId.hasLegacyMyWellVillageId = true;
      legacyId.legacyMyWellResourceId = "".concat(resourceId); //identifies the reading's resource id

      legacyId.hasLegacyMyWellResourceId = true; //identified that the reading is linked to an external datasource

      return legacyId;
    }
  }, {
    key: "deserialize",
    value: function deserialize(obj) {
      var resourceIdType = new ResourceIdType();
      Object.keys(obj).forEach(function (key) {
        resourceIdType[key] = obj[key];
      });
      return resourceIdType;
    }
  }]);

  return ResourceIdType;
}();

exports.default = ResourceIdType;