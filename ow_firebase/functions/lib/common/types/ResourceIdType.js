"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceIdType {
    constructor() {
        this.hasLegacyMyWellId = false;
        this.hasLegacyMyWellResourceId = false;
        this.hasLegacyMyWellVillageId = false;
        this.hasLegacyMyWellPincode = false;
    }
    //Add other bits and pieces here as needed
    static none() {
        return new ResourceIdType();
    }
    /**
     * When we create a resource in OW, and want to sync it to LegacyMyWell,
     * it MUST have a postcode and villageId,  and NOT have a MyWellId
     */
    static newOWResource(pincode) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellPincode = `${pincode}`;
        legacyId.hasLegacyMyWellPincode = true;
        legacyId.legacyMyWellVillageId = `11`;
        legacyId.hasLegacyMyWellVillageId = true;
        return legacyId;
    }
    static fromLegacyPincode(pincode) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellPincode = `${pincode}`;
        legacyId.hasLegacyMyWellPincode = true;
        legacyId.legacyMyWellId = `${pincode}`;
        legacyId.hasLegacyMyWellId = true;
        return legacyId;
    }
    static fromLegacyVillageId(pincode, villageId) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellId = `${pincode}.${villageId}`;
        legacyId.hasLegacyMyWellId = true;
        legacyId.legacyMyWellPincode = `${pincode}`;
        legacyId.hasLegacyMyWellPincode = true;
        legacyId.legacyMyWellVillageId = `${villageId}`;
        legacyId.hasLegacyMyWellVillageId = true;
        return legacyId;
    }
    static fromLegacyMyWellId(pincode, resourceId) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellId = `${pincode}.${resourceId}`;
        legacyId.hasLegacyMyWellId = true;
        legacyId.legacyMyWellPincode = `${pincode}`;
        legacyId.hasLegacyMyWellPincode = true;
        legacyId.legacyMyWellVillageId = `${resourceId}`.substring(0, 2);
        legacyId.hasLegacyMyWellVillageId = true;
        legacyId.legacyMyWellResourceId = `${resourceId}`;
        legacyId.hasLegacyMyWellResourceId = true;
        return legacyId;
    }
    static fromLegacyReadingId(id, pincode, resourceId) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellId = `${id}`; //identifies this specific reading
        legacyId.hasLegacyMyWellId = true;
        legacyId.legacyMyWellPincode = `${pincode}`;
        legacyId.hasLegacyMyWellPincode = true;
        legacyId.legacyMyWellVillageId = `${resourceId}`.substring(0, 2);
        legacyId.hasLegacyMyWellVillageId = true;
        legacyId.legacyMyWellResourceId = `${resourceId}`; //identifies the reading's resource id
        legacyId.hasLegacyMyWellResourceId = true; //identified that the reading is linked to an external datasource
        return legacyId;
    }
    /**
     * Get the generic Id string.
     * Could be for a pincode, village, resource or reading
     */
    getMyWellId() {
        if (!this.hasLegacyMyWellId) {
            throw new Error('Tried to getMyWellId, but resource has no myWellId');
        }
        return this.legacyMyWellId;
    }
    /**
    * Parse the legacyMyWellResourceId, get the resourceId
    * throws if there is no legacyMyWellResourceId
    */
    getResourceId() {
        if (!this.hasLegacyMyWellResourceId) {
            throw new Error('tried to getResourceId, but resource has no resourceId');
        }
        return parseInt(this.legacyMyWellResourceId);
    }
    /**
     * Parse the legacyMyWellResourceId, get the villageId
     * throws if there is no legacyMyWellResourceId
     */
    getVillageId() {
        if (!this.hasLegacyMyWellVillageId) {
            throw new Error('tried to getVillageId, but could not find legacyMyWellVillageId.');
        }
        return parseInt(this.legacyMyWellVillageId);
    }
    /**
     * Parse the legacyMyWellResourceId, get postcode
     */
    getPostcode() {
        if (!this.hasLegacyMyWellPincode) {
            throw new Error('tried to getPostcode, but could not find legacyMyWellPincode.');
        }
        return parseInt(this.legacyMyWellPincode);
    }
    serialize() {
        return JSON.parse(JSON.stringify(this));
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