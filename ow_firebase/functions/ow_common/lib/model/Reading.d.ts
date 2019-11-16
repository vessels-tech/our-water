import { MyWellExternalIds } from "./ExternalIds";
import { Maybe } from "../utils/Maybe";
import ResourceStationType from "../enums/ResourceStationType";
export declare enum ReadingType {
    Any = "Any",
    MyWell = "MyWell",
    GGMN = "GGMN"
}
export declare type Reading = BaseReading | MyWellReading | GGMNReading;
export declare type BaseReading = {
    type: ReadingType;
    datetime: string;
    resourceId: string;
    resourceType: ResourceStationType;
    timeseriesId: string;
    value: number;
};
declare type MyWellReadingProps = {
    type: ReadingType.MyWell;
    isLegacy: boolean;
    externalIds: MyWellExternalIds;
    image: Maybe<{
        base64Image: string;
    }>;
    location: Maybe<{
        latitude: number;
        longitude: number;
    }>;
};
declare type GGMNReadingProps = {
    type: ReadingType.GGMN;
    resourceType: ResourceStationType.well;
};
export declare type MyWellReading = BaseReading & MyWellReadingProps;
export declare type GGMNReading = BaseReading & GGMNReadingProps;
/**
 * Pending Types
 *
 * Represents an incomplete or pending version of Reading
 */
export declare type PendingReading = BasePendingReading | PendingMyWellReading | PendingGGMNReading;
export declare type BasePendingReading = {
    pending: true;
    datetime: string;
    resourceId: Maybe<string>;
    resourceType: ResourceStationType;
    timeseriesId: Maybe<string>;
    value: number;
};
export declare type PendingMyWellReading = BasePendingReading & MyWellReadingProps;
export declare type PendingGGMNReading = BasePendingReading & GGMNReadingProps;
/**
 * Default Types
 */
export declare const DefaultReading: Reading;
export {};
