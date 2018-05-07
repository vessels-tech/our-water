
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
  * Create a new Sync in FireStore
  */
  public create({ fs }) {
    return fs.collection('org').doc(this.orgId)
      .collection('sync').add(this.serialize());

    //TODO: once created, add in the id, and perform a save
  }

  public save({ fs }) {
    //TODO: does this merge?
    return fs.collection('org').doc(this.orgId)
      .collection('sync').doc(this.id).save(this.serialize());
  }


  public serialize() {
    return {
      isOneTime: this.isOneTime,
      datasource: this.datasource.serialize(),
      orgId: this.orgId,
      methods: this.methods,
      lastSyncDate: new Date(this.lastSyncDate),
      selectedDatatypes: this.selectedDatatypes,
    }
  }

  /**
   * Deserialize from a snapshot
   * @param sn 
   */
  public static deserialize(sn) {
    const id = sn.id;
    const syncData = sn.data();

    //TODO: format
    console.log('deserialize Sync', id, syncData);
    return {id, ...syncData};
  }

  /**
   * getSync
   * 
   * Gets the sync from the organization and sync id
   */
  static async getSync({orgId, id, fs}) {
    return fs.collection('org').doc(orgId).collection('syncRun').doc(id).get()
      .then(sn => Sync.deserialize(sn));
  }
}