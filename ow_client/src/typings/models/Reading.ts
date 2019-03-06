import { OrgType } from "./OrgType";
import { MaybeReadingImage } from "./ReadingImage";
import { MaybeReadingLocation } from "./ReadingLocation";
import { ResourceType } from "../../enums";

export type AnyReading = MyWellReading | GGMNReading;

export type MyWellReading = {
  type: OrgType.MYWELL,

  /* Common values*/
  resourceId: string,
  timeseriesId: string, //mywell timeseries code, eg. 'default'
  date: string, //ISO Formatted
  value: number,

  /* Platform Specific */
  userId: string,
  image: MaybeReadingImage,
  location: MaybeReadingLocation,
  resourceType: ResourceType,
}

export type GGMNReading = {
  type: OrgType.GGMN,

  /* Common values*/
  resourceId: string,
  timeseriesId: string, //timeseries code, eg. 'gwmmsl'
  date: string, //ISO Formatted
  value: number,

  /* Platform Specific */
  groundwaterStationId: string,
  timeseriesUuid: string; //timeseries id in ggmn
}