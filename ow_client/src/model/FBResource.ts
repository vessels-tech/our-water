
import FirestoreDoc from "./FirestoreDoc";
import { serializeMap } from "../utils";
import { OWGeoPoint, BasicCoords } from "../typings/models/OurWater";
import firebase from "react-native-firebase";
import { description } from "react-native-joi";
import { AnyResource, MyWellResource, GGMNResource } from "../typings/models/Resource";
import { AnyTimeseries } from "../typings/models/Timeseries";
import { OrgType } from "../typings/models/OrgType";
import { MyWellReading } from "../typings/models/Reading";


//TODO: move these elsewhere
export enum FBResourceType {
  Well = 'well',
  Raingauge = 'raingauge',
  Checkdam = 'checkdam',
  // TODO: remove this! HAck for the front end to work
  well = 'well',
  raingauge = 'raingauge',
  checkdam = 'checkdam',
}

export interface FBResourceOwnerType {
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

/**
 * Map from a FBTimeseries to AnyTimeseries
 */
export function toAnyTimeseriesList(fbTimeseriesMap: FBTimeseriesMap): AnyTimeseries[] {
  //TODO: implement
  return [];
}

export type FBResourceBuilder = {
  type: OrgType,
  pending: boolean,
  deleted: boolean,
  coords: BasicCoords,
  timeseries: FBTimeseriesMap,

  /* MyWell Optionals */
  legacyId?: string, //TODO: change to exernal ids
  // TODO: add groups?
  owner?: FBResourceOwnerType,
  resourceType?: FBResourceType, 
  lastValue?: number,
  lastReadingDatetime?: Date,

  /* GGMN Optionals */
  description?: string,
  title?: string,
}

export default class FBResource extends FirestoreDoc {
  docName = 'resource';
  
  //@ts-ignore
  id: string
  type: OrgType
  pending: boolean
  deleted: boolean
  coords: BasicCoords
  timeseries: FBTimeseriesMap

  /* MyWell Optionals */
  legacyId?: string
  owner?: FBResourceOwnerType
  resourceType?: FBResourceType
  lastValue?: number
  lastReadingDatetime?: Date

  /* GGMN Optionals */
  description?: string
  title?: string

  constructor(builder: FBResourceBuilder) {
    super();
    
    this.type = builder.type;
    this.pending = builder.pending;
    this.deleted = builder.deleted;
    this.coords = builder.coords;
    this.timeseries = builder.timeseries;
    this.legacyId = builder.legacyId;
    this.owner = builder.owner;
    this.resourceType = builder.resourceType;
    this.lastValue = builder.lastValue;
    this.lastReadingDatetime = builder.lastReadingDatetime;
    this.description = builder.description;
    this.title = builder.title;
  }

  public serialize(): any {
    return {
      id: this.id,
      orgId: this.orgId,
      type: this.type,
      pending: this.pending,
      deleted: this.deleted,
      coords: new firebase.firestore.GeoPoint(this.coords.latitude, this.coords.longitude),
      timeseries: this.timeseries,
      legacyId: this.legacyId,
      owner: this.owner,
      resourceType: this.resourceType,
      lastValue: this.lastValue,
      lastReadingDatetime: this.lastReadingDatetime,
      description: this.description,
      title: this.title,
    };
  }

  /**
   * Deserialize from a json object
   */
  public static deserialize(data: any): FBResource {
    const {
      id,
      orgId,
      type,
      pending,
      deleted,
      coords,
      timeseries,
      legacyId,
      owner,
      resourceType,
      lastValue,
      lastReadingDatetime,
      description,
      title,
      
      // extra fields
      createdAt,
      updatedAt,
    } = data;

    //Deserialize objects
    // const resourceTypeObj: ResourceType = resourceTypeFromString(resourceType);
    // const externalIdsObj = ResourceIdType.deserialize(externalIds);
    // const des: FBResource = new FBResource(orgId, externalIds, coords, resourceType, owner, groups, timeseries);

    const builder: FBResourceBuilder = {
      type,
      pending,
      deleted,
      coords,
      timeseries,
      legacyId,
      owner,
      resourceType,
      lastValue,
      lastReadingDatetime,
      description,
      title,
    };
    const des: FBResource = new FBResource(builder);

    //private vars
    des.id = id;
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

  /**
   * toAnyResource
   */
  public toAnyResource(): AnyResource {
    switch (this.type) {
      case OrgType.GGMN: {
        const resource: GGMNResource = {
          id: this.id,
          type: this.type,
          pending: false,
          coords: { _latitude: this.coords.latitude, _longitude: this.coords.longitude },
          timeseries: toAnyTimeseriesList(this.timeseries),

          /* Platform Specific */
          description: this.description,
          title: this.title,
        }
        return resource;
      }
      case OrgType.MYWELL: {
        const resource: MyWellResource = {
          id: this.id,
          type: this.type,
          pending: false,
          coords: { _latitude: this.coords.latitude, _longitude: this.coords.longitude },
          timeseries: toAnyTimeseriesList(this.timeseries),

          /* Platform Specific */
          legacyId: this.legacyId,
          owner: this.owner,
          resourceType: this.resourceType,
          lastValue: this.lastValue,
          lastReadingDatetime: this.lastReadingDatetime,
        };

        return resource;
      }
      default: {
        throw new Error("toAnyResource() tried to convert from FBResource but this.type is unknown");
      }
    }


  }
}