import { GeoPoint } from "@google-cloud/firestore";
import { ResourceType } from "../enums/ResourceType";

export class Reading {
  id: string
  orgId: string
  resourceId: string

  coords: GeoPoint
  datetime: Date
  groups: object
  value: number
  resourceType: ResourceType

}