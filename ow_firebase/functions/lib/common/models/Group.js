"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Group = void 0;

var _util = require("util");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Group =
/*#__PURE__*/
function () {
  function Group(name, orgId, type, coords, externalIds) {
    _classCallCheck(this, Group);

    Object.defineProperty(this, "id", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "orgId", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "name", {
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
    Object.defineProperty(this, "coords", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "externalIds", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "createdAt", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "updatedAt", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    this.name = name;
    this.orgId = orgId;
    this.type = type;
    this.coords = coords;
    this.externalIds = externalIds;
  }

  _createClass(Group, [{
    key: "create",
    value: function create(_ref) {
      var fs = _ref.fs;
      var newRef = fs.collection('org').doc(this.orgId).collection('group').doc();
      this.id = newRef.id;
      this.createdAt = new Date();
      return this.save({
        fs: fs
      });
    }
  }, {
    key: "save",
    value: function save(_ref2) {
      var _this = this;

      var fs = _ref2.fs;

      if (!this.id) {
        throw new Error('Tried to save, but object has not been created yet. Use create() instead.');
      }

      this.updatedAt = new Date();
      return fs.collection('org').doc(this.orgId).collection('group').doc(this.id).set(this.serialize()).then(function (ref) {
        return _this;
      });
    }
  }, {
    key: "serialize",
    value: function serialize() {
      var base = {
        id: this.id,
        name: this.name,
        type: this.type,
        coords: this.coords,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }; //TODO: this is less than ideal

      if (this.externalIds) {
        var serializedExternalId = null;

        try {
          serializedExternalId = this.externalIds.serialize();

          if (!(0, _util.isNullOrUndefined)(serializedExternalId.legacyMyWellId)) {
            base['externalIds'] = serializedExternalId;
          }
        } catch (err) {
          console.log("Error", err);
        }
      }

      return base;
    }
  }], [{
    key: "saveBulkGroup",
    value: function saveBulkGroup(fs, groups) {
      return Promise.resolve([]);
    }
  }]);

  return Group;
}();

exports.Group = Group;