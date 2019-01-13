import { OrgType } from "./OrgType";
import { MaybeReadingImage } from "./ReadingImage";
import { MaybeReadingLocation } from "./ReadingLocation";
import { ResourceType } from "../../enums";

/**
 * Pending Reading models a resource which hasn't been saved
 * externally yet
 * 
 * It can be turned into a reading for any organisation, hence why is has
 * extra fields that may not be needed
 */
export type PendingReading = {
  type: OrgType.NONE,
  id: string, //Injected by Firebase Api
  pending: true,
  resourceId: string,
  timeseriesId: string, //eg. gwwmsl or gwmbgs. We can look up the actual timeseries Id later on

  value: number
  date: string, //ISO formatted
  resourceType?: ResourceType,

  userId: string,
  image: MaybeReadingImage,
  location: MaybeReadingLocation,
  groundwaterStationId: string, //GGMN only. TODO: Refactor
}
