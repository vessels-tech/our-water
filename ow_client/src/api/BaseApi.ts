import { Resource, SearchResult, Reading, SaveReadingResult, OWUser, SaveResourceResult, TimeseriesRange, PendingReading, PendingResource } from "../typings/models/OurWater";
import { Region } from "react-native-maps";
import { SomeResult } from "../typings/AppProviderTypes";
import { GGMNSearchEntity } from "../typings/models/GGMN";
import { AnySearchResult } from "../typings/models/Generics";
import { AnyResource } from "../typings/models/Resource";


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
  silentSignin(): Promise<SomeResult<string>>;


  


  //
  // Resource API
  //----------------------------------------------------------------------


  /**
   * Add a resource to the recently viewed list
   * Most likely will use Firebase
   */
  addRecentResource(resource: AnyResource, userId: string): Promise<SomeResult<AnyResource[]>>;

  /**
   * Add a resource to the favourites list
   */
  addFavouriteResource(resource: AnyResource, userId: string): Promise<SomeResult<void>>;

  /**
   * Remove a favourite resource from the favourites list
   */
  removeFavouriteResource(resourceId: string, userId: string): Promise<SomeResult<void>>;

  /**
   * Check if a resource is in the user's favourites
   */
  isResourceInFavourites(resourceId: string, userId: string): Promise<boolean>; 

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
  ): Promise<Array<AnyResource>>;

  //
  // Reading API
  //----------------------------------------------------------------------

  /**
   * Get the readings for a given timeseries. Timeseries is a concept borrowed from GGMN,
   * and a unique for a series of readings
   * 
   * //TODO: refactor for SomeResult
   */
  getReadingsForTimeseries(resourceId: string, timeseriesId: string, range: TimeseriesRange): Promise<Reading[]>;

  /**
   * Save a reading
   * 
   * Returns a SomeResult which can either be a SuccessResult or ErrorResult
   */
  saveReading(resourceId: string, userId: string, reading: Reading): Promise<SomeResult<SaveReadingResult>>;

  /**
   * Save a Resource
   * 
   * Returns a Wrapped SaveResourceResult
   */
  saveResource(userId: string, resource: Resource | PendingResource): Promise<SomeResult<SaveResourceResult>>;


  /**
   * Delete pending resource
   */
  deletePendingResource(userId: string, pendingResourceId: string): Promise<SomeResult<void>>;

  /**
   * Delete pending reading
   */
  deletePendingReading(userId: string, pendingReadingId: string): Promise<SomeResult<void>>;


  /**
   * set up a listener for changes to any pending readings
   */
  subscribeToPendingReadings(userId: string, callback: (readings: PendingReading[]) => void): void;

  /**
   * unsubscribe from the pending reading listener
   */
  unsubscribeFromPendingReadings(subscriptionId: string): void;


  /**
   * Set up a listener for changes to pending resources
   */
  subscribeToPendingResources(userId: string, callback: (resources: PendingResource[]) => void): void;

  /**
   * get the pending readings for this user
   */
  getPendingReadings(userId: string): Promise<Reading[]>;

  /**
   * get the pending readings for this user and resourceId
   */
  getPendingReadingsForResourceId(userId: string, resourceId: string): Promise<Reading[]>;

  /**
   * Get the resources within a region.
   * May not necessarily return all resources if the region is too large
   */
  getResourcesWithinRegion(region: Region): Promise<SomeResult<AnyResource[]>>;

  /**
   * Get a resource for an id.
   */
  getResource(id: string): Promise<SomeResult<AnyResource>>;


  /**
   * GetShortId
   * 
   * Gets the shortened id for the given resource
   */
  getShortId(resource: AnyResource): Promise<SomeResult<string>>;


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
  performSearch(searchQuery: string, page: number): Promise<SomeResult<AnySearchResult>>;


  /**
   * Once GGMN loads a resource from a search, we need to use the entityId to convert it to a fully 
   * fledged Resource
   */
  getResourceFromSearchEntityId(userId: string, entityId: string): Promise<SomeResult<AnyResource>>;
}