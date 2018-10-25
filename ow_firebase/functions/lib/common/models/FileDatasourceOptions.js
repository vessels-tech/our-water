"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FileDatasourceOptions =
/*#__PURE__*/
function () {
  function FileDatasourceOptions() {
    _classCallCheck(this, FileDatasourceOptions);

    Object.defineProperty(this, "includesHeadings", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "usesLegacyMyWellIds", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: false
    });
  }

  _createClass(FileDatasourceOptions, [{
    key: "serialize",
    value: function serialize() {
      return {
        includesHeadings: this.includesHeadings,
        usesLegacyMyWellIds: this.usesLegacyMyWellIds
      };
    } //note:We can't make a deserializable interface, as this must be a static method

  }], [{
    key: "deserialize",
    value: function deserialize(object) {
      var des = new FileDatasourceOptions();
      des.includesHeadings = object.includesHeadings;
      des.usesLegacyMyWellIds = object.usesLegacyMyWellIds;
      return des;
    }
  }]);

  return FileDatasourceOptions;
}();

exports.default = FileDatasourceOptions;