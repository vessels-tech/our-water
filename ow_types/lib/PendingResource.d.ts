import { ResourceOwnerType } from './ResourceOwnerType';
import { PendingTimeseries } from "./PendingTimeseries";
import { OrgType } from "./OrgType";
import { ResourceType } from "./Enums";
/**
 * Pending resource models a resource which hasn't been saved
 * externally yet
 */
export declare type PendingResource = {
    type: OrgType.NONE;
    id: string;
    pending: true;
    coords: {
        latitude: number;
        longitude: number;
    };
    resourceType: ResourceType;
    owner: ResourceOwnerType;
    userId: string;
    timeseries: PendingTimeseries[];
};
