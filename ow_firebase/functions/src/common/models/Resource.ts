import { GeoPoint } from "@google-cloud/firestore";
import { ResourceType } from "../enums/ResourceType";
import ResourceIdType from "../types/ResourceIdType";
import ResourceOwnerType from "../types/ResourceOwnerType";

export class Resouce {
  id: string
  orgId: string
  externalIds: ResourceIdType
  coords: GeoPoint
  lastReadingDatetime: Date
  resourceType: ResourceType
  lastValue: number
  createdAt: Date
  updatedAt: Date
  owner: ResourceOwnerType
}