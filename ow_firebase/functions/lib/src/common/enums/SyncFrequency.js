"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncFrequencyList = exports.SyncFrequency = void 0;
var SyncFrequency;
(function (SyncFrequency) {
    SyncFrequency["Hourly"] = "hourly";
    SyncFrequency["Daily"] = "daily";
    SyncFrequency["Weekly"] = "weekly";
})(SyncFrequency = exports.SyncFrequency || (exports.SyncFrequency = {}));
;
exports.SyncFrequencyList = Object.keys(SyncFrequency).map(key => SyncFrequency[key]);
//# sourceMappingURL=SyncFrequency.js.map