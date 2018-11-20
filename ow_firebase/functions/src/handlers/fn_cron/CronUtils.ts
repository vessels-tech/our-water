
import { SyncFrequency } from '../../common/enums/SyncFrequency';
import { Sync } from '../../common/models/Sync';
import { snapshotToSyncList } from '../../common/utils';

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
}