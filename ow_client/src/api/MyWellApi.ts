
import BaseApi from './BaseApi';
import NetworkApi from './NetworkApi';
import FirebaseApi from './FirebaseApi';
import { DeprecatedResource, SearchResult, OWUser, PendingReading, PendingResource, Reading, SaveReadingResult, SaveResourceResult } from '../typings/models/OurWater';
import UserApi from './UserApi';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import { TranslationEnum } from 'ow_translations/Types';
import { RNFirebase } from "react-native-firebase";
import { Region } from "react-native-maps";
import { AnyResource } from '../typings/models/Resource';


type Snapshot = RNFirebase.firestore.QuerySnapshot;


/**
 * MyWellApi is the MyWell variant of the BaseApi
 * 
 * 
 */
//@ts-ignore
export default class MyWellApi implements BaseApi, UserApi {
  orgId: string
  networkApi: NetworkApi;
  pendingReadingsSubscription: any;


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

  //
  // Reading API
  // 
  async saveReading(resourceId: string, userId: string, reading: Reading): Promise<SomeResult<SaveReadingResult>> {
    
    const saveResult = await FirebaseApi.saveReadingPossiblyOffineToUser(this.orgId, userId, reading);
    if (saveResult.type === ResultType.ERROR) {
      return saveResult;
    }

    //TODO: actually check login status of user
    const result: SomeResult<SaveReadingResult> = {
      type: ResultType.SUCCESS,
      result: {
        requiresLogin: false
      }
    };

    return result;
  }

  //
  // Resource API
  //----------------------------------------------------------------------

  /**
   * Add a resource to the recently viewed list
   */
  addRecentResource(resource: AnyResource, userId: string): Promise<SomeResult<AnyResource[]>> {
    return FirebaseApi.addRecentResource(this.orgId, resource, userId);
  }

  addFavouriteResource(resource: AnyResource, userId: string): Promise<SomeResult<void>> {
    return FirebaseApi.addFavouriteResource(this.orgId, resource, userId)
      .then(() => {
        const result: SomeResult<void> = { type: ResultType.SUCCESS, result: undefined };
        return result;
      });
  }

  removeFavouriteResource(resourceId: string, userId: string): Promise<SomeResult<void>> {
    return FirebaseApi.removeFavouriteResource(this.orgId, resourceId, userId)
      .then(() => {
        const result: SomeResult<void> = { type: ResultType.SUCCESS, result: undefined };
        return result;
      });
  }

  isResourceInFavourites(resourceId: string, userId: string): Promise<boolean> {
    return FirebaseApi.isInFavourites(this.orgId, resourceId, userId);
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

  async getResourcesWithinRegion(region: Region): Promise<SomeResult<AnyResource[]>> {
    return FirebaseApi.getResourcesWithinRegion(this.orgId, region);
  }

  /**
   * getResource
   * 
   * Get the resource given a resource id
   */
  getResource(id: string): Promise<SomeResult<AnyResource>> {
    return FirebaseApi.getResourceForId(this.orgId, id);
  }


  /**
   * saveResource
   */
  async saveResource(userId: string, resource: DeprecatedResource): Promise<SomeResult<SaveResourceResult>> {
    const saveResult = await FirebaseApi.saveResourceToUser(this.orgId, userId, resource);
    if (saveResult.type === ResultType.ERROR) {
      return {
        type: ResultType.ERROR,
        message: 'Could not save reading',
      };
    }

    // const credentials = await this.getExternalServiceLoginDetails();
    // if (credentials.status !== ConnectionStatus.SIGN_IN_SUCCESS) {
    //   return {
    //     type: ResultType.SUCCESS,
    //     result: {
    //       requiresLogin: true,
    //     }
    //   }
    // }

    //TODO: Implement a simliar login check as with GGMN, but ensure user doesn't have an anonymous login status
    //and their account isn't restricted.
    return {
      type: ResultType.SUCCESS,
      result: {
        requiresLogin: false,
      }
    }
  }

  //
  // Subscriptions
  //----------------------------------------------------------------

  subscribeToPendingReadings(userId: string, callback: (resources: PendingReading[]) => void): void {
    this.pendingReadingsSubscription = FirebaseApi.listenForPendingReadingsToUser(this.orgId, userId, callback);
  }

  unsubscribeFromPendingReadings() {
    if (this.pendingReadingsSubscription) {
      this.pendingReadingsSubscription.unsubscribe();
    }
  }

  subscribeToPendingResources(userId: string, callback: (resources: PendingResource[]) => void): void {
    FirebaseApi.listenForPendingResourcesToUser(this.orgId, userId, callback);
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
  async performSearch(searchQuery: string): Promise<SomeResult<SearchResult>> {
    throw new Error("Not implemented");
  }

  //
  // UserApi
  //----------------------------------------------------------------------

  getUser(userId: string): Promise<SomeResult<OWUser>> {
    return FirebaseApi.getUser(this.orgId, userId);
  }

  changeTranslation(userId: string, translation: TranslationEnum): Promise<SomeResult<void>> {
    return FirebaseApi.changeUserTranslation(this.orgId, userId, translation);
  }

  /**
 * A listener function which combines callback events from the FirebaseApi and 
 * GGMN api to inform the PendingChangesBanner of any updates it needs to make
 * 
 * We are using this subscription to also subscribe to pending readings
 * but this is an assumption which holds only for GGMN. We will need to
 * fix this later on.
 */
  subscribeToUser(userId: string, callback: any): string {
    return FirebaseApi.listenForUpdatedUser(this.orgId, userId, (sn: Snapshot) => callback(sn));
  }

}