import { SyncRunStatus } from "../enums/SyncRunStatus";
import { SyncMethod } from "../enums/SyncMethod";

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
  id: string
  syncId: string
  syncMethod: SyncMethod
  orgId: string
  startedAt: number = 0  //unix timestamp
  finishedAt: number = 0 //unix timestamp
  subscribers: Array<string> //array of subscriber ids, which may refer to email addresses, slack ids
  status: SyncRunStatus = SyncRunStatus.pending
  result: string = ''
  errors: Array<string> = []




 }