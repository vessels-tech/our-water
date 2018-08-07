"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class ResourceIdType {
    //We can add other bits and pieces here
    static none() {
        return new ResourceIdType();
    }
    static fromLegacyPincode(pincode) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellId = `${pincode}`;
        return legacyId;
    }
    static fromLegacyVillageId(pincode, villageId) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellId = `${pincode}.${villageId}`;
        return legacyId;
    }
    static fromLegacyMyWellId(postcode, resourceId) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellId = `${postcode}.${resourceId}`;
        return legacyId;
    }
    static fromLegacyReadingId(id, postcode, resourceId) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellId = `${id}`; //identifies this specific reading
        legacyId.hasLegacyMyWellResourceId = true; //identified that the reading is linked to an external datasource
        legacyId.legacyMyWellResourceId = `${postcode}.${resourceId}`; //identifies the reading's resource id
        return legacyId;
    }
    /**
    * Parse the legacyMyWellResourceId, get the resourceId
    * throws if there is no legacyMyWellResourceId
    */
    getResourceId() {
        if (util_1.isNullOrUndefined(this.legacyMyWellResourceId)) {
            throw new Error('tried to getResourceId, but could not find legacyMyWellResourceId.');
        }
        return parseInt(this.legacyMyWellResourceId.split('.')[1]);
    }
    /**
     * Parse the legacyMyWellResourceId, get the villageId
     * throws if there is no legacyMyWellResourceId
     */
    getVillageId() {
        if (util_1.isNullOrUndefined(this.legacyMyWellResourceId)) {
            throw new Error('tried to getVillageId, but could not find legacyMyWellResourceId.');
        }
        return parseInt(this.legacyMyWellResourceId.split('.')[1].substring(0, 2));
    }
    /**
     * Parse the legacyMyWellResourceId, get postcode
     */
    getPostcode() {
        if (util_1.isNullOrUndefined(this.legacyMyWellResourceId)) {
            throw new Error('tried to getPostcode, but could not find legacyMyWellResourceId.');
        }
        return parseInt(this.legacyMyWellResourceId.split('.')[0]);
    }
    serialize() {
        const serialized = {};
        if (this.legacyMyWellId) {
            serialized['legacyMyWellId'] = this.legacyMyWellId;
        }
        if (this.legacyMyWellResourceId) {
            serialized['legacyMyWellResourceId'] = this.legacyMyWellResourceId;
        }
        if (this.hasLegacyMyWellResourceId) {
            serialized['hasLegacyMyWellResourceId'] = true;
        }
        return serialized;
    }
    static deserialize(obj) {
        let resourceIdType = new ResourceIdType();
        Object.keys(obj).forEach(key => {
            resourceIdType[key] = obj[key];
        });
        return resourceIdType;
    }
}
exports.default = ResourceIdType;
//# sourceMappingURL=ResourceIdType.js.map