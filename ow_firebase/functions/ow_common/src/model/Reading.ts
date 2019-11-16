import { MyWellExternalIds } from "./ExternalIds";
import { Maybe } from "../utils/Maybe";
import ResourceStationType from "../enums/ResourceStationType";

export enum ReadingType {
  Any = 'Any',
  MyWell = 'MyWell',
  GGMN = 'GGMN',
}

export type Reading =  BaseReading | MyWellReading | GGMNReading;
export type BaseReading = {
  type: ReadingType;

  datetime: string; //iso formatted string
  resourceId: string;
  resourceType: ResourceStationType
  timeseriesId: string,
  value: number;
};

type MyWellReadingProps = {
  type: ReadingType.MyWell;
  isLegacy: boolean,
  externalIds: MyWellExternalIds,
  image: Maybe<{ base64Image: string }>,
  location: Maybe<{
    latitude: number,
    longitude: number,
  }>,
}

type GGMNReadingProps = {
  type: ReadingType.GGMN,
  resourceType: ResourceStationType.well,
}

export type MyWellReading = BaseReading & MyWellReadingProps;
export type GGMNReading = BaseReading & GGMNReadingProps;


/**
 * Pending Types
 * 
 * Represents an incomplete or pending version of Reading
 */
export type PendingReading = BasePendingReading | PendingMyWellReading | PendingGGMNReading;

export type BasePendingReading = {
  pending: true,

  datetime: string; //iso formatted string
  resourceId: Maybe<string>;
  resourceType: ResourceStationType,
  timeseriesId: Maybe<string>,
  value: number;
}

//TODO: this doesn't generalize well - it doesn't allow for missing values properly in the
//MyWell and GGMN reading props
export type PendingMyWellReading = BasePendingReading & MyWellReadingProps;
export type PendingGGMNReading = BasePendingReading & GGMNReadingProps;



/**
 * Default Types
 */

export const DefaultReading: Reading = {
  type: ReadingType.Any,
  datetime: "2017-01-01T01:11:01Z",
  resourceId: "no_resource_id",
  resourceType: ResourceStationType.well,
  timeseriesId: "no_timeseries_id",
  value: 0
}