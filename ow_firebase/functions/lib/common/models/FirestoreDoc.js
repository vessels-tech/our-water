"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FirestoreDoc =
/*#__PURE__*/
function () {
  function FirestoreDoc() {
    _classCallCheck(this, FirestoreDoc);

    Object.defineProperty(this, "docName", {
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
    Object.defineProperty(this, "id", {
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
  }

  _createClass(FirestoreDoc, [{
    key: "create",
    value: function create(_ref) {
      var fs = _ref.fs;
      var newRef = fs.collection('org').doc(this.orgId).collection(this.docName).doc();
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
      this.updatedAt = new Date();
      return fs.collection('org').doc(this.orgId).collection(this.docName).doc(this.id).set(this.serialize()).then(function (ref) {
        return _this;
      });
    }
  }]);

  return FirestoreDoc;
}();

exports.default = FirestoreDoc;