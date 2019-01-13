"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const request = require('request-promise-native');
const _backupServiceAccountKey_1 = require("./.backupServiceAccountKey");
const tools_1 = require("../../../tools");
const hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
    console.log("This job is ran every hour!");
    //TODO: where do we get the orgId from? Can't we just run all syncs for all orgs???
    // const syncs: [Sync] = CronUtils.getSyncsForFrequency(orgId, fs, SyncFrequency.Hourly);
    //TODO: lookup all syncs that need to be run every hour
    //Trigger new sync runs
    return true;
});
exports.hourly_job = hourly_job;
const daily_job = functions.pubsub.topic('daily-tick').onPublish((event) => __awaiter(this, void 0, void 0, function* () {
    console.log("This job is ran every day!");
    console.log("Performing Cloud Firestore Backup");
    const accessToken = yield tools_1.getBackupAccessToken(_backupServiceAccountKey_1.default);
    // reference: https://firebase.google.com/docs/firestore/manage-data/export-import
    const url = `https://firestore.googleapis.com/v1beta1/projects/our-water/databases/(default):exportDocuments`;
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        json: true,
        body: {
            outputUriPrefix: `gs://our-water-backup`,
        }
    };
    return request.post(url, options);
}));
exports.daily_job = daily_job;
const weekly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
    console.log("Cool");
    return true;
});
exports.weekly_job = weekly_job;
//# sourceMappingURL=cron.js.map