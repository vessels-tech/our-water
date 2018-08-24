
import BaseApi from './BaseApi';
import NetworkApi from './NetworkApi';
import { Resource } from '../typings/Resource';
import FirebaseApi from './FirebaseApi';

/**
 * MyWellApi is the MyWell variant of the BaseApi
 * 
 * 
 */
export default class MyWellApi implements BaseApi {
  orgId: string
  networkApi: NetworkApi;

  constructor(networkApi: NetworkApi, orgId: string) {
    this.networkApi = networkApi;
    this.orgId = orgId;
  }

  /**
   * Sign the user in anonymously with Firebase
   */
  silentSignin(): Promise<any> {
    return FirebaseApi.signIn();
  }

  /**
   * Add a resource to the recently viewed list
   */
  addRecentResource(resource: Resource, userId: string): Promise<any> {
    return FirebaseApi.addFavouriteResource(this.orgId, resource, userId);
  }

  getResources() {
    return true;
  }

  getResourceNearLocation(latitude: number, longitude: number, distance: number): Promise<Array<any>> {
    return FirebaseApi.getResourceNearLocation(
      this.networkApi,
      this.orgId,
      latitude,
      longitude,
      distance,
    );
  }

}