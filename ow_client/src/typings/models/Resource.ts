import { OWGeoPoint, Resource, OWTimeseries, ResourceOwnerType } from './OurWater';
import { ResourceType } from '../../enums';
import { PlatformType } from './Platform';

export type AnyResource = MyWellResource | GGMNResource;

export type MyWellResource = {
  type: PlatformType.MYWELL,
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
  type: PlatformType.GGMN,
  /* Common values*/
  id: string,
  coords: OWGeoPoint,
  timeseries: OWTimeseries[],

  /* Platform Specific */
}