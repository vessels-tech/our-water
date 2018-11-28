
import * as functions from 'firebase-functions';

import { firestore } from '../../common/apis/FirebaseAdmin';
import { Sync } from '../../common/models/Sync';
import CronUtils from './CronUtils';
import { SyncFrequency } from '../../common/enums/SyncFrequency';

const hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
  console.log("This job is ran every hour!");

  //TODO: where do we get the orgId from? Can't we just run all syncs for all orgs???
  // const syncs: [Sync] = CronUtils.getSyncsForFrequency(orgId, fs, SyncFrequency.Hourly);

  //TODO: lookup all syncs that need to be run every hour
  //Trigger new sync runs
});

const daily_job = functions.pubsub.topic('daily-tick').onPublish((event) => {
  console.log("This job is ran every day!")
});

const weekly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
  console.log("This job is ran every week!")
});



export {
  hourly_job,
  daily_job,
  weekly_job
}