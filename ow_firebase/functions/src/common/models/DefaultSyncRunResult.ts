import SyncRunResult from "../types/SyncRunResult";

export class DefaultSyncRunResult implements SyncRunResult {
  results: Array<any> = [];
  warnings: Array<any> = [];
  errors: Array<any> = [];
}