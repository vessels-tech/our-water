"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const tools_1 = require("../../../tools");
const CronUtils_1 = require("./CronUtils");
const env_1 = require("../../common/env");
const FirebaseAdmin_1 = require("../../common/apis/FirebaseAdmin");
//For some reason, we can't import these at runtime, so need to import all of them here.
const _backupServiceAccountKey_1 = require("./.backupServiceAccountKey");
const _backupServiceAccountKey_development_1 = require("./.backupServiceAccountKey.development");
const hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
    console.log("hourly-job running");
    return true;
});
exports.hourly_job = hourly_job;
const daily_job = functions.pubsub.topic('daily-tick').onPublish((event) => __awaiter(void 0, void 0, void 0, function* () {
    let backupKey = _backupServiceAccountKey_1.default;
    if (env_1.backupServiceAccountKeyFilename.indexOf('development') > -1) {
        backupKey = _backupServiceAccountKey_development_1.default;
    }
    const accessToken = yield tools_1.getBackupAccessToken(backupKey);
    /* Individual daily jobs */
    return Promise.all([
        CronUtils_1.default.backupDatabase(accessToken)
            .catch((err) => console.warn("Error backing up db", err)),
        CronUtils_1.default.sendDailyEmail(FirebaseAdmin_1.firestore, 'mywell')
            .catch((err) => console.warn("Error sending daily email ", err)),
    ]);
}));
exports.daily_job = daily_job;
const weekly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
    console.log("weekly-job running");
    return true;
});
exports.weekly_job = weekly_job;
//# sourceMappingURL=cron.js.map