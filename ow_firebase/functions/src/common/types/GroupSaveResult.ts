import { Group } from "../models/Group";
import SyncRunResult from "./SyncRunResult";

export default interface GroupSaveResult extends SyncRunResult {
  results: Array<Group>
  warnings: Array<any>
  errors: Array<any>
}