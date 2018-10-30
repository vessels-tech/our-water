import { PlatformType } from "./Platform";

export type MyWellReading = {
  type: PlatformType.MYWELL,

  /* Common values*/
  resourceId: string,
  timeseriesId: string,
  date: string, //ISO Formatted
  value: number,

  /* Platform Specific */
  imageUrl?: string,
  location?: Location,
}

export type GGMNReading = {
  type: PlatformType.GGMN,

  /* Common values*/
  resourceId: string,
  timeseriesId: string,
  date: string, //ISO Formatted
  value: number,
}