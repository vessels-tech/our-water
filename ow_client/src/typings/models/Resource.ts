import { OWGeoPoint, Resource, OWTimeseries, ResourceOwnerType } from './OurWater';

export enum ResourceType {
  MYWELL = 'MYWELL',
  GGMN = 'GGMN',
}

export type AnyResource = MyWellResource | GGMNResource;

export type MyWellResource = {
  type: ResourceType.MYWELL,
  /* Common values*/
  id: string,
  coords: OWGeoPoint,
  timeseries: OWTimeseries[],

  /* Platform Specific */
  shortId: string,
  legacyId: string,
  owner: ResourceOwnerType
  resourceType: ResourceType,
  lastValue: number,
  lastReadingDatetime: Date,
}


export type GGMNResource = {
  type: ResourceType.GGMN,
  /* Common values*/
  id: string,
  coords: OWGeoPoint,
  timeseries: OWTimeseries[],

  /* Platform Specific */
}