"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceType_1 = require("../enums/ResourceType");
const FirestoreDoc_1 = require("./FirestoreDoc");
const utils_1 = require("../utils");
const ResourceIdType_1 = require("../types/ResourceIdType");
const admin = require('firebase-admin');
const GeoPoint = admin.firestore.GeoPoint;
class Reading extends FirestoreDoc_1.default {
    constructor(orgId, resourceId, coords, resourceType, groups, datetime, value, externalIds) {
        super();
        this.docName = 'reading';
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
    static legacyReading(orgId, resourceId, coords, resourceType, datetime, value, externalIds) {
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
        };
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
            serialized['groups'] = utils_1.serializeMap(this.groups);
        }
        if (this.isLegacy) {
            serialized['isLegacy'] = this.isLegacy;
        }
        if (this.location) {
            serialized['location'] = this.location;
        }
        if (this.image) {
            serialized['image'] = this.image;
        }
        return serialized;
    }
    /**
      * Deserialize from a document
      * @param sn
      */
    static deserialize(doc, docId) {
        const { docName, orgId, createdAt, updatedAt, datetime, value, resourceId, groups, isLegacy, resourceType, externalIds, coords, timeseriesId, location, image, } = doc.data();
        //nested variables
        const resourceTypeObj = ResourceType_1.resourceTypeFromString(resourceType);
        const externalIdsObj = ResourceIdType_1.default.deserialize(externalIds);
        const des = new Reading(orgId, resourceId, coords, resourceTypeObj, groups, datetime, value, externalIdsObj);
        //private vars
        des.id = des.id || docId;
        des.docName = docName;
        des.createdAt = createdAt;
        des.updatedAt = updatedAt;
        des.isLegacy = isLegacy;
        des.timeseriesId = timeseriesId;
        des.location = location;
        des.image = image;
        return des;
    }
}
exports.Reading = Reading;
//# sourceMappingURL=Reading.js.map