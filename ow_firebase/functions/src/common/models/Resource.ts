import { resourceTypeFromString } from "../enums/ResourceType";
import ResourceIdType from "../types/ResourceIdType";
import ResourceOwnerType from "../types/ResourceOwnerType";
import FirestoreDoc from "./FirestoreDoc";
import { serializeMap } from "../utils";
import { OWGeoPoint } from "ow_types";
import ResourceStationType from "ow_common/lib/enums/ResourceStationType";
const admin = require("firebase-admin");
const GeoPoint = admin.firestore.GeoPoint;

/*a time series in the Firebase Domain */
export type FBTimeseriesMap = {
  [index: string]: FBTimeseries;
};

export type FBTimeseries = {
  id: string; //Id must be unique for a resource
  /*TODO: add other fields here */
};

export type ResourceBuilder = {
  orgId: string;
  externalIds: ResourceIdType;
  coords: OWGeoPoint;
  resourceType: ResourceStationType;
  owner: ResourceOwnerType;
  //Hmm, this is no longer valid.
  //Perhaps we need a groups field, as well as a groupMembership field that gets auto created?
  groups: Map<string, boolean>; //simple dict with key of GroupId, value of true
  timeseries: FBTimeseriesMap;
  locationName?: string;
  image?: string;
};

export class Resource extends FirestoreDoc {
  docName = "resource";

  id: string;
  externalIds: ResourceIdType;
  coords: OWGeoPoint;
  resourceType: ResourceStationType;
  owner: ResourceOwnerType;
  groups: Map<string, boolean>; //simple dict with key of GroupId, value of true
  timeseries: FBTimeseriesMap;
  locationName: string;
  image?: string;

  lastValue: number = 0;
  lastReadingDatetime: Date = new Date(0);

  constructor(
    orgId: string,
    externalIds: ResourceIdType,
    coords: OWGeoPoint,
    resourceType: ResourceStationType,
    owner: ResourceOwnerType,
    groups: Map<string, boolean>,
    timeseries: FBTimeseriesMap,
    locationName?: string,
    image?: string
  ) {
    super();

    this.orgId = orgId;
    this.externalIds = externalIds;
    this.coords = coords;
    this.resourceType = resourceType;
    this.owner = owner;
    this.groups = groups;
    this.timeseries = timeseries;
    this.locationName = locationName;
    this.image = image;
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
      builder.locationName,
      builder.image
    );
  }

  public serialize(): any {
    return {
      id: this.id,
      orgId: this.orgId,
      externalIds: this.externalIds.serialize(),
      coords: new GeoPoint(this.coords.latitude, this.coords.longitude),
      resourceType: this.resourceType,
      owner: this.owner,
      groups: serializeMap(this.groups),
      lastValue: this.lastValue || null,
      lastReadingDatetime: this.lastReadingDatetime || null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      timeseries: this.timeseries,
      locationName: this.locationName || null,
      image: this.image || null
    };
  }

  /**
   * Deserialize from a json object
   */
  public static deserialize(data: any, deserId?: string): Resource {
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
      locationName,
      image
    } = data;

    //Deserialize objects
    const resourceTypeObj: ResourceStationType = resourceTypeFromString(
      resourceType
    );
    const externalIdsObj = ResourceIdType.deserialize(externalIds);
    const des: Resource = new Resource(
      orgId,
      externalIdsObj,
      coords,
      resourceTypeObj,
      owner,
      groups,
      timeseries,
      locationName,
      image
    );

    //private vars
    des.id = id || deserId;
    des.lastValue = lastValue;
    des.lastReadingDatetime = lastReadingDatetime;
    des.createdAt = createdAt;
    des.updatedAt = updatedAt;

    return des;
  }

  /**
   * Deserialize from a Firestore Document
   */
  public static fromDoc(doc, id?: string): Resource {
    return this.deserialize(doc.data(), id);
  }

  /**
   * getResource
   *
   * Get the resource from an orgId and resourceId
   */
  static getResource({ orgId, id, firestore }): Promise<Resource> {
    //TODO: make sure orgId is valid first
    return firestore
      .collection("org")
      .doc(orgId)
      .collection("resource")
      .doc(id)
      .get()
      .then(doc => Resource.fromDoc(doc));
  }
}
