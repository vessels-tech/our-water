import { GeoPoint } from "@google-cloud/firestore";
import { ResourceType } from "../enums/ResourceType";
import FirestoreDoc from "./FirestoreDoc";
import { serializeMap } from "../utils";
import ResourceIdType from "../types/ResourceIdType";

export class Reading extends FirestoreDoc {
  docName = 'reading';
  
  id: string
  resourceId: string
  externalIds: ResourceIdType
  coords: GeoPoint
  resourceType: ResourceType
  groups: Map<string, boolean> //simple dict with key of GroupId, value of true
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
      id: this.id,
      docName: this.docName,
      orgId: this.orgId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      resourceId: this.resourceId,
      externalIds: this.externalIds.serialize(),
      coords: this.coords,
      resourceType: this.resourceType,
      groups: serializeMap(this.groups),
      datetime: this.datetime,
      value: this.value,
      isLegacy: this.isLegacy,
    }
  }


}