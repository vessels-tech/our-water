import Datasource, { deserializeDatasource } from './Datasources/Datasource';
import { SyncMethod } from '../enums/SyncMethod';
import SyncDataSourceOptions from '../types/SyncDataSourceOptions';

export class Sync {

  id: string
  isOneTime: boolean
  datasource: Datasource
  orgId: string
  methods: Array<SyncMethod>
  selectedDatatypes: Array<string>
  
  lastSyncDate: number = 0 //unix timestamp 

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
  public create({ fs }): Promise<Sync> {
    const newRef = fs.collection('org').doc(this.orgId)
      .collection('sync').doc();
      this.id = newRef.id;

      return this.save({fs});
  }

  public save({ fs }): Promise<Sync> {

    return fs.collection('org').doc(this.orgId).collection('sync').doc(this.id)
      .set(this.serialize())
      .then(ref => {
        return this;
      });
  }


  public serialize(): any {
    return {
      id: this.id,
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
  public static deserialize(sn): Sync {
    const {
      isOneTime,
      datasource,
      orgId,
      methods,
      lastSyncDate,
      selectedDatatypes,
    } = sn.data();
    
    const syncMethods: Array<SyncMethod> = []; //TODO deserialize somehow
    const des: Sync = new Sync(isOneTime, deserializeDatasource(datasource), orgId, syncMethods, selectedDatatypes);

    //private vars
    des.lastSyncDate = lastSyncDate;
    des.id = sn.id;

    return des;
  }

  /**
   * getSync
   * 
   * Gets the sync from the organization and sync id
   */
  static getSync({ orgId, id, fs }): Promise<Sync> {
    //TODO: This hangs on the 2nd time for some reason...
    return fs.collection('org').doc(orgId).collection('sync').doc(id).get()
      .then(sn => Sync.deserialize(sn));
  }
}