import ResourceStationType from '../enums/ResourceStationType';
import { DictType } from '../utils/DictType';
export declare enum ResourceType {
    Any = "Any",
    MyWell = "MyWell",
    GGMN = "GGMN"
}
export declare type Resource = BaseResource | MyWellResource | GGMNResource;
export declare type BaseResource = {
    type: ResourceType;
    id: string;
    coords: {
        latitude: number;
        longitude: number;
    };
    timeseries: any;
};
declare type MyWellResourceProps = {
    type: ResourceType.MyWell;
    legacyId: string;
    owner: {
        name: string;
    };
    resourceType: ResourceStationType;
    lastValue: number;
    lastReadingDatetime: Date;
    groups: DictType<string>;
};
declare type GGMNResourceProps = {
    type: ResourceType.GGMN;
    description: string;
    title: string;
    name: string;
    groundwaterStationId: string;
    waterColumnHeight: number;
};
export declare type MyWellResource = BaseResource & MyWellResourceProps;
export declare type GGMNResource = BaseResource & GGMNResourceProps;
/**
 * Pending Types
 *
 * Represents an incomplete or pending version of Resource
 */
export declare type PendingResource = BasePendingResource | PendingMyWellResource | PendingGGMNResource;
export declare type BasePendingResource = {
    pending: true;
    pendingId: string;
    coords: {
        latitude: number;
        longitude: number;
    };
    timeseries: any;
};
export declare type PendingMyWellResource = BasePendingResource & MyWellResourceProps;
export declare type PendingGGMNResource = BasePendingResource & GGMNResourceProps;
/**
 * Default Types
 */
export declare const DefaultResource: Resource;
export declare const DefaultMyWellResource: MyWellResource;
export declare const DefaultPendingResource: PendingResource;
export {};
