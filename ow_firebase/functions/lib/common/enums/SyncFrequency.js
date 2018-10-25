"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyncFrequencyList = exports.SyncFrequency = void 0;
var SyncFrequency;
exports.SyncFrequency = SyncFrequency;

(function (SyncFrequency) {
  SyncFrequency[SyncFrequency["Hourly"] = 'hourly'] = "Hourly";
  SyncFrequency[SyncFrequency["Daily"] = 'daily'] = "Daily";
  SyncFrequency[SyncFrequency["Weekly"] = 'weekly'] = "Weekly";
})(SyncFrequency || (exports.SyncFrequency = SyncFrequency = {}));

;
var SyncFrequencyList = Object.keys(SyncFrequency).map(function (key) {
  return SyncFrequency[key];
});
exports.SyncFrequencyList = SyncFrequencyList;