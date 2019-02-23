import { ResourceType } from "../../enums";
import { ResourceOwnerType } from "./OurWater";
import { AnyTimeseries } from "./Timeseries";
import { PendingTimeseries } from "./PendingTimeseries";
import { OrgType } from "./OrgType";
import { CacheType } from "../../reducers";

/**
 * Pending resource models a resource which hasn't been saved
 * externally yet
 */
export type PendingResource = {
  type: OrgType.NONE,
  id: string,
  name: string,
  pending: true,
  coords: {
    latitude: number,
    longitude: number,
  },
  resourceType: ResourceType,
  owner: ResourceOwnerType,
  userId: string,
  timeseries: PendingTimeseries[],
  waterColumnHeight: number,
  groups: CacheType<string>,
}
