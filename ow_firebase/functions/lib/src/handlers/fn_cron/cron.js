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
/**
 *
 

 const projectId = 'PROJECT_ID'
  const getAccessToken = new Promise(function (resolve, reject) {
    const scopes = ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform']
    const key = require(`./${projectId}.json`)
    const jwtClient = new google.auth.JWT(
      key.client_email,
      undefined,
      key.private_key,
      scopes,
      undefined
    )
    const authorization = new Promise(function (resolve, reject) {
      return jwtClient.authorize().then((value) => {
        return resolve(value)
      })
    })
    return authorization.then(function (value) {
      return resolve(value.access_token)
    })
  })
  return getAccessToken.then(function (accessToken) {
    const url = `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default):exportDocuments`
    return rp.post(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      json: true,
      body: {
        outputUriPrefix: `gs://${projectId}-backups`
      }
    })
  })


 */
const daily_job = functions.pubsub.topic('daily-tick').onPublish((event) => __awaiter(this, void 0, void 0, function* () {
    console.log("This job is ran every day!");
    //TODO: perform backup
    const accessToken = yield tools_1.getBackupAccessToken();
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
    console.log("This job is ran every week");
    return true;
});
exports.weekly_job = weekly_job;
//# sourceMappingURL=cron.js.map