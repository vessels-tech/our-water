"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceType_1 = require("../enums/ResourceType");
const ResourceIdType_1 = require("../types/ResourceIdType");
const FirestoreDoc_1 = require("./FirestoreDoc");
const utils_1 = require("../utils");
class Resource extends FirestoreDoc_1.default {
    constructor(orgId, externalIds, coords, resourceType, owner, groups) {
        super();
        this.docName = 'resource';
        this.lastValue = 0;
        this.lastReadingDatetime = new Date(0);
        this.orgId = orgId;
        this.externalIds = externalIds;
        this.coords = coords;
        this.resourceType = resourceType;
        this.owner = owner;
        this.groups = groups;
    }
    serialize() {
        return {
            id: this.id,
            orgId: this.orgId,
            externalIds: this.externalIds.serialize(),
            coords: this.coords,
            resourceType: this.resourceType,
            owner: this.owner,
            groups: utils_1.serializeMap(this.groups),
            lastValue: this.lastValue,
            lastReadingDatetime: this.lastReadingDatetime,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    /**
     * Deserialize from a json object
     */
    static deserialize(data) {
        const { id, orgId, externalIds, coords, resourceType, owner, groups, lastValue, lastReadingDatetime, createdAt, updatedAt, } = data;
        //Deserialize objects
        const resourceTypeObj = ResourceType_1.resourceTypeFromString(resourceType);
        const externalIdsObj = ResourceIdType_1.default.deserialize(externalIds);
        const des = new Resource(orgId, externalIdsObj, coords, resourceTypeObj, owner, groups);
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
    static fromDoc(doc) {
        return this.deserialize(doc.data());
    }
    /**
     * getResource
     *
     * Get the resource from an orgId and resourceId
     */
    static getResource({ orgId, id, firestore }) {
        //TODO: make sure orgId is valid first
        return firestore.collection('org').doc(orgId).collection('resource').doc(id)
            .get()
            .then(doc => Resource.fromDoc(doc));
    }
}
exports.Resource = Resource;
//# sourceMappingURL=Resource.js.map