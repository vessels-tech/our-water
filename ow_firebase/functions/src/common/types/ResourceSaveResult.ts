import SyncRunResult from "./SyncRunResult";
import { Resource } from "../models/Resource";

export default interface ResourceSaveResult extends SyncRunResult {
  results: Array<Resource>
  warnings: Array<any>
  errors: Array<any>
}