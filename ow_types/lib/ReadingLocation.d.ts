import { GeoPoint } from "./GeoPoint";
export declare type MaybeReadingLocation = ReadingLocation | NoReadingLocation;
export declare enum ReadingLocationType {
    NONE = "NONE",
    LOCATION = "LOCATION"
}
export declare type ReadingLocation = {
    type: ReadingLocationType.LOCATION;
    location: GeoPoint;
};
export declare type NoReadingLocation = {
    type: ReadingLocationType.NONE;
};
