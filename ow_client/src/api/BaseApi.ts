import { Resource, SearchResult } from "../typings/models/OurWater";
import { Region } from "react-native-maps";


/**
 * BaseApi is the base API for Our Water
 */
export default interface BaseApi {
  
  //
  // Auth API
  //----------------------------------------------------------------------

  /**
   * Sign in the user sliently.
   * Most likely, this will use the FirebaseAPI behind the scenes
   */
  silentSignin(): Promise<any>;


  


  //
  // Resource API
  //----------------------------------------------------------------------


  /**
   * Add a resource to the recently viewed list
   * Most likely will use Firebase
   */
  addRecentResource(resource: Resource, userId: string): Promise<any>;

  /**
   * Add a resource to the favourites list
   */
  addFavouriteResource(resource: Resource, userId: string): Promise<any>

  /**
   * Get a bunch of resources
   * No guarantee that this is all the resources
   */
  getResources(): any;


  /**
   * Get all resources close to a location.
   */
  getResourceNearLocation(
    latitude: number,
    longitude: number,
    distance: number
  ): Promise<Array<Resource>>;


  /**
   * Get the resources within a region.
   * May not necessarily return all resources if the region is too large
   */
  getResourcesWithinRegion(region: Region): Promise<Array<Resource>>;

  //
  // Search API
  //----------------------------------------------------------------------

  /**
   * Get the most recent searches from the user, sorted newest to oldest
   * will limit to something like 5 searches
   */
  getRecentSearches(userId: string): Promise<string[]>;

  /**
   * Save a search to the user's recent searches
   */
  saveRecentSearch(userId: string, searchQuery: string): Promise<any>;

  /**
   * Perform a search with the given search query
   * Will return an assortment of search results
   * 
   * If the user is currently offline, API will still try and complete
   * the search if possible.
   */
  performSearch(searchQuery: string): Promise<SearchResult>;

}