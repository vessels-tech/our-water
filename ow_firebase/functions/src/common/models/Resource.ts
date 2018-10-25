
import { ResourceType, resourceTypeFromString } from "../enums/ResourceType";
import ResourceIdType from "../types/ResourceIdType";
import ResourceOwnerType from "../types/ResourceOwnerType";
import FirestoreDoc from "./FirestoreDoc";
import OWGeoPoint from '../models/OWGeoPoint';
import { serializeMap } from "../utils";

export class Resource extends FirestoreDoc {
  docName = 'resource';

  id: string
  externalIds: ResourceIdType
  coords: OWGeoPoint
  resourceType: ResourceType
  owner: ResourceOwnerType
  groups: Map<string, boolean> //simple dict with key of GroupId, value of true

  lastValue: number = 0
  lastReadingDatetime: Date = new Date(0);

  constructor(orgId: string, externalIds: ResourceIdType, coords: OWGeoPoint,
    resourceType: ResourceType, owner: ResourceOwnerType, groups: Map<string, boolean>) {
    super();
    
    this.orgId = orgId;
    this.externalIds = externalIds;
    this.coords = coords;
    this.resourceType = resourceType;
    this.owner = owner;
    this.groups = groups;
  }


  public serialize(): any {
    return {
      id: this.id,
      orgId: this.orgId,
      externalIds: this.externalIds.serialize(),
      coords: this.coords,
      resourceType: this.resourceType,
      owner: this.owner,
      groups: serializeMap(this.groups),
      lastValue: this.lastValue,
      lastReadingDatetime: this.lastReadingDatetime,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Deserialize from a json object
   */
  public static deserialize(data): Resource {
    const {
      id,
      orgId,
      externalIds,
      coords,
      resourceType,
      owner,
      groups,
      lastValue,
      lastReadingDatetime,
      createdAt, 
      updatedAt,
    } = data;

    //Deserialize objects
    const resourceTypeObj: ResourceType = resourceTypeFromString(resourceType);
    const externalIdsObj = ResourceIdType.deserialize(externalIds);
    const des: Resource = new Resource(orgId, externalIdsObj, coords, resourceTypeObj, owner, groups);

    //private vars
    des.id = id;
    des.lastValue = lastValue;
    des.lastReadingDatetime = lastReadingDatetime;
    des.createdAt = createdAt;
    des.updatedAt = updatedAt;

    return des;

  }

  /**
   * Deserialize from a Firestore Document
   */
  public static fromDoc(doc): Resource {
    return this.deserialize(doc.data());
  }


  /**
   * getResource
   * 
   * Get the resource from an orgId and resourceId
   */
  static getResource({ orgId, id, firestore}): Promise<Resource> {
    //TODO: make sure orgId is valid first
    return firestore.collection('org').doc(orgId).collection('resource').doc(id)
      .get()
      .then(doc => Resource.fromDoc(doc));
  }

}