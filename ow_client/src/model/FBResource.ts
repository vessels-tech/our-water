import FirestoreDoc from "./FirestoreDoc";
import { BasicCoords } from "../typings/models/OurWater";
import firebase from "react-native-firebase";
import {
  AnyResource,
  MyWellResource,
  GGMNResource
} from "../typings/models/Resource";
import { OrgType } from "../typings/models/OrgType";
import { FBTimeseriesMap, toAnyTimeseriesList } from "./FBTimeseries";
import { CacheType } from "../reducers";

//TODO: move these elsewhere
export enum FBResourceType {
  Well = "well",
  Raingauge = "raingauge",
  Checkdam = "checkdam",
  Quality = "quality",
  Custom = "custom",
  // TODO: remove this! HAck for the front end to work
  well = "well",
  raingauge = "raingauge",
  checkdam = "checkdam",
  quality = "quality",
  custom = "custom"
}

export interface FBResourceOwnerType {
  name: string;
  createdByUserId: string;
}

export type FBResourceBuilder = {
  orgId: string;
  type: OrgType;
  pending: boolean;
  deleted: boolean;
  coords: BasicCoords;
  timeseries: FBTimeseriesMap;
  groups: CacheType<string>;
  image?: string;

  /* MyWell Optionals */
  legacyId?: string; //TODO: change to exernal ids // TODO: add groups?
  owner?: FBResourceOwnerType;
  resourceType?: FBResourceType;
  lastValue?: number;
  lastReadingDatetime?: Date;
  locationName?: string;

  /* GGMN Optionals */
  description?: string;
  title?: string;
};

export default class FBResource extends FirestoreDoc {
  docName = "resource";

  //@ts-ignore
  id: string;
  type: OrgType;
  pending: boolean;
  deleted: boolean;
  coords: BasicCoords;
  timeseries: FBTimeseriesMap;
  groups: CacheType<string>;
  image?: string;

  /* MyWell Optionals */
  legacyId?: string;
  owner?: FBResourceOwnerType;
  resourceType?: FBResourceType;
  lastValue?: number;
  lastReadingDatetime?: Date;
  locationName?: string;

  /* GGMN Optionals */
  description?: string;
  title?: string;

  constructor(builder: FBResourceBuilder) {
    super();
    console.log("fbresource", builder);
    this.orgId = builder.orgId;
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
    this.groups = builder.groups;
    this.locationName = builder.locationName;
    this.image = builder.image;
  }

  public serialize(): any {
    console.log('serialize')
    return {
      type: this.type,
      pending: this.pending,
      deleted: this.deleted,
      coords: new firebase.firestore.GeoPoint(
        this.coords.latitude,
        this.coords.longitude
      ),
      timeseries: this.timeseries,
      legacyId: this.legacyId,
      owner: this.owner,
      resourceType: this.resourceType,
      lastValue: this.lastValue,
      lastReadingDatetime: this.lastReadingDatetime,
      description: this.description,
      title: this.title,
      groups: this.groups,
      locationName: this.locationName,
      image: this.image,
      ...super.serialize()
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
      locationName,
      image,

      // extra fields
      createdAt,
      updatedAt
    } = data;

    const builder: FBResourceBuilder = {
      orgId,
      type,
      pending,
      deleted,
      coords: { latitude: coords._latitude, longitude: coords._longitude },
      timeseries,
      legacyId,
      owner,
      resourceType,
      lastValue,
      lastReadingDatetime,
      description,
      title,
      locationName,
      groups: data.groups ? data.groups : {},
      image
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
  static getResource(
    orgId: string,
    id: string,
    firestore: any
  ): Promise<FBResource> {
    //TODO: make sure orgId is valid first
    return firestore
      .collection("org")
      .doc(orgId)
      .collection("resource")
      .doc(id)
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
          coords: {
            _latitude: this.coords.latitude,
            _longitude: this.coords.longitude
          },
          timeseries: toAnyTimeseriesList(this.timeseries),
          groups: this.groups,

          /* Platform Specific */
          //@ts-ignore
          description: this.description,
          //@ts-ignore
          title: this.title,
          image: this.image
        };
        return resource;
      }
      case OrgType.MYWELL:
      //TODO: make more explicit - be less lazy and fix the type on the server side
      default: {
        //TD: MyWell timeseries for old resources are quite wrong.
        //They can also only have one type...
        // if (Object.keys(diff(this.timeseries, { id: 'default' })).length === 0) {
        //   if (this.resourceType === FBResourceType.well) {
        //     this.timeseries = [{ "name": "default", "parameter": "default", "readings": [], "unitOfMeasure": "m" }]
        //   }
        // }

        const resource: MyWellResource = {
          id: this.id,
          type: OrgType.MYWELL,
          pending: false,
          coords: {
            _latitude: this.coords.latitude,
            _longitude: this.coords.longitude
          },
          groups: this.groups,
          timeseries: toAnyTimeseriesList(this.timeseries),
          image: this.image,

          /* Platform Specific */
          //@ts-ignore
          legacyId: this.legacyId,
          //@ts-ignore
          owner: this.owner,
          //@ts-ignore
          resourceType: this.resourceType,
          //@ts-ignore
          lastValue: this.lastValue,
          //@ts-ignore
          lastReadingDatetime: this.lastReadingDatetime
        };

        return resource;
      }
      // default: {
      //   throw new Error("toAnyResource() tried to convert from FBResource but this.type is unknown");
      // }
    }
  }
}
