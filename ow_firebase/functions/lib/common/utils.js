"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("@google-cloud/firestore");
const __1 = require("..");
const Papa = require("papaparse");
const request = require("request-promise-native");
const ResourceType_1 = require("./enums/ResourceType");
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
    return fs.collection('org').doc(orgId).collection('group').where('externalIds.legacyMyWellId', '>', '0').get()
        .then(sn => {
        const groups = [];
        sn.forEach(result => groups.push(result.data()));
        console.log(`Found: ${groups.length} groups.`);
        groups.forEach((group) => {
            if (!group.externalIds) {
                console.log("group is missing externalIds", group);
                return;
            }
            mappedGroups.set(group.externalIds.legacyMyWellId, __1.resource);
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
    return fs.collection('org').doc(orgId).collection('resource').where('externalIds.legacyMyWellId', '>', '0').get()
        .then(sn => {
        const resources = [];
        sn.forEach(result => resources.push(result.data()));
        console.log(`Found: ${resources.length} resources.`);
        resources.forEach((res) => {
            if (!__1.resource.externalIds) {
                console.log("resource is missing externalIds", __1.resource);
                return;
            }
            mappedResources.set(__1.resource.externalIds.legacyMyWellId, res);
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
    const villageGroup = groups.get(`${legacyResource.postcode}.${legacyResource.villageId}`);
    if (villageGroup) {
        memberships.set(villageGroup.id, true);
    }
    const pincodeGroup = groups.get(`${legacyResource.postcode}`);
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
    const res = resources.get(`${legacyReading.postcode}.${legacyReading.resourceId}`);
    if (!res) {
        console.log(`no resource found for ids: ${legacyReading.postcode}.${legacyReading.resourceId}`);
        throw new Error(`no resource found for ids: ${legacyReading.postcode}.${legacyReading.resourceId} this shouldn't happen`);
    }
    return res;
};
/**
 * Looks up a new Group membership for a legacy reading
 *
 * @param legacyReading
 * @param resources - a dict where key=legacyid, value=new resource
 * @returns a single Resource
 */
exports.findGroupMembershipsForReading = (legacyReading, groups) => {
    const memberships = new Map();
    const villageGroup = groups.get(`mywell.${legacyReading.postcode}.${legacyReading.villageId}`);
    if (villageGroup) {
        memberships.set(villageGroup.id, true);
    }
    const pincodeGroup = groups.get(`mywell.${legacyReading.postcode}`);
    if (pincodeGroup) {
        memberships.set(pincodeGroup.id, true);
    }
    return memberships;
};
exports.serializeMap = (input) => {
    if (!input) {
        return {};
    }
    return Array.from(input).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
};
exports.anyToMap = (input) => {
    return Object.keys(input).reduce((acc, key) => {
        const value = input[key];
        return acc.set(key, value);
    }, new Map());
};
exports.downloadAndParseCSV = (url) => {
    //TODO: this is not optimal, we should use streaming, and not read everything into memory first.
    //but it's late, and I'm tired
    return request(url)
        .then(result => {
        return new Promise((resolve, reject) => {
            Papa.parse(result, {
                error: function (err) {
                    console.log("Error parsing CSV");
                    reject(err);
                },
                complete: function (res) {
                    resolve(res.data);
                }
            });
        });
    });
};
exports.resourceTypeForLegacyResourceId = (legacyResourceId) => {
    if (legacyResourceId.startsWith('117')) {
        return ResourceType_1.ResourceType.Raingauge;
    }
    if (legacyResourceId.startsWith('118')) {
        return ResourceType_1.ResourceType.Checkdam;
    }
    return ResourceType_1.ResourceType.Well;
};
exports.isNullOrEmpty = (stringOrNull) => {
    if (!stringOrNull) {
        return true;
    }
    if (stringOrNull === '') {
        return true;
    }
    return false;
};
//# sourceMappingURL=utils.js.map