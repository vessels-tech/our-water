import { GeoPoint, Firestore } from "@google-cloud/firestore";
import LegacyResource from "./types/LegacyResource";
import LegacyVillage from "./types/LegacyVillage";
import { Group } from "./models/Group";


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
export const getLegacyGroups = (orgId: string, fs: Firestore): Promise<Map<string, Group>> => {

  // return fs.collection('org').doc(orgId).collection('group')
    // .where('externalIds')

  return null;
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
export const findGroupMembershipsForResource = (legacyResource: LegacyResource, groups: Map<string, Group> ): Map<string, boolean> => {
  const villageGroup: Group = groups[`mywell.${legacyResource.postcode}.${legacyResource.villageId}`];
  const pincodeGroup: Group = groups[`mywell.${legacyResource.postcode}`];

  const memberships = new Map<string, boolean>();
  memberships.set(villageGroup.id, true);
  memberships.set(pincodeGroup.id, true);
  
  return memberships;
}