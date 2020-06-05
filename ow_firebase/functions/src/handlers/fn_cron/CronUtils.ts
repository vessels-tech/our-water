
import { SyncFrequency } from '../../common/enums/SyncFrequency';
import { Sync } from '../../common/models/Sync';
import { snapshotToSyncList } from '../../common/utils';
import { SomeResult, makeError } from 'ow_common/lib/utils/AppProviderTypes';
import { makeSuccess } from '../../common/types/dep_AppProviderTypes';
import { backupBucketName } from '../../common/env';
import FirebaseApi from '../../common/apis/FirebaseApi';
const request = require('request-promise-native');


export default class CronUtils {

  /**
   * Get the eligible syncs
   */
  public static getSyncsForFrequency(orgId, fs, frequency: SyncFrequency): Array<Sync> {
    return fs.collection('org').document(orgId).collection('sync')
      .where('frequency', '==', frequency)
      .where('isOneTime', '==', false)
      .get()
      .then(sn => snapshotToSyncList(sn));
  }

  /**
   * Run a sync
   */
  public static triggerSync(sync: Sync): Promise<any> {
    


    return null;
  }


  /**
   * Perform the database backup
   */
  public static backupDatabase(accessToken: string): Promise<SomeResult<any>> {

    console.log("Performing Cloud Firestore Backup");

    // reference: https://firebase.google.com/docs/firestore/manage-data/export-import
    const url = `https://firestore.googleapis.com/v1beta1/projects/our-water/databases/(default):exportDocuments`
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      json: true,
      body: {
        outputUriPrefix: `gs://${backupBucketName}`,
      }
    };

    return request.post(url, options)
    .then(() => makeSuccess(undefined))
    .catch((err: Error) => makeError(err.message));
  }


  /**
   * Search firebase storage for backups that should be deleted
   * Note: not currently working
   */
  public static async getBackupsToExpire(storage: any, accessToken: string, backupDate: string): Promise<SomeResult<Array<string>>> {
    //format is: gs://${backupBucketName}/2019-01-12T04:55:04_75044/
    // const bucket = storage.bucket(`gs://${backupBucketName}`);
    const bucket = storage.bucket(`our-water-dev`);
    console.log("bucketname is", backupBucketName);

    // console.log("bucket is", bucket);

    const filesResult = await bucket.getFiles()
    console.log("filesResult", filesResult);
    




    return null;

  }

  /**
   * Expire old backups
   */
  public static deleteBackup(path: string): Promise<SomeResult<void>> {
    console.log("expiring Cloud Firestore Backup", path);

    return null;
  }

}