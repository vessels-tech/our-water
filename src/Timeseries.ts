import { OrgType } from "./OrgType";
import { AnyReading } from "./Reading";

export type AnyTimeseries = MyWellTimeseries | GGMNTimeseries;

export type MyWellTimeseries = {
  type: OrgType.MYWELL,
  
  /* Common values*/
  id: string,
  name: string,
  readings: AnyReading[],
  parameter: string, //eg. groundwater measure, water quality type

}



export type GGMNTimeseries = {
  type: OrgType.GGMN,

  /* Common values*/
  id: string,
  name: string,
  readings: AnyReading[],
  parameter: string, //eg. groundwater measure, water quality type

  
  /* Platform Specific */
  firstReadingDateString: string,
  
}

//TODO: Map from GGMNResponseTimeseries to GGMNTimeseries
//maybe we can make a mapper utility class