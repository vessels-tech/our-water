import { OrgType } from "./OrgType";
import { MaybeReadingImage } from "./ReadingImage";
import { MaybeReadingLocation } from "./ReadingLocation";
/**
 * Pending Reading models a resource which hasn't been saved
 * externally yet
 *
 * It can be turned into a reading for any organisation, hence why is has
 * extra fields that may not be needed
 */
export declare type PendingReading = {
    type: OrgType.NONE;
    id: string;
    pending: true;
    resourceId: string;
    timeseriesName: string;
    value: number;
    date: string;
    userId: string;
    image: MaybeReadingImage;
    location: MaybeReadingLocation;
};
