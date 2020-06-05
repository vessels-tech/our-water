import * as functions from 'firebase-functions';
import { getBackupAccessToken } from '../../../tools';
import CronUtils from './CronUtils';
import { backupServiceAccountKeyFilename, shouldBackupFirebaseOnCron } from '../../common/env';
import { firestore } from '../../common/apis/FirebaseAdmin';

//For some reason, we can't import these at runtime, so need to import all of them here.
import prodBackupKey from './.backupServiceAccountKey';
import devBackupKey from './.backupServiceAccountKey.development';


const hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
  console.log("hourly-job running");
  return true;
});

const daily_job = functions.pubsub.topic('daily-tick').onPublish(async (event) => {
  console.log("daily job")

  CronUtils.sendDailyEmail(firestore, 'mywell')
    .catch((err: Error) => console.warn("Error sending daily email ", err))
});

/**
 * @function trigger_backup_job
 * @description Backup the entire firebase database based on `cron.yaml` in functions-cron
 *  Note: This doesn't expire past backups. Expiry must be done manually
 */
const trigger_backup_job = functions.pubsub.topic('trigger-backup').onPublish(async (event) => {
  if (!shouldBackupFirebaseOnCron) {
    console.log('should_backup_firebase_on_cron is false. Not backing up the database.')
  }

  let backupKey = prodBackupKey;
  if (backupServiceAccountKeyFilename.indexOf('development') > -1) {
    backupKey = devBackupKey;
  }

  const accessToken = await getBackupAccessToken(backupKey);

  /* Individual daily jobs */
  return Promise.all([
    CronUtils.backupDatabase(accessToken)
      .catch((err: Error) => console.warn("Error backing up db", err)),
  ]);
});

const weekly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
  console.log("weekly-job running")

  return true;
});


export {
  hourly_job,
  daily_job,
  weekly_job,
  trigger_backup_job
}