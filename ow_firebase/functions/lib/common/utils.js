"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("@google-cloud/firestore");
/**
 * Create a diamond shape from a latlng
 * use this to easily convert from a legacy village into a Group
 */
exports.createDiamondFromLatLng = (lat, lng, delta) => {
    let minLat, maxLng, maxLat, minLng = null;
    minLat = new firestore_1.GeoPoint(lat - delta, lng);
    maxLng = new firestore_1.GeoPoint(lat, lng + delta);
    maxLat = new firestore_1.GeoPoint(lat + delta, lng);
    minLng = new firestore_1.GeoPoint(lat, lng - delta);
    //I suppose we should assume indexes 0 and -1 line up
    return [minLat, maxLng, maxLat, minLng];
};
/**
 * Get all of the groups that contain legacyIds, and format them as:
 *     a dict where key=legacyid (pincode, or pincode.villageId), value=new group
 * @param fs Firestore database
 */
exports.getLegacyMyWellGroups = (orgId, fs) => {
    const mappedGroups = new Map();
    //TODO: this would be more optimal if it looked at the externalIds object on a group, but that's a little tricky right now
    return fs.collection('org').doc(orgId).collection('group').get()
        .then(sn => {
        const groups = [];
        sn.forEach(result => groups.push(result.data()));
        groups.forEach(group => {
            //Groups should only have 1 mywellId, but let's be safe
            Object.keys(group.externalIds).forEach(externalId => mappedGroups.set(externalId, group));
        });
        return mappedGroups;
    });
};
/**
 * Get all of the resources that contain legacyIds, and format them as:
 *     a dict where key=legacyid (pincode, or pincode.villageId), value=new resource
 * @param fs Firestore database
 */
exports.getLegacyMyWellResources = (orgId, fs) => {
    const mappedResources = new Map();
    //TODO: this would be more optimal if it looked at the externalIds object on a group, but that's a little tricky right now
    return fs.collection('org').doc(orgId).collection('resource').where('externalIds.legacyMyWellId', '>', '0').get()
        .then(sn => {
        const resources = [];
        sn.forEach(result => resources.push(result.data()));
        resources.forEach(resource => {
            console.log("getLegacyMyWellResources resource is", resource);
            mappedResources.set(resource.externalId.legacyMyWellId, resource);
            //resources should only have 1 mywellId, but let's be safe
            // Object.keys(resource.externalIds).forEach(externalId => mappedResources.set(resource.extrexternalId, resource));
        });
        return mappedResources;
    });
};
/**
 * Looks up a new group membership for a legacy resource
 *
 * @param legacyResource
 * @param legacyGroups - a dict where key=legacyid (pincode, or pincode.villageId), value=new group
 * @returns any - of shape: for each groupId (that the resource is in.)
 * {
 *  groupId: 'true'
 * }
 */
exports.findGroupMembershipsForResource = (legacyResource, groups) => {
    const memberships = new Map();
    const villageGroup = groups.get(`mywell.${legacyResource.postcode}.${legacyResource.villageId}`);
    if (villageGroup) {
        memberships.set(villageGroup.id, true);
    }
    const pincodeGroup = groups.get(`mywell.${legacyResource.postcode}`);
    if (pincodeGroup) {
        memberships.set(pincodeGroup.id, true);
    }
    return memberships;
};
/**
 * Looks up a new Resource membership for a legacy resource
 *
 * @param legacyReading
 * @param resources - a dict where key=legacyid, value=new resource
 * @returns a single Resource
 */
exports.findResourceMembershipsForResource = (legacyReading, resources) => {
    const resource = resources.get(`${legacyReading.postcode}.${legacyReading.resourceId}`);
    if (!resource) {
        console.log(`no resource found for ids: ${legacyReading.postcode}.${legacyReading.resourceId}`);
        throw new Error(`no resource found for ids: ${legacyReading.postcode}.${legacyReading.resourceId} this shouldn't happen`);
    }
    return resource;
};
exports.serializeMap = (input) => {
    return Array.from(input).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
};
exports.anyToMap = (input) => {
    return Object.keys(input).reduce((acc, key) => {
        const value = input[key];
        return acc.set(key, value);
    }, new Map());
};
//# sourceMappingURL=utils.js.map