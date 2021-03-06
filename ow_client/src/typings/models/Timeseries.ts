import { OrgType } from "./OrgType";
import { Reading } from "./OurWater";

export type AnyTimeseries = MyWellTimeseries | GGMNTimeseries;

export type MyWellTimeseries = {
  type: OrgType.MYWELL,
  
  /* Common values*/
  id: string,
  name: string,
  readings: Reading[],
  parameter: string, //eg. groundwater measure, water quality type

}



export type GGMNTimeseries = {
  type: OrgType.GGMN,

  /* Common values*/
  id: string,
  name: string,
  readings: Reading[],
  parameter: string, //eg. groundwater measure, water quality type

  
  /* Platform Specific */
  firstReadingDateString: string,
  
}

//TODO: Map from GGMNResponseTimeseries to GGMNTimeseries
//maybe we can make a mapper utility class