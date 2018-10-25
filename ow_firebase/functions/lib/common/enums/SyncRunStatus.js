"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyncRunStatus = void 0;
var SyncRunStatus;
exports.SyncRunStatus = SyncRunStatus;

(function (SyncRunStatus) {
  SyncRunStatus[SyncRunStatus["pending"] = 'pending'] = "pending";
  SyncRunStatus[SyncRunStatus["running"] = 'running'] = "running";
  SyncRunStatus[SyncRunStatus["finished"] = 'finished'] = "finished";
  SyncRunStatus[SyncRunStatus["failed"] = 'failed'] = "failed";
})(SyncRunStatus || (exports.SyncRunStatus = SyncRunStatus = {}));