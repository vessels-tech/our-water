import { ResourceType } from "../../enums";
import { ResourceOwnerType } from "./OurWater";
import { AnyTimeseries } from "./Timeseries";
import { PendingTimeseries } from "./PendingTimeseries";

/**
 * Pending resource models a resource which hasn't been saved
 * externally yet
 */
export type PendingResource = {
  pending: true,
  coords: {
    latitude: number,
    longitude: number,
  },
  resourceType: ResourceType,
  owner: ResourceOwnerType,
  userId: string,
  pendingId: string,
  timeseries: PendingTimeseries[],
}
