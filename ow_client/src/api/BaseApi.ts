import { Resource } from "../typings/Resource";

/**
 * BaseApi is the base API for Our Water
 */
export default interface BaseApi {

  getResources(): any;
  getResourceNearLocation(
    latitude: number,
    longitude: number,
    distance: number
  ): Promise<Array<Resource>>;

}