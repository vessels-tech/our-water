import { GeoPoint } from "@google-cloud/firestore";
import { ResourceType } from "../enums/ResourceType";
import ResourceIdType from "../types/ResourceIdType";
import ResourceOwnerType from "../types/ResourceOwnerType";
import FirestoreDoc from "./FirestoreDoc";

export class Resource extends FirestoreDoc {
  docName = 'resource';

  id: string
  externalIds: ResourceIdType
  coords: GeoPoint
  resourceType: ResourceType
  owner: ResourceOwnerType

  lastValue: number | 0
  lastReadingDatetime: Date | 0
  

  constructor(orgId: string, externalIds: ResourceIdType, coords: GeoPoint,
    resourceType: ResourceType, owner: ResourceOwnerType) {
    super();
    
    this.orgId = orgId;
    this.externalIds = externalIds;
    this.coords = coords;
    this.resourceType = resourceType;
    this.owner = owner;
  }


  public serialize(): any {
    return {
      id: this.id,
      orgId: this.orgId,
      externalIds: this.externalIds.serialize(),
      coords: this.coords,
      resourceType: this.resourceType,
      //TODO: this may cause trouble
      owner: this.owner,
      lastValue: this.lastValue,
      lastReadingDatetime: this.lastReadingDatetime,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }



}