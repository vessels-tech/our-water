import { OWGeoPoint, ResourceOwnerType } from './OurWater';
import { ResourceType } from '../../enums';
import { OrgType } from './OrgType';
import { AnyTimeseries } from './Timeseries';
import { description } from 'react-native-joi';
import { CacheType } from '../../reducers';

export type AnyResource = MyWellResource | GGMNResource;

export type MyWellResource = {
  type: OrgType.MYWELL,
  pending: false,
  /* Common values*/
  id: string,
  coords: OWGeoPoint,
  timeseries: AnyTimeseries[],
  groups: CacheType<string>,
  
  /* Platform Specific */
  legacyId: string,
  owner: ResourceOwnerType
  resourceType: ResourceType,
  lastValue: number,
  lastReadingDatetime: Date,
  locationName: string;
}

export type GGMNResource = {
  type: OrgType.GGMN,
  pending: false,
  /* Common values*/
  id: string,
  coords: OWGeoPoint,
  timeseries: AnyTimeseries[],
  groups: CacheType<string>,
  
  /* Platform Specific */
  description: string,
  title: string, //What the resource is referred to publicly 
  name: string,
  groundwaterStationId: string,
  waterColumnHeight: number,
}