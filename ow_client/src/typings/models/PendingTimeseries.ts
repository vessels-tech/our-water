import { PendingReading } from "./OurWater";

export type PendingTimeseries = {
  /* Common values*/
  name: string,
  readings: PendingReading[],
  parameter: string, //eg. groundwater measure, water quality type


  /* Platform Specific */

}