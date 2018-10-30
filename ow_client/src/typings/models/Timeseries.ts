import { PlatformType } from "./Platform";
import { Reading } from "./OurWater";

export type AnyTimeseries = MyWellTimeseries | GGMNTimeseries;

export type MyWellTimeseries = {
  type: PlatformType.MYWELL,
  
  /* Common values*/
  reading: Reading[],
  parameter: string, //eg. groundwater measure, water quality type

}



export type GGMNTimeseries = {
  type: PlatformType.GGMN,

  /* Common values*/
  reading: Reading[],
  parameter: string, //eg. groundwater measure, water quality type

  
  /* Platform Specific */
  id: string,
}

//TODO: Map from GGMNResponseTimeseries to GGMNTimeseries