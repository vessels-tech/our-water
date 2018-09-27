
import BaseApi from './BaseApi';
import NetworkApi from './NetworkApi';
import FirebaseApi from './FirebaseApi';
import { Resource, SearchResult } from '../typings/models/OurWater';

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
    console.log("signing in silently?");
    return FirebaseApi.signIn();
  }

  /**
   * Add a resource to the recently viewed list
   */
  addRecentResource(resource: Resource, userId: string): Promise<any> {
    return FirebaseApi.addFavouriteResource(this.orgId, resource, userId);
  }

  addFavouriteResource(resource: Resource, userId: string): Promise<any> {
    return FirebaseApi.addFavouriteResource(this.orgId, resource, userId);
  }

  getResources() {
    return FirebaseApi.getResourcesForOrg(this.orgId);
  }

  //TODO: make this look for the config!
  getResourceNearLocation(latitude: number, longitude: number, distance: number): Promise<Array<any>> {
    return FirebaseApi.getResourceNearLocation(
      this.networkApi,
      this.orgId,
      latitude,
      longitude,
      distance,
    );
  }

  //
  // Search API
  //----------------------------------------------------------------------

  /**
   * Get the most recent resources, courtesy of the firebase api
   */
  getRecentSearches(userId: string): Promise<string[]> {
    return Promise.resolve(['1', '2']);
    // return FirebaseApi.getRecentSearches(this.orgId, userId);
  }

  /**
   * we use the firebase api to save, as this is a user setting
   */
  saveRecentSearch(userId: string, searchQuery: string): Promise<any> {
    return FirebaseApi.saveRecentSearch(this.orgId, userId, searchQuery);
  }

  /**
   * Peform the search with the firebase api
   * TODO: implement a better search api - will require an endpoint methinks
   */
  performSearch(searchQuery: string): Promise<SearchResult> {
    return FirebaseApi.performBasicSearch(this.orgId, searchQuery);
  }

}