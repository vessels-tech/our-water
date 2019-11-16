import ResourceStationType from '../enums/ResourceStationType';
import { DictType } from '../utils/DictType';

export enum ResourceType {
  Any = 'Any',
  MyWell = 'MyWell',
  GGMN = 'GGMN'
}

export type Resource = BaseResource | MyWellResource | GGMNResource;

export type BaseResource = {
  type: ResourceType;

  id: string;
  coords: { latitude: number; longitude: number };
  timeseries: any; //TODO: figure out timeseries...
};

type MyWellResourceProps = {
  type: ResourceType.MyWell;
  legacyId: string;
  owner: { name: string };
  resourceType: ResourceStationType;
  lastValue: number;
  lastReadingDatetime: Date;
  groups: DictType<string>;
};

type GGMNResourceProps = {
  type: ResourceType.GGMN;

  description: string;
  title: string;
  name: string;
  groundwaterStationId: string;
  waterColumnHeight: number;
};

export type MyWellResource = BaseResource & MyWellResourceProps;
export type GGMNResource = BaseResource & GGMNResourceProps;

/**
 * Pending Types
 *
 * Represents an incomplete or pending version of Resource
 */
export type PendingResource =
  | BasePendingResource
  | PendingMyWellResource
  | PendingGGMNResource;

export type BasePendingResource = {
  pending: true;

  pendingId: string;
  coords: { latitude: number; longitude: number };
  timeseries: any;
};

export type PendingMyWellResource = BasePendingResource & MyWellResourceProps;
export type PendingGGMNResource = BasePendingResource & GGMNResourceProps;

/**
 * Default Types
 */
export const DefaultResource: Resource = {
  type: ResourceType.Any,
  id: '',
  coords: { latitude: 1, longitude: 1 },
  timeseries: {} //TODO: figure out timeseries...
};

export const DefaultMyWellResource: MyWellResource = {
  id: '00001',
  coords: { latitude: 10, longitude: 10 },
  timeseries: {}, //TODO: fix
  type: ResourceType.MyWell,
  legacyId: '12345',
  owner: { name: 'Lewis ji' },
  resourceType: ResourceStationType.well,
  lastValue: 0,
  lastReadingDatetime: new Date(),
  groups: {
    pincode: '313603',
    country: 'IN'
  }
};

export const DefaultPendingResource: PendingResource = {
  pending: true,

  pendingId: '00001',
  coords: { latitude: 1, longitude: 1 },
  timeseries: {}
};
