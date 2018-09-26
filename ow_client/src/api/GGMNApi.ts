import BaseApi from "./BaseApi";
import NetworkApi from "./NetworkApi";
import { RNFirebase, Firebase } from "react-native-firebase";
import FirebaseApi from "./FirebaseApi";
import * as Keychain from 'react-native-keychain';
//@ts-ignore
import { default as ftch } from 'react-native-fetch-polyfill';
type Snapshot = RNFirebase.firestore.QuerySnapshot;


import { appendUrlParameters, rejectRequestWithError, calculateBBox, naiveParseFetchResponse, getDemoResources } from "../utils";
import { GGMNLocationResponse, GGMNLocation, GGMNOrganisationResponse, GGMNGroundwaterStationResponse, GGMNGroundwaterStation, GGMNTimeseriesResponse, GGMNTimeseriesEvent, GGMNTimeseries, GGMNSaveReadingResponse } from "../typings/models/GGMN";
import { Resource, SearchResult, Reading, SaveReadingResult, OWTimeseries, OWTimeseriesResponse, OWTimeseriesEvent, OWUser } from "../typings/models/OurWater";
import { ResourceType } from "../enums";
import ExternalServiceApi from "./ExternalServiceApi";
import { LoginRequest, OptionalAuthHeaders, LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus } from "../typings/api/ExternalServiceApi";
import { Region } from "react-native-maps";
import { isNullOrUndefined } from "util";
import * as moment from 'moment';
import { SyncStatus } from "../typings/enums";
import { SomeResult, ResultType } from "../typings/AppProviderTypes";
import UserApi from "./UserApi";

// TODO: make configurable
const timeout = 1000 * 100;
const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export interface GGMNApiOptions {
  baseUrl: string,
  auth?: any,
}


/**
 * The GGMN Api.
 * 
 * TODO: make an interface, and share components with BaseApi.js
 */
class GGMNApi implements BaseApi, ExternalServiceApi, UserApi {
  auth: any = null;
  baseUrl: string;
  networkApi: NetworkApi;
  orgId: string;
  unsubscribeUser: any;

  // private syncStatusCallback: any;

  firebasePendingReadingsSubscriptionId: string | null = null;
  pendingReadingsSubscriptions: Map<string, any> = new Map<string, any>();

  /**
   * initialize with options
   * 
   * If options.auth is present then the user will be considered logged in
   * TODO: how to we pass this in with 
   */
  constructor(networkApi: NetworkApi, orgId: string, options: GGMNApiOptions) {
    this.baseUrl = options.baseUrl;
    if (options.auth) {
      this.auth = options.auth;
    }

    this.networkApi = networkApi;
    this.orgId = orgId;

  }

  //
  // Auth API
  //----------------------------------------------------------------------

  /**
   * Sign the user in anonymously with Firebase
   */
  silentSignin(): Promise<SomeResult<string>> {
    return FirebaseApi.signIn();
  }

  /**
  * Connect to an external service.
  * This is really just a check to see that the login credentials provided work.
  * 
  * Maybe we don't need to save the sessionId. It should be handled
  * automatically by our cookies
  */
  connectToService(username: string, password: string): Promise<LoginDetails | EmptyLoginDetails> {
    const url = `${this.baseUrl}/api/v3/organisations/`;
    console.log("url is", url);
    let signInResponse: LoginDetails | EmptyLoginDetails;

    const options = {
      timeout,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        username,
        password,
      },
      credentials: 'include' //make sure fetch sets the cookie for us.
    };

    return ftch(url, options)
      .then((response: any) => naiveParseFetchResponse<GGMNOrganisationResponse>(response))
      .then((r: GGMNOrganisationResponse) => {
        console.log(r);

        return {
          type: LoginDetailsType.FULL,
          status: ConnectionStatus.SIGN_IN_SUCCESS,
          username,
        };
      })
      .catch((err: Error) => {
        //Sign in failed:
        return {
          type: LoginDetailsType.FULL,
          status: ConnectionStatus.SIGN_IN_ERROR,
          username,
        };
      })
      .then((_signInResponse: LoginDetails | EmptyLoginDetails) => {
        signInResponse = _signInResponse;

        //TODO: fix this, I think it's saving the details even if the 
        return this.saveExternalServiceLoginDetails(username, password)
        .catch(err => {
          //Couldn't save the creds for some reason
          signInResponse = {
            type: LoginDetailsType.EMPTY,
            status: ConnectionStatus.NO_CREDENTIALS,
          };
        })
      })
      .then(() => signInResponse)
  }

  /**
   * This is a broken implementation, we will use a different endpoint instead
   */
  private dep_connectToService(username: string, password: string): Promise<LoginDetails | EmptyLoginDetails> {
    const url = `${this.baseUrl}/api-auth/login/`;
    console.log("URL is", url);
    
    const rawParams: LoginRequest = {
      username,
      password,
    };
    
    const body = Object.keys(rawParams).map((k: string) => {
      return encodeURIComponent(k) + '=' + encodeURIComponent(rawParams[k])
    })

    const options = {
      timeout,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.join('&'),
      credentials: 'include'
    };

    //This fetch doesn't have a freaking timeout!
    return ftch(url, options)
    .then((response: any) => {
      if (!response.ok) {
        return rejectRequestWithError(response.status);
      }

      //This still comes back with html, not json thanks to the dodgy api
      console.log(response);
      console.log("all headers", response.headers.getAll())
      return 
    });
  }

  /**
   * Save the external service details, locally only
   */
  async saveExternalServiceLoginDetails(username: string, password: string): Promise<any> {
    await Keychain.setGenericPassword(username, password);

    return true 
  }


  async getExternalServiceLoginDetails(): Promise<LoginDetails | EmptyLoginDetails> {
    //Try performing a login first, just in case
    let credentials;
    try {
      credentials = await this.getCredentials();
      console.log('getExternalServiceLoginDetails got credentials', credentials);
    } catch (err) {
      //No credentials:
      return {
        type: LoginDetailsType.EMPTY,
        status: ConnectionStatus.NO_CREDENTIALS,
      }
    }

    try {
      const result = await this.connectToService(credentials.username, credentials.password);
      console.log("connectToService result", result);

      return result;
    } catch (err) {
      console.log("error logging in", err);
      return {
        type: LoginDetailsType.FULL,
        status: ConnectionStatus.SIGN_IN_ERROR,
        username: credentials.username,
      };
    }
  }

  forgetExternalServiceLoginDetails(): Promise<any> {
    return Keychain.resetGenericPassword();
  }

  private async getCredentials(): Promise<{ service: string, username: string, password: string }> {
    const credentials = await Keychain.getGenericPassword();
    if (credentials === false) {
      throw new Error("Could not get saved credentials");
    }

    if (credentials === true) {
      throw new Error("Error with Keychain API");
    }

    return credentials;
  }

  /**
   * If the Keychain has credentials, then return the 
   * auth headers. Otherwise, return an empty dict
   */
  private getOptionalAuthHeaders(): Promise<OptionalAuthHeaders> {
    return this.getCredentials()
    .then(credentials => {
      return {
        username: credentials.username,
        password: credentials.password,
      };
    })
    .catch(err => {
      // this is fine, just return an empty headers object
      return {};
    });
  }

  //
  // Resource API
  //----------------------------------------------------------------------

  /**
   * Add a resource to the recently viewed list
   */
  addRecentResource(resource: Resource, userId: string): Promise<SomeResult<Resource[]>> {
    console.log("userId is:", userId);
    return FirebaseApi.addRecentResource(this.orgId, resource, userId);
  }

  addFavouriteResource(resource: Resource, userId: string): Promise<SomeResult<void>> {

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


  /**
   * GET resources
   * 
   * Gets the resources and recent readings from GGMN api.
   * TODO: figure out pagination and whatnot!
   * Maybe we can sort by updatedAt
   */
  getResources(): Promise<Array<Resource>> {
    //TODO: confirm this - based on  the web app, it should be groundwaterstations, not locations
    // const resourceUrl = `${this.baseUrl}/api/v3/locations/`;
    const resourceUrl = `${this.baseUrl}/api/v3/groundwaterstations/`;
    const url = appendUrlParameters(resourceUrl, {
      // page: 0,
      page_size: 100,
    });
    console.log("URL is", url);
    
    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    return ftch(url, options)
    .then((response: any) => naiveParseFetchResponse<GGMNGroundwaterStationResponse>(response))
    .then((response: GGMNGroundwaterStationResponse) => {
      return response.results.map(from => GGMNApi.ggmnStationToResource(from));
    });
  }
  
  async getResourcesWithinRegion(region: Region): Promise<Resource[]> {
    //TODO: confirm this - based on  the web app, it should be groundwaterstations, not locations
    // const resourceUrl = `${this.baseUrl}/api/v3/locations/`;
    const resourceUrl = `${this.baseUrl}/api/v3/groundwaterstations/`;
    const bBox = calculateBBox(region);
    const url = appendUrlParameters(resourceUrl, {
      page_size: 100,
      in_bbox: `${bBox[0]},${bBox[1]},${bBox[2]},${bBox[3]}`
    });
    console.log("URL is", url);

    const authHeaders = await this.getOptionalAuthHeaders();
    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders
      }
    };

    return ftch(url, options)
      .then((response: any) => naiveParseFetchResponse<GGMNGroundwaterStationResponse>(response))
      .then((response: GGMNGroundwaterStationResponse) => {
        return response.results.map(from => GGMNApi.ggmnStationToResource(from));
      });
  }

  getResourceNearLocation(latitude: number, longitude: number, distance: number): Promise<Array<Resource>> {
    const realDistance = distance * 1000000; //not sure what units distance is in
    //TODO: confirm this - based on  the web app, it should be groundwaterstations, not locations
    // const resourceUrl = `${this.baseUrl}/api/v3/locations/`;
    const resourceUrl = `${this.baseUrl}/api/v3/groundwaterstations/`;
    const url = appendUrlParameters(resourceUrl, {
      dist: realDistance,
      point: `${longitude},${latitude}`
    });

    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    return ftch(url, options)
      .then((response: any) => naiveParseFetchResponse<GGMNGroundwaterStationResponse>(response))
      .then((response: GGMNGroundwaterStationResponse) => {
        //TODO: finish getting the resources
        return response.results.map(from => GGMNApi.ggmnStationToResource(from));
      });
  }

  getResource(id: string): Promise<Resource> {
    const resourceUrl = `${this.baseUrl}/api/v3/groundwaterstations/${id}`;
    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    return ftch(resourceUrl, options)
      .then((response: any) => naiveParseFetchResponse<GGMNGroundwaterStation>(response))
      .then((resource: GGMNGroundwaterStation) => GGMNApi.ggmnStationToResource(resource));
  }


  //
  // Reading API
  //----------------------------------------------------------------------

  /**
   * Get the readings for a given timeseries. Timeseries is a concept borrowed from GGMN, 
   * and a unique for a series of readings
   * 
   * @param resourceId: string -> The id of the resource. Not strictly required for the 
   *    GGMN api, but required to refer to the reading later on.
   * @param timeseriesId: string  -> The id of the timeseries
   * @param startDate: string  -> Unix timestamp date. The start date of the readings
   * @param endDate: string  -> Unix timestamp date. The end date of the readings,
   * 
   * Example url: https://ggmn.lizard.net/api/v3/timeseries/?end=1304208000000&min_points=320&start=1012915200000&uuid=fb82081d-d16a-400e-98da-20f1bf2f5433
   */
  async getReadingsForTimeseries(resourceId: string, timeseriesId: string, startDate: number, endDate: number): Promise<Reading[]> {
    const readingUrl = `${this.baseUrl}/api/v3/timeseries/`;
    const url = appendUrlParameters(readingUrl, {
      uuid: timeseriesId,
      startDate,
      endDate,
      //I don't know why we need this, but it's taken straight from the GGMN site
      min_points: 320
    });

    const authHeaders = await this.getOptionalAuthHeaders();
    const options = {
      timeout,
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...authHeaders,
      },
    };

    console.log("getReadingsForTimeseries url:", url);

    return ftch(url, options)
    .then((response: any): Promise<GGMNTimeseriesResponse> | Promise<never> => {
      if (!response.ok) {
        return rejectRequestWithError(response.status);
      }

      return response.json();
    })
    .then((parsed: GGMNTimeseriesResponse) => {
      return {
        count: parsed.count,
        next: parsed.next,
        previous: parsed.previous,
        results: parsed.results.map((result: any): OWTimeseries => (
          {
            id: result.uuid,
            name: result.name,
            parameter: result.parameter,
            unit: result.unit,
            referenceFrame: result.reference_frame,
            scale: result.scale,
            valueType: result.value_type,
            location: result.location,
            //TODO: should this really default to 0?
            lastValue: result.last_value || 0,
            //If events, parse them out, otherwise default to an empty array!
            events: result.events ? result.events.map((e: any) => ({timestamp: e.timestamp, value: e.value})) : [],
         }
        ))
      };
    })
    .then((response: OWTimeseriesResponse) => {
      //Convert GGMNTimeseriesResponse to something we can use

      if (response.results.length === 0) {
        return Promise.reject(new Error(`Couldn't find readings for timeseriesId: ${timeseriesId} with given date range.`));
      }

      if (response.results.length > 1) {
        return Promise.reject(new Error("WARNING: getReadingsForTimeseries returned multiple results. This shouldn't happen."));
      }

      if (isNullOrUndefined(response.results[0].events)) {
        return Promise.reject(new Error(`Error with getReadingsForTimeseries, events is undefined.`));
      }

      const timeseries: OWTimeseries = response.results[0];
      return timeseries.events.map((e: OWTimeseriesEvent): Reading => {
        return {
          resourceId,
          date: moment(e.timestamp).toISOString(),
          value: e.value,
          timeseriesId: timeseries.id,
        };
      });
    });

  }

  /**
   * Save the reading 
   * 
   * This saves the reading only to the user's object in Firebase. We will sync with GGMN later on
   *  1. First, we save to our user's object in firebase
   *  2. Then we persist the reading actually to GGMN
   * 
   * That way, we can get the benefits of local caching and offline mode, 
   * as well as the actual syncing with GGMN. 
   * 
   * TODO: figure out how to trigger #2, can trigger now, and then if it fails, 
   * put it on a timer/user click banner
   */
  async saveReading(resourceId: string, userId: string, reading: Reading): Promise<SomeResult<SaveReadingResult>> {

    const saveResult = await FirebaseApi.saveReadingPossiblyOffineToUser(this.orgId, userId, reading);
    if (saveResult.type === ResultType.ERROR) {
      return {
        type: ResultType.ERROR,
        message: 'Could not save reading',
      };
    }

    const credentials = await this.getExternalServiceLoginDetails();
    if (credentials.status !== ConnectionStatus.SIGN_IN_SUCCESS) {
      return {
        type: ResultType.SUCCESS,
        result: {
          requiresLogin: true,
        }
      }
    }

    return {
      type: ResultType.SUCCESS,
      result: {
        requiresLogin: false,
      }
    }
  }

  async saveResource(userId: string, resource: Resource): Promise<SomeResult<null>> {
    return await FirebaseApi.saveResourceToUser(this.orgId, userId, resource);
  }


  private async persistReadingToGGMN(reading: Reading): Promise<any> {
    const tsId = '8cd4eec3-1c76-4ebb-84e6-57681f15424f'; //TODO: Just temporary!
    // const tsId = reading.timeseriesId;
    const url = `${this.baseUrl}/api/v3/timeseries/${tsId}/data/`;
    const data = [{
      datetime: reading.date, //this must be in UTC, otherwise we get a 500.
      value: reading.value,
    }];

    const authHeaders = await this.getOptionalAuthHeaders();
    //Auth headers are required to save readings
    if (!authHeaders.username) {
      throw new Error("Authorization is required to save readings to GGMN.");
    }
    const options = {
      timeout,
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...authHeaders,
      },
      body: JSON.stringify(data),
    };

    console.log("url is", url);
    console.log("options are:", options);

    return ftch(url, options)
    .then((response: any) => naiveParseFetchResponse<GGMNSaveReadingResponse>(response))
    .then((response: GGMNSaveReadingResponse) => response)
    .then(() => this.removeReadingFromPendingList(reading));

  }

  //TODO: should we implement some sort of id? It is in a firebase collection after all...
  private removeReadingFromPendingList(reading: Reading): Promise<any> {
    return Promise.resolve(true);
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

  unsubscribeFromUser(subscriptionId: string): void {
    if (this.pendingReadingsSubscriptions.has(subscriptionId)) {
      this.pendingReadingsSubscriptions.delete(subscriptionId);
    }

    if (this.pendingReadingsSubscriptions.size === 0) {
      //TODO: unsubscripe from firebase updates
      this.unsubscribeUser();
    }
  }


  subscribeToPendingReadings(userId: string, callback: (resources: Reading[]) => void): void {
    FirebaseApi.listenForPendingReadingsToUser(this.orgId, userId, callback);
  }

  subscribeToPendingResources(userId: string, callback: (resources: Resource[]) => void): void {
    FirebaseApi.listenForPendingReadingsToUser(this.orgId, userId, callback);
  }


  firebasePendingReadingsCallback(sn: Snapshot) {
    if (sn.metadata.hasPendingWrites) {
      // this.apiState.bannerState = BannerState.pendingFirebaseWrites;
      this.updatePendingReadingSubscribers(SyncStatus.pendingFirebaseWrites);
    }
  }

  //TODO: we need to maintain some sort of internal state and ordering here.

  updatePendingReadingSubscribers(syncStatus: SyncStatus) {

    const subscribers = this.pendingReadingsSubscriptions;

    // console.log("updating subscripers", bannerState, subscribers);
    //TODO: add other metadata here!
    let keys = [...subscribers.keys()];
    keys.forEach(key => {
      console.log("updatingSubscriber:", key);
      const callback = subscribers.get(key);
      //TODO: reenable
      callback(syncStatus);
    });
  }

  getPendingReadings(userId: string): Promise<Reading[]> {
    return FirebaseApi.getPendingReadingsFromUser(this.orgId, userId);
  }

  getPendingReadingsForResourceId(userId: string, resourceId: string): Promise<Reading[]> {
    return FirebaseApi.getPendingReadingsForUserAndResourceId(this.orgId, userId, resourceId);
  }


  //
  // Search API
  //----------------------------------------------------------------------

  /**
   * Get the most recent resources, courtesy of the firebase api
   */
  getRecentSearches(userId: string): Promise<string[]> {
    return FirebaseApi.getRecentSearches(this.orgId, userId);
  }

  /**
   * we use the firebase api to save, as this is a user setting
   */
  saveRecentSearch(userId: string, searchQuery: string): Promise<any> {
    return FirebaseApi.saveRecentSearch(this.orgId, userId, searchQuery);
  }

  /**
   * Perform a search using the GGMN Api
   */
  performSearch(searchQuery: string): Promise<SearchResult> {

    //TODO: implement search for offline mode
    return Promise.resolve({
      resources: getDemoResources(20),
      // resources: [],
      groups:[],
      users: [],
      offline: false,
    });
  }


  //
  // UserApi
  //----------------------------------------------------------------------
  getUser(userId: string): Promise<SomeResult<OWUser>> {
    return FirebaseApi.getUser(this.orgId, userId);
  }



  //
  // Utils
  //----------------------------------------------------------------------

  //TODO: this will fall apart, as we need a specific GGMNResource type :(
  //For now, we can make OurWater handle all the fields, and worry about making
  //it flexible later on
  static ggmnStationToResource(from: GGMNGroundwaterStation): Resource {
    const to: Resource = {
      id: `${from.id}`,
      legacyId: `ggmn_${from.id}`,
      groups: null,
      lastValue: 0,
      resourceType: ResourceType.well,
      lastReadingDatetime: new Date(),
      coords: {
        _latitude: from.geometry.coordinates[1],
        _longitude: from.geometry.coordinates[0],
      },
      owner: {
        name: from.name,
      },
      timeseries: from.filters[0].timeseries.map(ts => this.ggmnTimeseriesToTimeseries(ts))
    };

    return to;
  }

  static ggmnTimeseriesToTimeseries(from: GGMNTimeseries): OWTimeseries {
    return {
      id: from.uuid,
      name: from.name,
      parameter: from.parameter,
      unit: from.unit,
      referenceFrame: from.reference_frame,
      scale: from.scale,
      valueType: from.value_type,
      location: from.location,
      lastValue: from.last_value,
      events: !from.events ? [] : from.events.map((e: GGMNTimeseriesEvent) => ({timestamp: e.timestamp, value: e.value}))
    };
  }
}

export default GGMNApi;