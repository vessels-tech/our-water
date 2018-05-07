import { GeoPoint } from "@google-cloud/firestore";


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