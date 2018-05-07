"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FirestoreDoc_1 = require("./FirestoreDoc");
class Reading extends FirestoreDoc_1.default {
    constructor(orgId, resourceId, coords, resourceType, groups, datetime, value) {
        super();
        this.docName = 'reading';
        this.orgId = orgId;
        this.resourceId = resourceId;
        this.coords = coords;
        this.resourceType = resourceType;
        this.groups = groups;
        this.datetime = datetime;
        this.value = value;
    }
    serialize() {
        return {
            docName: this.docName,
            orgId: this.orgId,
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            resourceId: this.resourceId,
            coords: this.coords,
            resourceType: this.resourceType,
            groups: this.groups,
            datetime: this.datetime,
            value: this.value,
            isLegacy: this.isLegacy,
        };
    }
}
exports.Reading = Reading;
//# sourceMappingURL=Reading.js.map