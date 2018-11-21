
import FirestoreDoc from "./FirestoreDoc";
import { serializeMap } from "../utils";
import { OWGeoPoint, BasicCoords } from "../typings/models/OurWater";
import firebase from "react-native-firebase";


//TODO: move these elsewhere
export enum ResourceType {
  Well = 'well',
  Raingauge = 'raingauge',
  Checkdam = 'checkdam',
  // TODO: remove this! HAck for the front end to work
  well = 'well',
  raingauge = 'raingauge',
  checkdam = 'checkdam',
}

export interface ResourceOwnerType {
  name: string
  createdByUserId: string
}


/*a time series in the Firebase Domain */
export type FBTimeseriesMap = {
  [index: string]: FBTimeseries,
}

export type FBTimeseries = {
  id: string, //Id must be unique for a resource
  /*TODO: add other fields here */
}

export type FBResourceBuilder = {
  orgId: string,
  externalIds: any,
  coords: BasicCoords,
  resourceType: ResourceType
  owner: ResourceOwnerType
  groups: Map<string, boolean> //simple dict with key of GroupId, value of true
  timeseries: FBTimeseriesMap
}

export default class FBResource extends FirestoreDoc {
  docName = 'resource';
  
  //@ts-ignore
  id: string
  externalIds: any
  coords: BasicCoords
  resourceType: ResourceType
  owner: ResourceOwnerType
  groups: Map<string, boolean> //simple dict with key of GroupId, value of true
  timeseries: FBTimeseriesMap

  lastValue: number = 0
  lastReadingDatetime: Date = new Date(0);

  constructor(orgId: string, externalIds: any, coords: BasicCoords,
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

  static build(builder: FBResourceBuilder): FBResource {
    return new FBResource(
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
    return {
      id: this.id,
      orgId: this.orgId,
      externalIds: this.externalIds,
      // externalIds: this.externalIds.serialize(),
      // coords: this.coords,

      // TODO: this will be tricky to manage and share for backend + front end
      coords: new firebase.firestore.GeoPoint(this.coords.latitude, this.coords.longitude),
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
  public static deserialize(data: any): FBResource {
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
    // const resourceTypeObj: ResourceType = resourceTypeFromString(resourceType);
    // const externalIdsObj = ResourceIdType.deserialize(externalIds);
    const des: FBResource = new FBResource(orgId, externalIds, coords, resourceType, owner, groups, timeseries);

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
  public static fromDoc(doc: any): FBResource {
    return this.deserialize(doc.data());
  }

  /**
   * getResource
   * 
   * Get the resource from an orgId and resourceId
   */
  static getResource(orgId: string, id: string, firestore: any): Promise<FBResource> {
    //TODO: make sure orgId is valid first
    return firestore.collection('org').doc(orgId).collection('resource').doc(id)
      .get()
      .then((doc: any) => FBResource.fromDoc(doc));
  }
}