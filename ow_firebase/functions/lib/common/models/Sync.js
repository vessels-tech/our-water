"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sync = void 0;

var _Datasource = require("./Datasources/Datasource");

var _utils = require("../utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Sync =
/*#__PURE__*/
function () {
  //unix timestamp 
  function Sync(isOneTime, datasource, orgId, methods, frequency) {
    _classCallCheck(this, Sync);

    Object.defineProperty(this, "id", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "isOneTime", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "datasource", {
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
    Object.defineProperty(this, "methods", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "frequency", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "lastSyncDate", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: 0
    });
    this.isOneTime = isOneTime;
    this.datasource = datasource;
    this.orgId = orgId;
    this.methods = methods;
    this.frequency = frequency;
  }
  /**
  * Create a new Sync in FireStore
  */


  _createClass(Sync, [{
    key: "create",
    value: function create(_ref) {
      var fs = _ref.fs;
      var newRef = fs.collection('org').doc(this.orgId).collection('sync').doc();
      this.id = newRef.id;
      return this.save({
        fs: fs
      });
    }
  }, {
    key: "save",
    value: function save(_ref2) {
      var _this = this;

      var fs = _ref2.fs;
      return fs.collection('org').doc(this.orgId).collection('sync').doc(this.id).set(this.serialize()).then(function (ref) {
        return _this;
      });
    }
  }, {
    key: "delete",
    value: function _delete(_ref3) {
      var fs = _ref3.fs;
      return fs.collection('org').doc(this.orgId).collection('sync').doc(this.id).delete();
    }
  }, {
    key: "serialize",
    value: function serialize() {
      return {
        id: this.id,
        isOneTime: this.isOneTime,
        datasource: this.datasource.serialize(),
        orgId: this.orgId,
        methods: this.methods,
        lastSyncDate: new Date(this.lastSyncDate),
        frequency: this.frequency
      };
    }
    /**
     * Deserialize from a json object
     */

  }], [{
    key: "deserialize",
    value: function deserialize(data) {
      var id = data.id,
          isOneTime = data.isOneTime,
          datasource = data.datasource,
          orgId = data.orgId,
          methods = data.methods,
          lastSyncDate = data.lastSyncDate,
          frequency = data.frequency;
      var syncMethods = []; //TODO deserialize somehow

      var des = new Sync(isOneTime, (0, _Datasource.deserializeDatasource)(datasource), orgId, syncMethods, frequency); //private vars

      des.lastSyncDate = lastSyncDate;
      des.id = id;
      return des;
    }
    /**
     * Deserialize from a snapshot
     * @param sn 
     */

  }, {
    key: "fromDoc",
    value: function fromDoc(sn) {
      return this.deserialize(sn.data());
    }
    /**
     * getSyncs
     * 
     * Get a list of the syncs for an org
     */

  }, {
    key: "getSyncs",
    value: function getSyncs(orgId, fs) {
      return fs.collection('org').doc(orgId).collection('sync').get().then(function (sn) {
        return (0, _utils.snapshotToSyncList)(sn);
      });
    }
    /**
     * getSync
     * 
     * Gets the sync from the organization and sync id
     */

  }, {
    key: "getSync",
    value: function getSync(_ref4) {
      var orgId = _ref4.orgId,
          id = _ref4.id,
          fs = _ref4.fs;
      //TODO: This hangs on the 2nd time for some reason...
      return fs.collection('org').doc(orgId).collection('sync').doc(id).get().then(function (doc) {
        return Sync.fromDoc(doc);
      });
    }
  }]);

  return Sync;
}();

exports.Sync = Sync;