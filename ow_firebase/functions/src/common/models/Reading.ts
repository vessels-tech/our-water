import { GeoPoint } from "@google-cloud/firestore";
import { ResourceType } from "../enums/ResourceType";
import FirestoreDoc from "./FirestoreDoc";

export class Reading extends FirestoreDoc {
  docName = 'reading';
  
  resourceId: string

  coords: GeoPoint
  resourceType: ResourceType
  groups: object
  datetime: Date
  value: number
  isLegacy: boolean

  constructor(orgId: string, resourceId: string, coords: GeoPoint,
  resourceType: ResourceType, groups, datetime: Date, value: number) {
    super();

    this.orgId = orgId;
    this.resourceId = resourceId;
    this.coords = coords;
    this.resourceType = resourceType;
    this.groups = groups;
    this.datetime = datetime;
    this.value = value;
  }

  serialize() {
    return {
      docName: this.docName,
      orgId: this.orgId,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      resourceId: this.resourceId,
      coords: this.coords,
      resourceType: this.resourceType,
      groups: this.groups,
      datetime: this.datetime,
      value: this.value,
      isLegacy: this.isLegacy,
    }
  }


}