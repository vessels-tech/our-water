import * as moment from 'moment';
// const moment = require('moment');

import { SyncRunStatus } from "../enums/SyncRunStatus";
import { SyncMethod } from "../enums/SyncMethod";
import { Sync } from './Sync';
import { snapshotToSyncRunList } from '../utils';
import { WarningType } from './Datasources/LegacyMyWellDatasource';

/**
 * A Sync run is a single run of a single sync method.
 * When a sync is triggered, a run is created.
 * 
 * Runs start in a `pending` state, when it is running, it will move 
 * to a `running` status,  and then move to `error` or `success`
 * SyncRuns will eventually have subscribers which are notified
 * when a run fails or succeeds for any reason.
 * 
 * For now, we will just log to console when this happens
 * 
 */

export class SyncRun {
  id: string //auto generated by Cloudstore
  orgId: string
  syncId: string
  // we need a sync method + sync verb maybe...
  syncMethod: SyncMethod
  subscribers: Array<string> //array of email addresses

  startedAt: number = 0  //unix timestamp
  finishedAt: number = 0 //unix timestamp
  status: SyncRunStatus = SyncRunStatus.pending
  results: Array<string> = []
  warnings: Array<string> = []
  errors: Array<string> = []


  //TODO: constructor or builder

  constructor(orgId: string, syncId: string, syncMethod: SyncMethod, subscribers: Array<string>) {
    this.orgId = orgId;
    this.syncId = syncId;
    this.syncMethod = syncMethod;
    this.subscribers = subscribers;
  }

  /**
   * Run the syncRun
   * @param param0 
   */
  public async run({ firestore }): Promise<SyncRun> {
    if (this.status !== SyncRunStatus.pending) {
      throw new Error(`SyncRun can only be run when in a pending state. Found state: ${this.status}`);
    }

    this.startedAt = moment().valueOf();
    console.log("startedAt", this.startedAt);
    this.status = SyncRunStatus.running;
    const sync: Sync = await Sync.getSync({orgId: this.orgId, id: this.syncId, firestore });

    console.log("SyncRun.run: running sync:", sync);

    if (!sync) {
      this.errors.push(`Could not find sync with SyncId: ${this.syncId}`);
      return this.abortSync({ firestore});
    }
    
    //set the state to running
    await this.save({ firestore});

    switch(this.syncMethod) {
      //call the datasource methods, but don't commit anything to the database
      case SyncMethod.validate:
        try {
          console.log("SyncRun.run running validate sync");
          //TODO: change this to use the a validate method instead
          const validationResult = await sync.datasource.validate(this.orgId, firestore);
          this.results = validationResult.results;
          this.warnings = validationResult.warnings;
          
        } catch (error) {
          console.log('error', error);
          this.errors.push(error.message);
        }

      break;

      //Pull from the external datasource, and save to db
      case SyncMethod.pullFrom:
        console.log("SyncRun.run running pullFrom sync");

        //TODO: Overhaul the whole way we report results
        let pullFromResult;
        try {
          pullFromResult = await sync.datasource.pullDataFromDataSource(this.orgId, firestore, {filterAfterDate: sync.lastSyncDate});
        } catch (err) {
          console.log("fatal error in sync", err);
          pullFromResult = {
            results: [],
            warnings:[],
            errors: [err],
          }
        }
        this.results = pullFromResult.results;
        // this.results = [`Pulled ${pullFromResult.results.length} items from dataSource`];
        pullFromResult.warnings.sort((a: WarningType, b: WarningType) => {
          if(a.type > b.type) { return 1 };
          if(b.type > a.type) { return -1};
          return 0;
        });
        const warningCounter = {
          MalformedDate: 0,
          NoResourceMembership: 0,
        };
        const warningsByType = pullFromResult.warnings.reduce((acc: any, curr: WarningType) => {
          const currentCount = acc[curr.type] + 1;
          acc[curr.type] = currentCount;
          return acc;
        }, warningCounter);
        this.warnings = [`Pull resulted in ${pullFromResult.warnings.length} warnings. Types: ${JSON.stringify(warningsByType, null, 2)}`];
        this.errors = pullFromResult.errors;
      break;

      //Get data from somewhere, and push to external datasource
      case SyncMethod.pushTo:
        console.log("SyncRun.run running pushTo sync");
        const pushToResult = await sync.datasource.pushDataToDataSource(this.orgId, firestore, { filterAfterDate: sync.lastSyncDate });
        this.results = pushToResult.results;
        this.warnings = pushToResult.warnings;
        this.errors = pushToResult.errors;
      break;

      default:
        console.error("Other SyncMethods not implemented yet.");
    }

    //TODO: we need to somehow update the Sync with the last sync date,
    //But I think that we need to keep track of separate dates depending on the
    //method used. We will leave that for later.

    if (this.errors.length > 0) {
      return this.abortSync({ firestore});
    }

    return this.finishSync({ firestore});
  }

  private async abortSync({ firestore }): Promise<SyncRun> {
    console.warn("aborting sync with errors:", this.errors);

    this.status = SyncRunStatus.failed;
    this.finishedAt = moment().valueOf();

    return this.save({firestore});
  }

  private async finishSync({ firestore }): Promise<SyncRun> {
    console.log("finished sync with results:", this.results);
    console.log("finished sync with warnings:", this.warnings);
    this.status = SyncRunStatus.finished;
    this.finishedAt = moment().valueOf();

    return this.save({firestore});
  }

  /**
   * Create a new SyncRun in FireStore
   */
  public create({firestore}): SyncRun {
    console.log('SyncRun.create');
    const newRef = firestore.collection('org').doc(this.orgId).collection('syncRun').doc();
    this.id = newRef.id;
    
    return this.save({firestore});
  }
  
  public save({firestore}): SyncRun {
    console.log("saving SyncRun");
    //TODO: do we want this to merge?
    return firestore.collection('org').doc(this.orgId).collection('syncRun').doc(this.id)
      .set(this.serialize())
      .then(ref => {
        console.log('Finished saving SyncRun: ', this.id);
        return this;
      });
  }

  /**
   * Serialize the SyncRun for saving or transmission
   */
  public serialize(): any {
    const serialized = {
      id: this.id,
      orgId: this.orgId,
      syncId: this.syncId,
      syncMethod: this.syncMethod.toString(),
      subscribers: this.subscribers,
      startedAt: moment(this.startedAt).toDate(),
      finishedAt: moment(this.finishedAt).toDate(),
      status: this.status.toString(),
      results: this.results,
      warnings: this.warnings,
      errors: this.errors,
    };

    return serialized;
  }

  /**
   * deserialize from a firestore snapshot
   * @param sn 
   */
  public static deserialize(sn): SyncRun {
    const {
      id,
      orgId,
      syncId,
      syncMethod,
      subscribers,
      startedAt,
      finishedAt,
      status,
      results,
      warnings,
      errors,
    } = sn.data();

    //TODO not sure the enums will des properly
    const des: SyncRun = new SyncRun(orgId, syncId, syncMethod, subscribers);
    des.id = id;
    des.startedAt = startedAt;
    des.finishedAt = finishedAt;
    des.status = status;
    des.results = results;
    des.warnings = warnings;
    des.errors = errors;

    return des;
  }


  /**
   * Get the sync rungs for a given id
   */
  static getSyncRuns({orgId, syncId, firestore}): Promise<Array<SyncRun>> {
    return firestore.collection('org').doc(orgId).collection('syncRun')
      .where('syncId', '==', syncId)
      .get()
      .then(sn => snapshotToSyncRunList(sn));
  }

  /**
   * Get the sync run for the given id
   * @param param0 
   */
  static getSyncRun({ orgId, id, firestore }): Promise<SyncRun> {
    return firestore.collection('org').doc(orgId).collection('syncRun').doc(id).get()
    .then(sn => SyncRun.deserialize(sn));
  }


}
