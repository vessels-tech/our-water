import * as functions from 'firebase-functions';
import { getBackupAccessToken } from '../../../tools';
import CronUtils from './CronUtils';
import { backupServiceAccountKeyFilename } from '../../common/env';
import { firestore } from '../../common/apis/FirebaseAdmin';

//For some reason, we can't import these at runtime, so need to import all of them here.
import prodBackupKey from './.backupServiceAccountKey';
import devBackupKey from './.backupServiceAccountKey.development';


const hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
  console.log("hourly-job running");
  return true;
});

const daily_job = functions.pubsub.topic('daily-tick').onPublish(async (event) => {
  let backupKey = prodBackupKey;
  if (backupServiceAccountKeyFilename.indexOf('development') > -1) {
    backupKey = devBackupKey;
  }

  const accessToken = await getBackupAccessToken(backupKey);

  /* Individual daily jobs */
  return Promise.all([
    CronUtils.backupDatabase(accessToken)
      .catch((err: Error) => console.warn("Error backing up db", err)),
    CronUtils.sendDailyEmail(firestore, 'mywell')
      .catch((err: Error) => console.warn("Error sending daily email ", err)),
  ]);  
});

const weekly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
  console.log("weekly-job running")

  return true;
});


export {
  hourly_job,
  daily_job,
  weekly_job
}