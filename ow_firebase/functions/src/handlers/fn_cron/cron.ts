
import * as functions from 'firebase-functions';
const request = require('request-promise-native');

import backupKey from './.backupServiceAccountKey';
import { getBackupAccessToken } from '../../../tools';

const hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
  console.log("This job is ran every hour!");

  //TODO: where do we get the orgId from? Can't we just run all syncs for all orgs???
  // const syncs: [Sync] = CronUtils.getSyncsForFrequency(orgId, fs, SyncFrequency.Hourly);

  //TODO: lookup all syncs that need to be run every hour
  //Trigger new sync runs

  return true;
});

const daily_job = functions.pubsub.topic('daily-tick').onPublish(async (event) => {
  console.log("This job is ran every day!")

  console.log("Performing Cloud Firestore Backup");
  const accessToken = await getBackupAccessToken(backupKey);
  const url = `https://firestore.googleapis.com/v1beta1/projects/our-water/databases/(default):exportDocuments`
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
});

const weekly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
  console.log("Cool")

  return true;
});

export {
  hourly_job,
  daily_job,
  weekly_job
}