
import * as functions from 'firebase-functions';


import { getBackupAccessToken } from '../../../tools';
import CronUtils from './CronUtils';
import { ResultType } from 'ow_common/lib/utils/AppProviderTypes';
import { backupServiceAccountKeyFilename } from '../../common/env';
import { admin } from '../../common/apis/FirebaseAdmin';

//For some reason, we can't import these at runtime, so need to import all of them here.
import prodBackupKey from './.backupServiceAccountKey';
import devBackupKey from './.backupServiceAccountKey.development';

const hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
  console.log("This job is ran every hour!");

  //TODO: where do we get the orgId from? Can't we just run all syncs for all orgs???
  // const syncs: [Sync] = CronUtils.getSyncsForFrequency(orgId, fs, SyncFrequency.Hourly);

  //TODO: lookup all syncs that need to be run every hour
  //Trigger new sync runs

  return true;
});

const daily_job = functions.pubsub.topic('daily-tick').onPublish(async (event) => {
  console.log("HELLO");
  let backupKey = prodBackupKey;
  if (backupServiceAccountKeyFilename.indexOf('development') > -1) {
    backupKey = devBackupKey;
  }

  console.log("backupKey is", backupKey);

  const accessToken = await getBackupAccessToken(backupKey);

  //TODO: figure out an expiry date
  const expiryDate = "!234";

  //TODO: figure out how to separate these into different functions?
  return Promise.all([
    CronUtils.backupDatabase(accessToken)
      .catch((err: Error) => console.warn("Error backing up db", err)),

    // CronUtils.getBackupsToExpire(admin.storage(), accessToken, expiryDate)
    // .then((result) => {
    //   if (result.type === ResultType.ERROR) {
    //     console.warn(result.message);
    //     return;
    //   }
    //   return Promise.all(result.result.map((path) => CronUtils.deleteBackup(path)));
    // })
    // .catch((err: Error) => console.warn("Error deleting backups", err))
  ]);  
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