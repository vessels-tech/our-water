"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OWGeoPoint_1 = require("../common/models/OWGeoPoint");
const Resource_1 = require("./models/Resource");
const Papa = require("papaparse");
const request = require("request-promise-native");
const ResourceType_1 = require("./enums/ResourceType");
/**
 * From a snapshot [eg. fs.collection('org').doc(orgId).collection('resource').get()]
 * iterate through and return a list of resources
 *
 * //TODO: make type generic
 */
exports.snapshotToResourceList = (sn) => {
    const resources = [];
    sn.forEach(doc => resources.push(Resource_1.Resource.fromDoc(doc)));
    return resources;
};
// export const snapshotToFirestoreDoc = (sn): Array<FirestoreDoc> => {
//   const resources: Array<FirestoreDoc> = [];
//   sn.forEach(doc => resources.push(FirestoreDoc.fromDoc(doc)));
//   return resources;
// }
/**
 * Concatenate a list of results together, keeping the results, warnings, errors
 * format
 */
exports.concatSaveResults = (resultList) => {
    return resultList.reduce((acc, curr) => {
        return {
            results: acc.results.concat(curr.results),
            warnings: acc.warnings.concat(curr.warnings),
            errors: acc.errors.concat(curr.errors),
        };
    }, { results: [], warnings: [], errors: [] });
};
/**
 * Create a diamond shape from a latlng
 * use this to easily convert from a legacy village into a Group
 */
exports.createDiamondFromLatLng = (lat, lng, delta) => {
    let minLat, maxLng, maxLat, minLng = null;
    minLat = new OWGeoPoint_1.default(lat - delta, lng);
    maxLng = new OWGeoPoint_1.default(lat, lng + delta);
    maxLat = new OWGeoPoint_1.default(lat + delta, lng);
    minLng = new OWGeoPoint_1.default(lat, lng - delta);
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
    return fs.collection('org').doc(orgId).collection('group').where('externalIds.hasLegacyMyWellPincode', '==', true).get()
        .then(sn => {
        const groups = [];
        sn.forEach(result => groups.push(result.data()));
        console.log(`Found: ${groups.length} groups.`);
        //TODO: this will die, we need to deserialize properly
        groups.forEach((group) => {
            if (!group.externalIds) {
                console.log("group is missing externalIds", group);
                return;
            }
            mappedGroups.set(group.externalIds.getMyWellId(), group);
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
    return fs.collection('org').doc(orgId).collection('resource').where('externalIds.hasLegacyMyWellId', '==', true).get()
        .then(sn => {
        const resources = [];
        sn.forEach(result => resources.push(result.data()));
        console.log(`getLegacyMyWellResources Found: ${resources.length} resources.`);
        //TODO: this will die, we need to deserialize properly
        resources.forEach((res) => {
            if (!res.externalIds) {
                //TODO: not sure what to do here. This should probably be a warning
                console.log("resource is missing externalIds", res.id);
                return;
            }
            mappedResources[res.externalIds.getMyWellId()] = res;
        });
        console.log(`found ${Object.keys(mappedResources).length} getLegacyMyWellResources:`);
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
    // console.log("findGroupMembershipsForResource Groups:", groups);
    const villageGroup = groups.get(`${legacyResource.postcode}.${legacyResource.villageId}`);
    if (villageGroup) {
        memberships.set(villageGroup.id, true);
    }
    const pincodeGroup = groups.get(`${legacyResource.postcode}`);
    if (pincodeGroup) {
        memberships.set(pincodeGroup.id, true);
    }
    // console.log("findGroupMembershipsForResource, ", memberships);
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
    const res = resources[`${legacyReading.postcode}.${legacyReading.resourceId}`];
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
    const villageGroup = groups[`mywell.${legacyReading.postcode}.${legacyReading.villageId}`];
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
exports.resourceIdForResourceType = (resourceType) => {
    switch (resourceType) {
        case ResourceType_1.ResourceType.Well:
            return '10';
        case ResourceType_1.ResourceType.Raingauge:
            return '70';
        case ResourceType_1.ResourceType.Checkdam:
            return '80';
    }
};
/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 * Ref: https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 *
 * @param {string} s a string
 * @return {number} a hash code value for the given string.
 */
exports.hashCode = (s) => {
    var h = 0, l = s.length, i = 0;
    if (l > 0)
        while (i < l)
            h = (h << 5) - h + s.charCodeAt(i++) | 0;
    return Math.abs(h);
};
/**
 * Convert an String id to a string of integers for the given length
 * Yes, I know we may eventually get a collision, but this is really just
 * so we can generate a simple Id that will be unique enough for Legacy MyWell.
 *
 * We plan on using 6 integers, 10^6 = 1M possible values, so we should be fine.
 */
exports.hashIdToIntegerString = (id, length) => {
    const fullHash = `${exports.hashCode(id)}`;
    return fullHash.substring(0, length);
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
/**
 * return a sync run result with just one error
 */
exports.resultWithError = (error) => {
    return {
        results: [],
        warnings: [],
        errors: [error]
    };
};
//# sourceMappingURL=utils.js.map