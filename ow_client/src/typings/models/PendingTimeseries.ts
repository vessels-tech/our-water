import { PendingReading } from "./PendingReading";
import { OrgType } from "./OrgType";


export type PendingTimeseries = {
  /* Common values*/
  type: OrgType.NONE,
  pending: true,
  name: string,
  readings: PendingReading[],
  parameter: string, //eg. groundwater measure, water quality type


  /* Platform Specific */

}