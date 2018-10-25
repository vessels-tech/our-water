"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("../common/utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CronUtils =
/*#__PURE__*/
function () {
  function CronUtils() {
    _classCallCheck(this, CronUtils);
  }

  _createClass(CronUtils, null, [{
    key: "getSyncsForFrequency",

    /**
     * Get the eligible syncs
     */
    value: function getSyncsForFrequency(orgId, fs, frequency) {
      return fs.collection('org').document(orgId).collection('sync').where('frequency', '==', frequency).where('isOneTime', '==', false).get().then(function (sn) {
        return (0, _utils.snapshotToSyncList)(sn);
      });
    }
    /**
     * Run a sync
     */

  }, {
    key: "triggerSync",
    value: function triggerSync(sync) {
      return null;
    }
  }]);

  return CronUtils;
}();

exports.default = CronUtils;