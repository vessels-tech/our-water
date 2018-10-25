"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.weekly_job = exports.daily_job = exports.hourly_job = void 0;

var functions = _interopRequireWildcard(require("firebase-functions"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var hourly_job = functions.pubsub.topic('hourly-tick').onPublish(function (event) {
  console.log("This job is ran every hour!"); //TODO: where do we get the orgId from? Can't we just run all syncs for all orgs???
  // const syncs: [Sync] = CronUtils.getSyncsForFrequency(orgId, fs, SyncFrequency.Hourly);
  //TODO: lookup all syncs that need to be run every hour
  //Trigger new sync runs
});
exports.hourly_job = hourly_job;
var daily_job = functions.pubsub.topic('daily-tick').onPublish(function (event) {
  console.log("This job is ran every day!");
});
exports.daily_job = daily_job;
var weekly_job = functions.pubsub.topic('weekly-tick').onPublish(function (event) {
  console.log("This job is ran every week!");
});
exports.weekly_job = weekly_job;