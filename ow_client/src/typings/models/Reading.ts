import { OrgType } from "./OrgType";
import { MaybeReadingImage } from "./ReadingImage";
import { MaybeReadingLocation } from "./ReadingLocation";

export type AnyReading = MyWellReading | GGMNReading;

export type MyWellReading = {
  type: OrgType.MYWELL,

  /* Common values*/
  resourceId: string,
  timeseriesId: string,
  date: string, //ISO Formatted
  value: number,

  /* Platform Specific */
  userId: string,
  image: MaybeReadingImage,
  location: MaybeReadingLocation,
}

export type GGMNReading = {
  type: OrgType.GGMN,

  /* Common values*/
  resourceId: string,
  timeseriesId: string,
  date: string, //ISO Formatted
  value: number,

  /* Platform Specific */
  groundwaterStationId: string,
}