import { Reading } from "../models/Reading";
import SyncRunResult from "./SyncRunResult";

export default interface ReadingSaveResult extends SyncRunResult {
  results: Array<Reading>
  warnings: Array<any>
  errors: Array<any>
}