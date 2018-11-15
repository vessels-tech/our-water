import { OrgType } from './OrgType';
import { AnyTimeseries } from './Timeseries';
import { ResourceOwnerType } from './ResourceOwnerType';
import { ResourceType } from './Enums';
import { GeoPoint } from './GeoPoint';
export declare type AnyResource = MyWellResource | GGMNResource;
export declare type MyWellResource = {
    type: OrgType.MYWELL;
    pending: false;
    id: string;
    coords: GeoPoint;
    timeseries: AnyTimeseries[];
    shortId: string;
    legacyId: string;
    owner: ResourceOwnerType;
    resourceType: ResourceType;
    lastValue: number;
    lastReadingDatetime: Date;
};
export declare type GGMNResource = {
    type: OrgType.GGMN;
    pending: false;
    id: string;
    coords: GeoPoint;
    timeseries: AnyTimeseries[];
    description: string;
    title: string;
};
