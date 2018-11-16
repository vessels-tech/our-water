import { OrgType } from "./OrgType";
import { MaybeReadingImage } from "./ReadingImage";
import { MaybeReadingLocation } from "./ReadingLocation";
export declare type AnyReading = MyWellReading | GGMNReading;
export declare type MyWellReading = {
    type: OrgType.MYWELL;
    resourceId: string;
    timeseriesId: string;
    date: string;
    value: number;
    userId: string;
    image: MaybeReadingImage;
    location: MaybeReadingLocation;
};
export declare type GGMNReading = {
    type: OrgType.GGMN;
    resourceId: string;
    timeseriesId: string;
    date: string;
    value: number;
};
