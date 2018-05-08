"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
}
exports.Resource = Resource;
//# sourceMappingURL=Resource.js.map