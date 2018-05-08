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
    serialize() {
        return {
            id: this.id,
            docName: this.docName,
            orgId: this.orgId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            resourceId: this.resourceId,
            externalIds: this.externalIds.serialize(),
            coords: this.coords,
            resourceType: this.resourceType,
            groups: utils_1.serializeMap(this.groups),
            datetime: this.datetime,
            value: this.value,
            isLegacy: this.isLegacy,
        };
    }
}
exports.Reading = Reading;
//# sourceMappingURL=Reading.js.map