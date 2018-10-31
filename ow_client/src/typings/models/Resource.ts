import { OWGeoPoint, OWTimeseries, ResourceOwnerType } from './OurWater';
import { ResourceType } from '../../enums';
import { OrgType } from './OrgType';
import { AnyTimeseries } from './Timeseries';

export type AnyResource = MyWellResource | GGMNResource;

export type MyWellResource = {
  type: OrgType.MYWELL,
  /* Common values*/
  id: string,
  coords: OWGeoPoint,
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
  /* Common values*/
  id: string,
  coords: OWGeoPoint,
  timeseries: AnyTimeseries[],

  /* Platform Specific */
}
