import { OrgType } from './OrgType';
import { AnyTimeseries } from './Timeseries';
import { ResourceOwnerType } from './ResourceOwnerType';
import { ResourceType } from './Enums';
import { GeoPoint } from './GeoPoint';

export type AnyResource = MyWellResource | GGMNResource;

export type MyWellResource = {
  type: OrgType.MYWELL,
  pending: false,
  /* Common values*/
  id: string,
  coords: GeoPoint,
  timeseries: AnyTimeseries[],

  /* Platform Specific */
  shortId: string,
  legacyId: string,
  owner: ResourceOwnerType
  resourceType: ResourceType,
  lastValue: number,
  lastReadingDatetime: Date,
}


export type GGMNResource = {
  type: OrgType.GGMN,
  pending: false,
  /* Common values*/
  id: string,
  coords: GeoPoint,
  timeseries: AnyTimeseries[],
  
  /* Platform Specific */
  description: string,
  title: string, //What the resource is referred to publicly 
}