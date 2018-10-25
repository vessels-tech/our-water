"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
    console.log("This job is ran every hour!");
    //TODO: where do we get the orgId from? Can't we just run all syncs for all orgs???
    // const syncs: [Sync] = CronUtils.getSyncsForFrequency(orgId, fs, SyncFrequency.Hourly);
    //TODO: lookup all syncs that need to be run every hour
    //Trigger new sync runs
});
exports.hourly_job = hourly_job;
const daily_job = functions.pubsub.topic('daily-tick').onPublish((event) => {
    console.log("This job is ran every day!");
});
exports.daily_job = daily_job;
const weekly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
    console.log("This job is ran every week!");
});
exports.weekly_job = weekly_job;
//# sourceMappingURL=cron.js.map