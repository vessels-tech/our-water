"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FirestoreDoc_1 = require("./FirestoreDoc");
const utils_1 = require("../utils");
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
    }
    /**
     * Create a reading from legacy data
     * we put in empty fields, as they will be filled in later by a batch job
     */
    static legacyReading(orgId, resourceType, datetime, value, externalIds) {
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
        };
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
            serialized['groups'] = utils_1.serializeMap(this.groups);
        }
        if (this.isLegacy) {
            serialized['isLegacy'] = this.isLegacy;
        }
        return serialized;
    }
}
exports.Reading = Reading;
//# sourceMappingURL=Reading.js.map