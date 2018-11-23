import { Reading } from "../models/Reading";
import SyncRunResult from "./SyncRunResult";
import { WarningType } from "../models/Datasources/LegacyMyWellDatasource";

export default interface ReadingSaveResult extends SyncRunResult {
  results: Array<Reading>
  warnings: Array<WarningType>
  errors: Array<any>
}