import Datasource, { deserializeDatasource } from './Datasources/Datasource';
import { SyncMethod } from '../enums/SyncMethod';
import SyncDataSourceOptions from '../types/SyncDataSourceOptions';
import { SyncFrequency } from '../enums/SyncFrequency';

export class Sync {

  id: string
  isOneTime: boolean
  datasource: Datasource
  orgId: string
  methods: Array<SyncMethod>
  frequency: SyncFrequency
  
  lastSyncDate: number = 0 //unix timestamp 

  constructor(isOneTime: boolean, datasource: Datasource, orgId: string,
    methods: Array<SyncMethod>, frequency: SyncFrequency
  ) {
    this.isOneTime = isOneTime;
    this.datasource = datasource;
    this.orgId = orgId;
    this.methods = methods;
    this.frequency = frequency;
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
      frequency: this.frequency.toString(),
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
      frequency,
    } = sn.data();
    
    const syncMethods: Array<SyncMethod> = []; //TODO deserialize somehow
    const des: Sync = new Sync(isOneTime, deserializeDatasource(datasource), orgId, syncMethods, frequency);

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