
import { Datasource } from './Datasource';
import { SyncMethod } from '../enums/SyncMethod';

export class Sync {

  id: string
  isOneTime: boolean
  datasource: Datasource
  orgId: string
  methods: Array<SyncMethod>
  lastSyncDate: number = 0 //unix timestamp 
  selectedDatatypes: Array<string>

  constructor(isOneTime: boolean, datasource: Datasource, orgId: string,
    methods: Array<SyncMethod>, selectedDatatypes: Array<string>
  ) {
    this.isOneTime = isOneTime;
    this.datasource = datasource;
    this.orgId = orgId;
    this.methods = methods;
    this.selectedDatatypes = selectedDatatypes;
  }

  /**
   * Persist the Sync to cloud firestore
   * @returns Promise<result>
   */
  save(fs) {
    //TODO: we probably need to serialize this properly

    return fs.collection('org').doc(this.orgId).collection('sync').add(this);
  }


  /**
   * getSync
   * 
   * Gets the sync from the organization and sync id
   */
  static async getSync({orgId, id, fs}) {
    return fs.collection('org').doc(orgId).collection('syncRun').doc(id);
  }
}