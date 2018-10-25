"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultSyncRunResult = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DefaultSyncRunResult = function DefaultSyncRunResult() {
  _classCallCheck(this, DefaultSyncRunResult);

  Object.defineProperty(this, "results", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: []
  });
  Object.defineProperty(this, "warnings", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: []
  });
  Object.defineProperty(this, "errors", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: []
  });
};

exports.DefaultSyncRunResult = DefaultSyncRunResult;