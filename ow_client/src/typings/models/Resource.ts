import { OWGeoPoint, ResourceOwnerType } from './OurWater';
import { ResourceType } from '../../enums';
import { OrgType } from './OrgType';
import { AnyTimeseries } from './Timeseries';
import { description } from 'react-native-joi';

export type AnyResource = MyWellResource | GGMNResource;

export type MyWellResource = {
  type: OrgType.MYWELL,
  pending: false,
  /* Common values*/
  id: string,
  coords: OWGeoPoint,
  timeseries: AnyTimeseries[],

  /* Platform Specific */
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
  coords: OWGeoPoint,
  timeseries: AnyTimeseries[],
  
  /* Platform Specific */
  description: string,
  title: string, //What the resource is referred to publicly 
  name: string,
}