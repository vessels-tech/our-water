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
const tools_1 = require("../../../tools");
const CronUtils_1 = require("./CronUtils");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const env_1 = require("../../common/env");
const backupKey = require(`${env_1.backupServiceAccountKeyFilename}`);
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
    const accessToken = yield tools_1.getBackupAccessToken(backupKey);
    //TODO: figure out an expiry date
    const expiryDate = "!234";
    //TODO: figure out how to separate these into different functions?
    return Promise.all([
        CronUtils_1.default.backupDatabase(accessToken)
            .catch((err) => console.warn("Error backing up db", err)),
        CronUtils_1.default.getBackupsToExpire(accessToken, expiryDate)
            .then((result) => {
            if (result.type === AppProviderTypes_1.ResultType.ERROR) {
                console.warn(result.message);
                return;
            }
            return Promise.all(result.result.map((path) => CronUtils_1.default.deleteBackup(path)));
        })
            .catch((err) => console.warn("Error deleting backups", err))
    ]);
}));
exports.daily_job = daily_job;
const weekly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
    console.log("Cool");
    return true;
});
exports.weekly_job = weekly_job;
//# sourceMappingURL=cron.js.map