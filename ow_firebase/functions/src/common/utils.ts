import { GeoPoint, Firestore } from "@google-cloud/firestore";
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
export const createDiamondFromLatLng = (lat: number, lng: number, delta: number): Array<GeoPoint> => {
  let minLat: GeoPoint, maxLng: GeoPoint, maxLat: GeoPoint, minLng: GeoPoint = null;

  minLat = new GeoPoint(lat - delta, lng);
  maxLng = new GeoPoint(lat, lng + delta);
  maxLat = new GeoPoint(lat + delta, lng);
  minLng = new GeoPoint(lat, lng - delta);

  //I suppose we should assume indexes 0 and -1 line up
  return [minLat, maxLng, maxLat, minLng];
}


/**
 * Get all of the groups that contain legacyIds, and format them as:
 *     a dict where key=legacyid (pincode, or pincode.villageId), value=new group
 * @param fs Firestore database
 */
export const getLegacyMyWellGroups = (orgId: string, fs: Firestore): Promise<Map<string, Group>> => {
  const mappedGroups = new Map<string, Group>();

  return fs.collection('org').doc(orgId).collection('group').where('externalIds.legacyMyWellId', '>', '0').get()
  .then(sn => {
    const groups = [];
    sn.forEach(result => groups.push(result.data()));
    console.log(`Found: ${groups.length} groups.`);

    groups.forEach((group: Group) => {
      if (!group.externalIds) {
        console.log("group is missing externalIds", group);
        return;
      }
      
      mappedGroups.set(group.externalIds.legacyMyWellId, group);
    });

    return mappedGroups;
  });
}

/**
 * Get all of the resources that contain legacyIds, and format them as:
 *     a dict where key=legacyid (pincode, or pincode.villageId), value=new resource
 * @param fs Firestore database
 */
export const getLegacyMyWellResources = (orgId: string, fs: Firestore): Promise<Map<string, Resource>> => {
  const mappedResources = new Map<string, Resource>();

  return fs.collection('org').doc(orgId).collection('resource').where('externalIds.legacyMyWellId', '>', '0').get()
  .then(sn => {
    const resources = [];
    sn.forEach(result => resources.push(result.data()));
    console.log(`getLegacyMyWellResources Found: ${resources.length} resources.`);

    resources.forEach((res: Resource) => {
      if (!res.externalIds) {
        //TODO: not sure what to do here. This should probably be a warning
        console.log("resource is missing externalIds", res.id);
        return;
      }

      mappedResources[res.externalIds.legacyMyWellId] = res;
      //resources should only have 1 mywellId, but let's be safe
      // Object.keys(resource.externalIds).forEach(externalId => mappedResources.set(resource.extrexternalId, resource));
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

export const isNullOrEmpty = (stringOrNull: string): boolean => {
  if (!stringOrNull) {
    return true;
  }

  if (stringOrNull === '') {
    return true;
  }

  return false;
}