
import { ResourceType, resourceTypeFromString } from "../enums/ResourceType";
import ResourceIdType from "../types/ResourceIdType";
import ResourceOwnerType from "../types/ResourceOwnerType";
import FirestoreDoc from "./FirestoreDoc";
import { serializeMap } from "../utils";
import { OWGeoPoint } from "ow_types";
const admin = require('firebase-admin');
const GeoPoint = admin.firestore.GeoPoint;


/*a time series in the Firebase Domain */
export type FBTimeseriesMap = {
  [index: string]: FBTimeseries,
}

export type FBTimeseries = {
  id: string, //Id must be unique for a resource
  /*TODO: add other fields here */
}

export type ResourceBuilder = {
  orgId: string,
  externalIds: ResourceIdType
  coords: OWGeoPoint
  resourceType: ResourceType
  owner: ResourceOwnerType
  groups: Map<string, boolean> //simple dict with key of GroupId, value of true
  timeseries: FBTimeseriesMap
}

export class Resource extends FirestoreDoc {
  docName = 'resource';

  id: string
  externalIds: ResourceIdType
  coords: OWGeoPoint
  resourceType: ResourceType
  owner: ResourceOwnerType
  groups: Map<string, boolean> //simple dict with key of GroupId, value of true
  timeseries: FBTimeseriesMap

  lastValue: number = 0
  lastReadingDatetime: Date = new Date(0);

  constructor(orgId: string, externalIds: ResourceIdType, coords: OWGeoPoint,
    resourceType: ResourceType, owner: ResourceOwnerType, groups: Map<string, boolean>,
    timeseries: FBTimeseriesMap) {
    super();
    
    this.orgId = orgId;
    this.externalIds = externalIds;
    this.coords = coords;
    this.resourceType = resourceType;
    this.owner = owner;
    this.groups = groups;
    this.timeseries = timeseries;
  }

  static build(builder: ResourceBuilder): Resource {
    return new Resource(
      builder.orgId,
      builder.externalIds,
      builder.coords,
      builder.resourceType,
      builder.owner, 
      builder.groups,
      builder.timeseries,
    );
  }

  public serialize(): any {
    console.log('serializing stuff');

    return {
      id: this.id,
      orgId: this.orgId,
      externalIds: this.externalIds.serialize(),
      coords: new GeoPoint(this.coords.latitude, this.coords.longitude),
      resourceType: this.resourceType,
      owner: this.owner,
      groups: serializeMap(this.groups),
      lastValue: this.lastValue,
      lastReadingDatetime: this.lastReadingDatetime,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      timeseries: this.timeseries,
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
      timeseries,
    } = data;

    //Deserialize objects
    const resourceTypeObj: ResourceType = resourceTypeFromString(resourceType);
    const externalIdsObj = ResourceIdType.deserialize(externalIds);
    const des: Resource = new Resource(orgId, externalIdsObj, coords, resourceTypeObj, owner, groups, timeseries);

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