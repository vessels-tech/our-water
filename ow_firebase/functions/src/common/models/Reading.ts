import { ResourceType } from "../enums/ResourceType";
import FirestoreDoc from "./FirestoreDoc";
import { serializeMap } from "../utils";
import ResourceIdType from "../types/ResourceIdType";
import OWGeoPoint from '../models/OWGeoPoint';


export class Reading extends FirestoreDoc {
  docName = 'reading';
  
  id: string
  resourceId: string
  externalIds: ResourceIdType
  coords: OWGeoPoint
  resourceType: ResourceType
  groups: Map<string, boolean> //simple dict with key of GroupId, value of true
  datetime: Date
  value: number
  isLegacy: boolean

  constructor(orgId: string, resourceId: string, coords: OWGeoPoint,
    resourceType: ResourceType, groups, datetime: Date, value: number,
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
  }
  
  /**
   * Create a reading from legacy data
   * we put in empty fields, as they will be filled in later by a batch job
   */
  public static legacyReading(orgId: string, resourceType: ResourceType, datetime: Date, value: number, externalIds: ResourceIdType) {
    const resourceId = '-1';
    const coords = null;
    const reading = new Reading(orgId, null, null, resourceType, null, datetime, value, externalIds);
    reading.isLegacy = true;

    return reading;
  }

  serialize() {
    //Required fields:
    const serialized = {
      id: this.id,
      docName: this.docName,
      orgId: this.orgId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      resourceType: this.resourceType,
      datetime: this.datetime,
      value: this.value,
    }

    //optional params
    if (this.resourceId) {
      serialized['resourceId'] = this.resourceId;
    }

    if (this.externalIds) {
      serialized['externalIds'] = this.externalIds.serialize();
    }

    if (this.coords) {
      serialized['coords'] = this.coords;
    }

    if (this.groups) {
      serialized['groups'] = serializeMap(this.groups);
    }

    if (this.isLegacy) {
      serialized['isLegacy'] = this.isLegacy;
    }

    return serialized;
  }


}