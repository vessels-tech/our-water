"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
}
exports.default = ResourceIdType;
//# sourceMappingURL=ResourceIdType.js.map