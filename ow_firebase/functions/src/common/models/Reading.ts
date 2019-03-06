import { resourceTypeFromString } from "../enums/ResourceType";
import FirestoreDoc from "./FirestoreDoc";
import { serializeMap } from "../utils";
import ResourceIdType from "../types/ResourceIdType";
import { OWGeoPoint } from "ow_types";
import ResourceStationType from "ow_common/lib/enums/ResourceStationType";
const admin = require('firebase-admin');
const GeoPoint = admin.firestore.GeoPoint;


export class Reading extends FirestoreDoc {
  docName = 'reading';
  
  id: string
  resourceId: string
  externalIds: ResourceIdType
  coords: OWGeoPoint
  resourceType: ResourceStationType
  groups: Map<string, boolean> //simple dict with key of GroupId, value of true
  datetime: Date
  value: number
  isLegacy: boolean
  timeseriesId: string

  constructor(orgId: string, resourceId: string, coords: OWGeoPoint,
    resourceType: ResourceStationType, groups, datetime: Date, value: number,
    externalIds: ResourceIdType) {
    
    super();

    this.orgId = orgId;
    this.resourceId = resourceId;
    this.coords = coords;
    this.resourceType = resourceType;
    this.groups = groups;
    this.datetime = datetime;
    this.value = value;
    this.externalIds = externalIds;
    //TODO: FIX THIS - 
    this.timeseriesId = 'default';
  }
  
  /**
   * Create a reading from legacy data
   * we put in empty fields, as they will be filled in later by a batch job
   */
  public static legacyReading(orgId: string, resourceId: string, coords: OWGeoPoint, resourceType: ResourceStationType, datetime: Date, value: number, externalIds: ResourceIdType) {
    const reading = new Reading(orgId, resourceId, coords, resourceType, null, datetime, value, externalIds);
    reading.isLegacy = true;

    return reading;
  }

  serialize() {
    //Required fields:
    const serialized = {
      docName: this.docName,
      orgId: this.orgId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      resourceType: this.resourceType,
      datetime: this.datetime,
      value: this.value,
      timeseriesId: this.timeseriesId,
    }

    //optional params
    if (this.id) {
      serialized['id'] = this.id;
    }

    if (this.resourceId) {
      serialized['resourceId'] = this.resourceId;
    }

    if (this.externalIds) {
      serialized['externalIds'] = this.externalIds.serialize();
    }

    if (this.coords) {
      serialized['coords'] = new GeoPoint(this.coords.latitude, this.coords.longitude);
    }

    if (this.groups) {
      serialized['groups'] = serializeMap(this.groups);
    }

    if (this.isLegacy) {
      serialized['isLegacy'] = this.isLegacy;
    }

    return serialized;
  }

  /**
    * Deserialize from a document
    * @param sn 
    */
  public static deserialize(doc, docId?: string): Reading {
    const {
      docName,
      orgId,
      createdAt,
      updatedAt,
      datetime,
      value,
      resourceId,
      groups,
      isLegacy,
      resourceType,
      externalIds,
      coords,
      timeseriesId,
    } = doc.data();

    //nested variables
    const resourceTypeObj: ResourceStationType = resourceTypeFromString(resourceType);
    const externalIdsObj = ResourceIdType.deserialize(externalIds);
    const des: Reading = new Reading(orgId, resourceId, coords, resourceTypeObj, 
      groups, datetime, value, externalIdsObj);

    //private vars
    des.id = des.id || docId;
    des.docName = docName;
    des.createdAt = createdAt;
    des.updatedAt = updatedAt;
    des.isLegacy = isLegacy;
    des.timeseriesId = timeseriesId;

    return des;
  }
}