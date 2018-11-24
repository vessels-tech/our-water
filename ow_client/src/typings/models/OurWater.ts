import { ResourceType } from "../../enums";
import { Location } from "../Location";
import { TranslationEnum } from "ow_translations";
import { PendingResource } from "./PendingResource";
import { PendingReading } from "./PendingReading";
import { AnyResource } from "./Resource";
import { AnyReading } from "./Reading";
import { string } from "react-native-joi";
import { AnyARecord } from "dns";

export type DeprecatedResource = {
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

export type OWGeoPoint = {
  _latitude: number,
  _longitude: number,
}

export type BasicCoords = {
  latitude: number,
  longitude: number,
}

export function toBasicCoords(from: OWGeoPoint): BasicCoords {
  return {
    latitude: from._latitude,
    longitude: from._longitude
  }
}

export type ResourceOwnerType = {
  name: string,
}


export type SearchResult = {
  hasNextPage: boolean,
  // type: SearchResultType.Default,
  resources: AnyResource[],
  // groups: any[],
  // users: any[],
  // offline: boolean, //Lets us know if the search was performed offline
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
  reading?: AnyReading,
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
  recentResources: AnyResource[],
  favouriteResources: AnyResource[],
  pendingSavedReadings: PendingReading[],
  pendingSavedResources: PendingResource[],
  recentSearches: string[],
  translation: TranslationEnum,
  mobile: string | null,
  email: string | null,
  name: string | null,
  nickname: string | null,
}

export type TimeSeriesReading = {
  meta: { loading: boolean },
  readings: AnyReading[],
}

//TODO: remove if we don't keep using it.
export type TimeseriesRangeReadings = {
  ONE_YEAR: TimeSeriesReading,
  THREE_MONTHS: TimeSeriesReading,
  TWO_WEEKS: TimeSeriesReading,
  EXTENT: TimeSeriesReading,
}

//simple map: key: `resourceId+timeseriesName+range` => TimeseriesReading
export type TimeseriesReadings = {
  [id: string]: TimeSeriesReading,
}

 //Dict: tsName=>PendingReading[]
export type PendingReadingsByTimeseriesName = {
  [id: string]: PendingReading[]
}


/**
 * For now a scan result can only
 * represent a resource.
 * 
 * This may change in the future.
 * 
 * Example QR code as string:
 * {"orgId": "mywell", "assetType":"resource", "id": "12345"}
 */
export type ResourceScanResult = {
  orgId: string, 
  assetType: 'resource',
  id: string, //for now use long id. we will change this later on.
}