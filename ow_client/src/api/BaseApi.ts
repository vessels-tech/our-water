import { Resource } from "../typings/Resource";

/**
 * BaseApi is the base API for Our Water
 */
export default interface BaseApi {

  /**
   * Sign in the user sliently.
   * Most likely, this will use the FirebaseAPI behind the scenes
   */
  silentSignin(): Promise<any>;

  /**
   * Add a resource to the recently viewed list
   * Most likely will use Firebase
   */
  addRecentResource(resource: Resource, userId: string): Promise<any>;

  getResources(): any;
  getResourceNearLocation(
    latitude: number,
    longitude: number,
    distance: number
  ): Promise<Array<Resource>>;

}