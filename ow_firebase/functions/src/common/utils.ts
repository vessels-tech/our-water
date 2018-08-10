import OWGeoPoint from '../common/models/OWGeoPoint';
import LegacyResource from "./types/LegacyResource";
import LegacyVillage from "./types/LegacyVillage";
import { Group } from "./models/Group";
import { Resource } from "./models/Resource";
import LegacyReading from "./types/LegacyReading";
import { resource } from "..";
import * as Papa from 'papaparse';
import * as request from 'request-promise-native';
import { ResourceType } from "./enums/ResourceType";
import SyncRunResult from "./types/SyncRunResult";
import FirestoreDoc from './models/FirestoreDoc';


/**
 * From a snapshot [eg. fs.collection('org').doc(orgId).collection('resource').get()]
 * iterate through and return a list of resources
 * 
 * //TODO: make type generic
 */
export const snapshotToResourceList= (sn): Array<Resource> => {
  const resources: Array<Resource> = [];
  sn.forEach(doc => resources.push(Resource.fromDoc(doc)));
  return resources;
}


// export const snapshotToFirestoreDoc = (sn): Array<FirestoreDoc> => {
//   const resources: Array<FirestoreDoc> = [];
//   sn.forEach(doc => resources.push(FirestoreDoc.fromDoc(doc)));
//   return resources;
// }


/**
 * Concatenate a list of results together, keeping the results, warnings, errors
 * format
 */
export const concatSaveResults = (resultList: Array<SyncRunResult>): SyncRunResult => {
  return resultList.reduce((acc, curr) => {
    return {
      results: acc.results.concat(curr.results),
      warnings: acc.warnings.concat(curr.warnings),
      errors: acc.errors.concat(curr.errors),
    }
  }, {results: [], warnings:[], errors:[]});
}


/**
 * Create a diamond shape from a latlng
 * use this to easily convert from a legacy village into a Group
 */
export const createDiamondFromLatLng = (lat: number, lng: number, delta: number): Array<OWGeoPoint> => {
  let minLat: OWGeoPoint, maxLng: OWGeoPoint, maxLat: OWGeoPoint, minLng: OWGeoPoint = null;

  minLat = new OWGeoPoint(lat - delta, lng);
  maxLng = new OWGeoPoint(lat, lng + delta);
  maxLat = new OWGeoPoint(lat + delta, lng);
  minLng = new OWGeoPoint(lat, lng - delta);

  //I suppose we should assume indexes 0 and -1 line up
  return [minLat, maxLng, maxLat, minLng];
}


/**
 * Get all of the groups that contain legacyIds, and format them as:
 *     a dict where key=legacyid (pincode, or pincode.villageId), value=new group
 * @param fs Firestore database
 */
export const getLegacyMyWellGroups = (orgId: string, fs): Promise<Map<string, Group>> => {
  const mappedGroups = new Map<string, Group>();

  return fs.collection('org').doc(orgId).collection('group').where('externalIds.hasLegacyMyWellPincode', '==', true).get()
  .then(sn => {
    const groups = [];
    sn.forEach(result => groups.push(result.data()));
    console.log(`Found: ${groups.length} groups.`);

    //TODO: this will die, we need to deserialize properly
    groups.forEach((group: Group) => {
      if (!group.externalIds) {
        console.log("group is missing externalIds", group);
        return;
      }
      
      mappedGroups.set(group.externalIds.getMyWellId(), group);
    });

    return mappedGroups;
  });
}

/**
 * Get all of the resources that contain legacyIds, and format them as:
 *     a dict where key=legacyid (pincode, or pincode.villageId), value=new resource
 * @param fs Firestore database
 */
export const getLegacyMyWellResources = (orgId: string, fs): Promise<Map<string, Resource>> => {
  const mappedResources = new Map<string, Resource>();

  return fs.collection('org').doc(orgId).collection('resource').where('externalIds.hasLegacyMyWellId', '==', true).get()
  .then(sn => {
    const resources = [];
    sn.forEach(result => resources.push(result.data()));
    console.log(`getLegacyMyWellResources Found: ${resources.length} resources.`);

    //TODO: this will die, we need to deserialize properly
    resources.forEach((res: Resource) => {
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
}



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
export const findGroupMembershipsForResource = (legacyResource: LegacyResource, groups: Map<string, Group>): Map<string, boolean> => {
  const memberships = new Map<string, boolean>();
  // console.log("findGroupMembershipsForResource Groups:", groups);
  const villageGroup: Group = groups.get(`${legacyResource.postcode}.${legacyResource.villageId}`);
  if (villageGroup) {
    memberships.set(villageGroup.id, true);
  }

  const pincodeGroup: Group = groups.get(`${legacyResource.postcode}`);
  if (pincodeGroup) {
    memberships.set(pincodeGroup.id, true);
  }

  // console.log("findGroupMembershipsForResource, ", memberships);
  return memberships;
}

/**
 * Looks up a new Resource membership for a legacy resource
 * 
 * @param legacyReading
 * @param resources - a dict where key=legacyid, value=new resource
 * @returns a single Resource
 */
export const findResourceMembershipsForResource = (legacyReading: LegacyReading, resources: Map<string, Resource>): Resource => {
  const res: Resource = resources[`${legacyReading.postcode}.${legacyReading.resourceId}`];
  if (!res) {
    console.log(`no resource found for ids: ${legacyReading.postcode}.${legacyReading.resourceId}`);
    throw new Error(`no resource found for ids: ${legacyReading.postcode}.${legacyReading.resourceId} this shouldn't happen`);
  } 

  return res;
}


/**
 * Looks up a new Group membership for a legacy reading
 * 
 * @param legacyReading
 * @param resources - a dict where key=legacyid, value=new resource
 * @returns a single Resource
 */
export const findGroupMembershipsForReading = (legacyReading: LegacyReading, groups: Map<string, Group>): Map<string, boolean> => {
  const memberships = new Map<string, boolean>();
  const villageGroup: Group = groups[`mywell.${legacyReading.postcode}.${legacyReading.villageId}`];
  if (villageGroup) {
    memberships.set(villageGroup.id, true);
  }

  const pincodeGroup: Group = groups.get(`mywell.${legacyReading.postcode}`);
  if (pincodeGroup) {
    memberships.set(pincodeGroup.id, true);
  }

  return memberships;
}


export const serializeMap = (input: Map<any, any>): any => {
  if (!input) {
    return {};
  }

  return Array.from(input).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
}

export const anyToMap = (input: any) => {

  return Object.keys(input).reduce((acc: Map<any, any>, key) => {
    const value = input[key];
    return acc.set(key, value);
  }, new Map());
}


export const downloadAndParseCSV = (url) => {
  //TODO: this is not optimal, we should use streaming, and not read everything into memory first.
  //but it's late, and I'm tired
  return request(url)
  .then(result => {
    return new Promise((resolve, reject) => {
      Papa.parse(result, {
        error: function(err) {
          console.log("Error parsing CSV");
          reject(err);
        },
        complete: function (res) {
          resolve(res.data);
        }
      });
    });
  });
}

export const resourceTypeForLegacyResourceId = (legacyResourceId: string): ResourceType => {

  if (legacyResourceId.startsWith('117')) {
    return ResourceType.Raingauge;
  }

  if (legacyResourceId.startsWith('118')) {
    return ResourceType.Checkdam;
  }

  return ResourceType.Well;
}

export const resourceIdForResourceType = (resourceType: ResourceType): string => {
  switch (resourceType) {
    case ResourceType.Well:
      return '10';
    case ResourceType.Raingauge:
      return '70';
    case ResourceType.Checkdam:
      return '80'
  }
}

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
export const hashCode = (s) => {
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
export const hashIdToIntegerString = (id: string, length: number): string => {

  const fullHash = `${hashCode(id)}`;
  return fullHash.substring(0, length);
}


export const isNullOrEmpty = (stringOrNull: string): boolean => {
  if (!stringOrNull) {
    return true;
  }

  if (stringOrNull === '') {
    return true;
  }

  return false;
}


/**
 * return a sync run result with just one error
 */

export const resultWithError = (error: Error): SyncRunResult => {
  return {
    results: [],
    warnings: [],
    errors: [error]
  };
}