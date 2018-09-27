import { ResourceType } from "../../enums";
import { Moment } from "moment";
import { GGMNTimeseries } from "./GGMN";

export type Resource = {
  id: string,
  //TODO: remove this, it no longer applies
  legacyId: string,
  // externalIds: ResourceIdType
  coords: OWGeoPoint,
  resourceType: ResourceType
  owner: ResourceOwnerType
  groups: Map<string, boolean> | null//simple dict with key of GroupId, value of true
  
  /* 
    This is a concept borrowed from GGMN. I'm not yet sure how we will make it 
    compatitble with OurWater.
  */
  timeseries: Array<OWTimeseries>

  lastValue: number;
  lastReadingDatetime: Date;
}

/**
 * Pending resource models a resource which hasn't been saved
 * externally yet
 */
export type PendingResource = {
  coords: OWGeoPoint,
  resourceType: ResourceType,
  owner: ResourceOwnerType,
  userId: string,

}

export type OWGeoPoint = {
  _latitude: number,
  _longitude: number,
}

export type BasicCoords = {
  latitude: number,
  longitude: number,
}

export type ResourceOwnerType = {
  name: string,
}


export type SearchResult = {
  resources: Resource[],
  groups: any[],
  users: any[],
  offline: boolean, //Lets us know if the search was performed offline
}

export type Reading = {
  resourceId: string,
  date: string, //ISO Formatted  
  value: number,
  imageUrl?: string, //optional imageUrl for the reading
  location?: Location,
  timeseriesId: string, //GGMN only, TODO: make separate models
}

export type SaveReadingResult = {
  requiresLogin: boolean,
}

export type SaveResourceResult = {
  requiresLogin: boolean,
}

export type OWTimeseries = {
  id: string,
  name: string,
  parameter: string,
  unit: string,
  referenceFrame: string,
  scale: string,
  valueType: string,
  location: string,
  lastValue: number,
  events: Array<OWTimeseriesEvent>,
}

export type OWTimeseriesEvent = {
  timestamp: number, //unix timestamp
  value: number,
}

export type OWTimeseriesResponse = {
  count: number,
  next: string,
  previous: string,
  results: Array<OWTimeseries>
}

export enum TimeseriesRange {
  ONE_YEAR = 'ONE_YEAR',
  THREE_MONTHS = 'THREE_MONTHS',
  TWO_WEEKS = 'TWO_WEEKS',
  EXTENT = 'EXTENT',
}

/**
 * The user saved to firebase
 */
export type OWUser = {
  userId: string,
  recentResources: Resource[],
  favouriteResources: Resource[],
  pendingSavedReadings: Reading[],
  pendingSavedResources: Resource[],
}

export type TimeSeriesReading = {
  meta: { loading: boolean },
  readings: Reading[],
}

//TODO: remove if we don't keep using it.
export type TimeseriesRangeReadings = {
  ONE_YEAR: TimeSeriesReading,
  THREE_MONTHS: TimeSeriesReading,
  TWO_WEEKS: TimeSeriesReading,
  EXTENT: TimeSeriesReading,
}

//simple map: key: `timeseriesId+range` => TimeseriesReading
export type TimeseriesReadings = {
  [id: string]: TimeSeriesReading,
}