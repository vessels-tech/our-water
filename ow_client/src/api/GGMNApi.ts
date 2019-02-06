import BaseApi from "./BaseApi";
import NetworkApi from "./NetworkApi";
import { RNFirebase, Firebase } from "react-native-firebase";
import FirebaseApi, { SendResourceEmailOptions } from "./FirebaseApi";
import * as Keychain from 'react-native-keychain';
//@ts-ignore
import { default as ftch } from '../utils/Fetch';
type Snapshot = RNFirebase.firestore.QuerySnapshot;


import { appendUrlParameters, rejectRequestWithError, calculateBBox, convertRangeToDates, deprecated_naiveParseFetchResponse, naiveParseFetchResponse, maybeLog, dedupArray } from "../utils";
import { GGMNOrganisationResponse, GGMNGroundwaterStationResponse, GGMNGroundwaterStation, GGMNTimeseriesResponse, GGMNTimeseriesEvent, GGMNSaveReadingResponse, GGMNSearchResponse, GGMNSearchEntity, GGMNOrganisation, KeychainLoginDetails, GGMNResponseTimeseries, GGMNUsersResponse } from "../typings/models/GGMN";
import { DeprecatedResource, SearchResult, Reading, SaveReadingResult, OWTimeseries, OWTimeseriesResponse, OWTimeseriesEvent, OWUser, SaveResourceResult, TimeseriesRange } from "../typings/models/OurWater";
import ExternalServiceApi, { ExternalServiceApiType } from "./ExternalServiceApi";
import { OptionalAuthHeaders, LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus, AnyLoginDetails, ExternalSyncStatusType, ExternalSyncStatusComplete, SyncError } from "../typings/api/ExternalServiceApi";
import { Region } from "react-native-maps";
import { isNullOrUndefined, isNull } from "util";
import * as moment from 'moment';
import { SyncStatus } from "../typings/enums";
import { SomeResult, ResultType, makeSuccess, makeError, SuccessResult } from "../typings/AppProviderTypes";
import UserApi from "./UserApi";
import { TranslationEnum } from "ow_translations";
import { AnyResource, GGMNResource } from "../typings/models/Resource";
import { OrgType } from "../typings/models/OrgType";
import ExtendedResourceApi, { ExtendedResourceApiType, CheckNewIdResult } from "./ExtendedResourceApi";
import { PendingReading } from "../typings/models/PendingReading";
import { AnyReading, GGMNReading } from "../typings/models/Reading";
import { PendingResource } from "../typings/models/PendingResource";
import { GGMNTimeseries, AnyTimeseries } from "../typings/models/Timeseries";
import { AnonymousUser } from "../typings/api/FirebaseApi";
import { SignInStatus } from "../screens/menu/SignInScreen";
import { CacheType } from "../reducers";
import { RemoteConfig } from "../config/ConfigFactory";
import { Cursor } from "../screens/HomeMapScreen";

// TODO: make configurable
const timeout = 1000 * 30; //30 seconds
const searchPageSize = 20;
const GGMN_REGION_SCALE_AMOUNT = 0.65;
const GGMN_PAGE_SIZE = 10;
const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export interface GGMNApiOptions {
  baseUrl: string,
  auth?: any,
  // remoteConfig: RemoteConfig,
}


/**
 * The GGMN Api.
 * 
 * TODO: make an interface, and share components with BaseApi.js
 */
class GGMNApi implements BaseApi, ExternalServiceApi, UserApi, ExtendedResourceApi {
  auth: any = null;
  baseUrl: string;
  // remoteConfig: RemoteConfig;
  networkApi: NetworkApi;
  orgId: string;
  pendingReadingsSubscription: any;
  externalServiceApiType: ExternalServiceApiType.Has = ExternalServiceApiType.Has;
  extendedResourceApiType: ExtendedResourceApiType.Has = ExtendedResourceApiType.Has;

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
    // this.remoteConfig = options.remoteConfig;
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
  silentSignin(): Promise<SomeResult<AnonymousUser>> {
    return FirebaseApi.signIn();
  }

  /**
  * Connect to an external ser  vice.
  * This is really just a check to see that the login credentials provided work.
  * 
  * Maybe we don't need to save the sessionId. It should be handled
  * automatically by our cookies
  */
  connectToService(username: string, password: string, externalOrg: GGMNOrganisation | null = null): Promise<AnyLoginDetails> {
    const organisationUrl = `${this.baseUrl}/api/v3/organisations/`;
    const url = appendUrlParameters(organisationUrl, {
      page_size: 5,
    });
    maybeLog("connectToService url is", url);
    maybeLog("connectToService, externalOrg is:", externalOrg);

    let signInResponse: AnyLoginDetails;
    let resolvedExternalOrg: GGMNOrganisation;
    if (externalOrg) {
      resolvedExternalOrg = externalOrg;
    }

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
      .then((r: SomeResult<GGMNOrganisationResponse>) => {
        if (r.type === ResultType.ERROR) {
          return {
            type: LoginDetailsType.FULL,
            status: ConnectionStatus.SIGN_IN_ERROR,
            username,
          }
        }

        if (r.result.results.length === 0) {
          throw new Error('Logged in user, but no organisations found.');
        }

        if (!resolvedExternalOrg) {
          resolvedExternalOrg = r.result.results[0];
        }

        return {
          type: LoginDetailsType.FULL,
          status: ConnectionStatus.SIGN_IN_SUCCESS,
          username,
          externalOrg: resolvedExternalOrg,
        };
      })
      .then((_signInResponse: AnyLoginDetails) => {
        signInResponse = _signInResponse;

        const user: KeychainLoginDetails = {
          username,
          externalOrg: resolvedExternalOrg,
        }

        if (_signInResponse.type === LoginDetailsType.FULL 
          && _signInResponse.status === ConnectionStatus.SIGN_IN_SUCCESS
          ) {
            return this.saveExternalServiceLoginDetails(user, password)
            .catch(err => {
              //Couldn't save the creds for some reason
              signInResponse = {
                type: LoginDetailsType.EMPTY,
                status: ConnectionStatus.NO_CREDENTIALS,
              };
            })
          }
      })
      .then(() => signInResponse)
      .catch((err: Error) => {
        maybeLog("connectToService caught error: " + err.message);

        return {
          type: LoginDetailsType.FULL,
          status: ConnectionStatus.SIGN_IN_ERROR,
          username,
        }
      });
  }

  /**
   * Save the external service details, locally only
   */
  async saveExternalServiceLoginDetails(user: KeychainLoginDetails, password: string): Promise<any> {
    await Keychain.setGenericPassword(encodeURIComponent(JSON.stringify(user)), password);

    return true 
  }


  async getExternalServiceLoginDetails(): Promise<AnyLoginDetails> {
    //Try performing a login first, just in case
    let credentials;
    try {
      credentials = await this.deprecatedGetCredentials();
    } catch (err) {
      //No credentials:
      return {
        type: LoginDetailsType.EMPTY,
        status: ConnectionStatus.NO_CREDENTIALS,
      }
    }

    try {
      const user: KeychainLoginDetails = JSON.parse(decodeURIComponent(credentials.username));
      const result = await this.connectToService(user.username, credentials.password, user.externalOrg);

      return result;
    } catch (err) {
      maybeLog("error logging in", err);
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

  async getExternalOrganisations(): Promise<SomeResult<GGMNOrganisation[]>> {
    const credentialsResult = await this.getCredentials();
    if (credentialsResult.type === ResultType.ERROR) {
      return credentialsResult;
    }

    const username = credentialsResult.result.user.username;
    const password = credentialsResult.result.password;

    const organisationUrl = `${this.baseUrl}/api/v3/organisations/`;
    const url = appendUrlParameters(organisationUrl, {
      page_size: 100,
    });

    maybeLog("connectToService url is", url);

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

    const fetchResult: any = await ftch(url, options);
    const orgResult: SomeResult<GGMNOrganisationResponse> = await naiveParseFetchResponse<GGMNOrganisationResponse>(fetchResult);
    if (orgResult.type === ResultType.ERROR) {
      return orgResult;
    }

    return {
      type: ResultType.SUCCESS,
      result: orgResult.result.results
    };
  }

  private async getCredentials(): Promise<SomeResult<{user: KeychainLoginDetails, password: string}>> {
    const credentials = await Keychain.getGenericPassword();
  
    if (credentials === false) {
      return {
        type: ResultType.ERROR,
        message: "Could not get saved credentials",
      }
    }

    if (credentials === true) {
      return {
        type: ResultType.ERROR,
        message: "Error with Keychain API",
      }
    }
    
    let user;
    try {
      user = JSON.parse(decodeURIComponent(credentials.username));
    } catch (err) {
      return {
        type: ResultType.ERROR,
        message: "Error deserializing the user object",
      }
    }

    if (!user) {
      return {
        type: ResultType.ERROR,
        message: "Error deserializing the user object",
      }
    }

    return {
      type: ResultType.SUCCESS,
      result: {
        user,
        password: credentials.password
      }
    }
  }


  private async deprecatedGetCredentials(): Promise<{ service: string, username: string, password: string }> {
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
   * Update the user credentials object with the new Organisation
   */
  async selectExternalOrganisation(organisation: GGMNOrganisation): Promise<SomeResult<void>> {
    const credentialsResult = await this.getCredentials();
    if (credentialsResult.type === ResultType.ERROR) {
      return credentialsResult;
    }

    const username = credentialsResult.result.user.username
    const password = credentialsResult.result.password;

    const loginDetails: KeychainLoginDetails = {
      username,
      externalOrg: organisation,
    };

    try {
      await this.saveExternalServiceLoginDetails(loginDetails, password);
    } catch (err) {
      maybeLog("couldn't save external service login details");
      return {
        type: ResultType.ERROR,
        message: "Error saving login details for user"
      }
    }

    return {
      type: ResultType.SUCCESS,
      result: undefined,
    }
  }


  /**
   * If the Keychain has credentials, then return the 
   * auth headers. Otherwise, return an empty dict
   */
  private async getOptionalAuthHeaders(): Promise<SomeResult<OptionalAuthHeaders>> {
    const credentialsResult = await this.getCredentials();
    if (credentialsResult.type === ResultType.ERROR) {
      return credentialsResult;
    }

    const headers: OptionalAuthHeaders = {
      username: credentialsResult.result.user.username,
      password: credentialsResult.result.password,
    } 

    return {
      type: ResultType.SUCCESS,
      result: headers,
    }
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


  /**
   * GET resources
   * 
   * Gets the resources and recent readings from GGMN api.
   * TODO: figure out pagination and whatnot!
   * Maybe we can sort by updatedAt
   */
  getResources(): Promise<Array<DeprecatedResource>> {
    //TODO: confirm this - based on  the web app, it should be groundwaterstations, not locations
    // const resourceUrl = `${this.baseUrl}/api/v3/locations/`;
    const resourceUrl = `${this.baseUrl}/api/v3/groundwaterstations/`;
    const url = appendUrlParameters(resourceUrl, {
      // page: 0,
      page_size: 100,
    });
    maybeLog("getResources URL is", url);
    
    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    return ftch(url, options)
    .then((response: any) => deprecated_naiveParseFetchResponse<GGMNGroundwaterStationResponse>(response))
    .then((response: GGMNGroundwaterStationResponse) => {
      return response.results.map(from => GGMNApi.ggmnStationToResource(from));
    });
  }
  
  async getResourcesWithinRegion(region: Region, cursor?: Cursor): Promise<SomeResult<AnyResource[]>> {
    if (!cursor) {
      cursor = {
        hasNext: true,
        page: 1,
        limit: GGMN_PAGE_SIZE,
      }
    }

    //Remove the edges from the region, this makes it less likely that locations off the map will load
    const trimmedRegion: Region = {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta * GGMN_REGION_SCALE_AMOUNT,
      longitudeDelta: region.longitudeDelta * GGMN_REGION_SCALE_AMOUNT,
    }

    const resourceUrl = `${this.baseUrl}/api/v3/groundwaterstations/`;
    const bBox = calculateBBox(trimmedRegion);
    //Stop the page size from being too big
    let page_size = 200;
    if (cursor.limit <= 200) {
      page_size = cursor.limit;
    }

    const url = appendUrlParameters(resourceUrl, {
      page_size,
      in_bbox: `${bBox[0]},${bBox[1]},${bBox[2]},${bBox[3]}`,
      page: cursor.page,
    });
    maybeLog("getResourcesWithinRegion. URL is", url);

    const authHeadersResult = await this.getOptionalAuthHeaders();
    let authHeaders = {};
    //even if login is bad, load the resources
    if (authHeadersResult.type !== ResultType.ERROR) {
      authHeaders = authHeadersResult.result;
    }

    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
      }
    };
    
    return ftch(url, options)
      .then((response: any) => deprecated_naiveParseFetchResponse<GGMNGroundwaterStationResponse>(response))
      .then((response: GGMNGroundwaterStationResponse) => {
        
        return response.results.map(from => GGMNApi.ggmnStationToResource(from))
      })
      .then((resources: AnyResource[]) => ({type: ResultType.SUCCESS, result: resources}))
      .catch((err: Error) => {
        maybeLog("Error loading resources:", err);
        return {type: ResultType.ERROR, message:'Error loading resources.'};
      })
  }

  /**
  * Get the resources within a region, paginated
  * If the region is too large, returns a cursor referring to next page.
  */
  async getResourcesWithinRegionPaginated(region: Region, cursor: Cursor): Promise<SomeResult<[AnyResource[], Cursor]>> {
    //Use the existing call to make backwards compatible
    const result = await this.getResourcesWithinRegion(region, cursor);

    if (result.type === ResultType.ERROR) {
      return result;
    }

    // const nextCursor: Cursor = cursor;
    let hasNext = false;
    let limit = cursor.limit;
    let page = cursor.page + 1;
    //Implicit next - this means we can leave getResourcesWithinRegion untouched
    if (result.result.length === cursor.limit) {
      hasNext = true;
    }

    const nextCursor: Cursor = {
      hasNext,
      limit,
      page,
    };

    const response: [AnyResource[], Cursor] = [result.result, nextCursor];
    return makeSuccess(response);
  }

  getResourceNearLocation(latitude: number, longitude: number, distance: number): Promise<Array<AnyResource>> {
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
      .then((response: any) => deprecated_naiveParseFetchResponse<GGMNGroundwaterStationResponse>(response))
      .then((response: GGMNGroundwaterStationResponse) => {
        //TODO: finish getting the resources
        return response.results.map(from => GGMNApi.ggmnStationToResource(from));
      });
  }

  getResource(id: string): Promise<SomeResult<AnyResource>> {
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
      .then((response: any) => deprecated_naiveParseFetchResponse<GGMNGroundwaterStation>(response))
      .then((resource: GGMNGroundwaterStation) => GGMNApi.ggmnStationToResource(resource))
      .then((r: DeprecatedResource) => {
        const result: SomeResult<DeprecatedResource> = {type: ResultType.SUCCESS, result: r};
        return result;
      })
      .catch((err: Error) => {
        maybeLog("Error loading resource:", err);
        const result: SomeResult<DeprecatedResource> = { type: ResultType.ERROR, message: 'Error loading resource.' };
        return result;
      });
  }

  /**
   * GetShortId
   * 
   * GGMN doesn't use shortened ids.
   */
  getShortId(resourceId: string): Promise<SomeResult<string>> {
    const result: SomeResult<string> = { type: ResultType.SUCCESS, result: resourceId };
    return Promise.resolve(result);
  }

  /**
   * PreloadShortIds
   * 
   * Given an array of long ids, optimistically load short ids. If there are new ids, they
   * will be created
   * 
   * GGMN doesn't use shortened ids.
   */
  preloadShortIds(ids: string[]): Promise<SomeResult<Array<string>>> {
    return Promise.resolve(makeSuccess([]));
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
   * @param timeseriesName: string -> Name of the timeseries (eg. GWmMSL, not used here)
   * @param timeseriesId: string  -> The id of the timeseries
   * @param range: TimeseriesRange -> the range of the selected query
   * 
   * //TD - update to return a SomeResult
   * 
   * Example url: https://ggmn.lizard.net/api/v3/timeseries/?end=1304208000000&min_points=320&start=1012915200000&uuid=fb82081d-d16a-400e-98da-20f1bf2f5433
   */
  async getReadingsForTimeseries(resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange): Promise<AnyReading[]> {
    const { startDate, endDate } = convertRangeToDates(range)

    const readingUrl = `${this.baseUrl}/api/v3/timeseries/`;
    const url = appendUrlParameters(readingUrl, {
      uuid: timeseriesId,
      start: startDate,
      end: endDate,
      //I don't know why we need this, but it's taken straight from the GGMN site
      min_points: 320
    });


    const authHeadersResult = await this.getOptionalAuthHeaders();
    let authHeaders = {};
    //even if login is bad, load the resources
    if (authHeadersResult.type !== ResultType.ERROR) {
      authHeaders = authHeadersResult.result;
    }
    const options = {
      timeout,
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...authHeaders,
      },
    };

    maybeLog("getReadingsForTimeseries url:", url);

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
            parameter: result.name,
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
      return timeseries.events
      .filter(e => 
        //Filter out the readings hidden in ggmn_ignoreReading
        // moment(e.timestamp).toISOString() !== this.remoteConfig.ggmn_ignoreReading.date &&
        // e.value !== this.remoteConfig.ggmn_ignoreReading.value)
        moment(e.timestamp).toISOString() !== '2017-01-01T01:11:01Z' &&
        e.value !== 0)
      .map((e: OWTimeseriesEvent): GGMNReading => ({
        type: OrgType.GGMN,
        resourceId,
        timeseriesId: timeseries.parameter,
        date: moment(e.timestamp).toISOString(),
        value: e.value,
        //TODO: this will cause bugs
        groundwaterStationId: undefined,
        timeseriesCode: timeseries.id,
      }));
    })
    .catch((err: Error) => {
      //TODO: handle this error?
      maybeLog('getReadingsForTimeseries' + err);
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
  async saveReading(resourceId: string, userId: string, reading: AnyReading | PendingReading): Promise<SomeResult<SaveReadingResult>> {
    reading.type = OrgType.GGMN;
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

  async saveResource(userId: string, resource: AnyResource | PendingResource): Promise<SomeResult<SaveResourceResult>> {
    resource.type = OrgType.GGMN;    
    const saveResult = await FirebaseApi.saveResourceToUser(this.orgId, userId, resource);
    if (saveResult.type === ResultType.ERROR) {
      return {
        type: ResultType.ERROR,
        message: 'Could not save resource',
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

  // private async persistReadingToGGMN(reading: Reading): Promise<any> {
  //   const tsId = '8cd4eec3-1c76-4ebb-84e6-57681f15424f'; //TODO: Just temporary!
  //   // const tsId = reading.timeseriesId;
  //   const url = `${this.baseUrl}/api/v3/timeseries/${tsId}/data/`;
  //   const data = [{
  //     datetime: reading.date, //this must be in UTC, otherwise we get a 500.
  //     value: reading.value,
  //   }];

  //   const authHeadersResult = await this.getOptionalAuthHeaders();
  //   if (authHeadersResult.type === ResultType.ERROR) {
  //     throw new Error("Authorization is required to save readings to GGMN.");
  //   }
  //   const authHeaders = authHeadersResult.result;

  //   const options = {
  //     timeout,
  //     method: 'POST',
  //     headers: {
  //       ...defaultHeaders,
  //       ...authHeaders,
  //     },
  //     body: JSON.stringify(data),
  //   };

  //   maybeLog("persistReadingToGGMN url is", url);

  //   return ftch(url, options)
  //   .then((response: any) => deprecated_naiveParseFetchResponse<GGMNSaveReadingResponse>(response))
  //   .then((response: GGMNSaveReadingResponse) => response)
  //   .then(() => this.removeReadingFromPendingList(reading));

  // }

  //TODO: should we implement some sort of id? It is in a firebase collection after all...
  private removeReadingFromPendingList(reading: Reading): Promise<any> {
    return Promise.resolve(true);
  }

  /**
   * Delete pending resource
   * 
   * Returns immediately
   */
  deletePendingResource(userId: string, pendingResourceId: string): Promise<SomeResult<void>> {
    FirebaseApi.deletePendingResource(this.orgId, userId, pendingResourceId);
    FirebaseApi.deletePendingReadingsForResource(this.orgId, userId, pendingResourceId);

    return Promise.resolve(makeSuccess(undefined));
  }

  /**
   * Delete pending reading.
   * 
   * Returns immediately
   */
  deletePendingReading(userId: string, pendingReadingId: string): Promise<SomeResult<void>> {
    FirebaseApi.deletePendingReading(this.orgId, userId, pendingReadingId);

    return Promise.resolve(makeSuccess(undefined));
  }


  /**
   * A listener function which combines callback events from the FirebaseApi and 
   * GGMN api to inform the PendingChangesBanner of any updates it needs to make
   * 
   * We are using this subscription to also subscribe to pending readings
   * but this is an assumption which holds only for GGMN. We will need to
   * fix this later on.
   */
  subscribeToUser(userId: string, callback: any): () => void {
    return FirebaseApi.listenForUpdatedUser(this.orgId, userId, (sn: Snapshot) => callback(sn));  
  }

  subscribeToPendingReadings(userId: string, callback: (resources: PendingReading[]) => void): void {
    FirebaseApi.listenForPendingReadingsToUser(this.orgId, userId, callback);
  }

  subscribeToPendingResources(userId: string, callback: (resources: PendingResource[]) => void): void {
    FirebaseApi.listenForPendingResourcesToUser(this.orgId, userId, callback);
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

    let keys = [...subscribers.keys()];
    keys.forEach(key => {
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
   * 
   * The Search on the Lizard/GGMN site also uses the mapbox api to load locations, but
   * for now I think searching by just ids is ok.
   * 
   * For example:
   * https://ggmn.lizard.net/api/v3/search/?q=GW03&page_size=25   
   */
  async performSearch(searchQuery: string, page: number): Promise<SomeResult<SearchResult>> {
    const searchUrl = `${this.baseUrl}/api/v3/search/`;
    const url = appendUrlParameters(searchUrl, {
      q: searchQuery,
      page_size: searchPageSize,
      page,
    });

    const authHeadersResult = await this.getOptionalAuthHeaders();
    let authHeaders = {};
    //even if login is bad, load the resources
    if (authHeadersResult.type !== ResultType.ERROR) {
      authHeaders = authHeadersResult.result;
    }

    const options = {
      timeout,
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...authHeaders,
      },
    };

    maybeLog("performSearch url:", url);
    let response: any;
    try {
      response = await ftch(url, options);
    } catch(err) {
      maybeLog("error: " + err);
      return {
        type: ResultType.ERROR,
        message: "Error loading search from GGMN.",
      }
    }

    const searchResponse = await naiveParseFetchResponse<GGMNSearchResponse>(response);
    if (searchResponse.type === ResultType.ERROR) {
      return searchResponse;
    }

    const result: SearchResult = {
      resources: searchResponse.result.results.map(e => GGMNApi.ggmnSearchEntityToResource(e)),
      hasNextPage: searchResponse.result.count > searchPageSize,
    }

    return {
      type: ResultType.SUCCESS,
      result,
    }
  }

  /**
   * deprecated_getResourceFromSearchEntityId
   * 
   * For some reason, the GGMN API returns a 404 for this for some entityIds. 
   */
  async deprecated_getResourceFromSearchEntityId(userId: string, entityId: string): Promise<SomeResult<AnyResource>> {
    const url = `${this.baseUrl}/api/v3/groundwaterstations/${entityId}/`;
    const options = {
      timeout,
      method: 'GET',
      headers: {
        ...defaultHeaders,
      },
    };

    maybeLog("getResourceFromSearchEntityUrl url:", url);

    let response: any;
    try {
      response = await ftch(url, options);
    } catch (err) {
      maybeLog("getResourceFromSearchEntityUrl: " + err);
      return {
        type: ResultType.ERROR,
        message: `Error getting resource from search entity url: ${url}`,
      }
    }

    const groundwaterStationResponse = await naiveParseFetchResponse<GGMNGroundwaterStation>(response);
    if (groundwaterStationResponse.type === ResultType.ERROR) {
      return groundwaterStationResponse;
    }
    const resource = GGMNApi.ggmnStationToResource(groundwaterStationResponse.result);
    return {
      type: ResultType.SUCCESS,
      result: resource
    }
  }


  //
  // ExternalServiceApi
  //------------------------------------------------------------------------

  /**
   * GetEmail
   * 
   * Get user email address from GGMN username
   * 
   * example url: https://ggmn.lizard.net/api/v3/users/?username=lewis_daly
   * 
   * User must be logged in.
   * GGMN only
   */
  async getEmail(username: string): Promise<SomeResult<string>> {
    const usersUrl = `${this.baseUrl}/api/v3/users/`;
    const url = appendUrlParameters(usersUrl, {
      username,
    });

    const authHeadersResult = await this.getOptionalAuthHeaders();
    let authHeaders = {};

    if (authHeadersResult.type === ResultType.ERROR) {
      return makeError('You must log in before sending the email');
    }

    const options = {
      timeout,
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...authHeaders,
      },
    };

    maybeLog("getEmail url:", url);
    let response: any;
    try {
      response = await ftch(url, options);
    } catch (err) {
      maybeLog("error: " + err);
      return {
        type: ResultType.ERROR,
        message: "Error loading search from GGMN.",
      }
    }

    const getUsersResponse = await naiveParseFetchResponse<GGMNUsersResponse>(response);
    if (getUsersResponse.type === ResultType.ERROR) {
      return getUsersResponse;
    }

    if (getUsersResponse.result.results.length === 0) {
      return makeError(`Couldn't find user for username: ${username}`);
    }

    const email = getUsersResponse.result.results[0].email;
    return makeSuccess(email);
  }

  /**
   * Send Resource Email
   */
  sendResourceEmail(token: string, pendingResources: PendingResource[], pendingReadings: PendingReading[], sendOptions: SendResourceEmailOptions): Promise<SomeResult<void>> {
    return FirebaseApi.sendResourceEmail(this.orgId, token, pendingResources, pendingReadings, sendOptions);
  }

  /**
   * getNewResourcesForIds
   * 
   * Given a list of resourceIds, load a list of resources
   */
  async getNewResourcesForIds(ids: string[]): Promise<Array<SomeResult<AnyResource>>> {
    return Promise.all(ids.map(async (id: string) => {
      const resourceResult = await this.getResource(id);
      return resourceResult;
    }))
  }

  /**
   * StartExternalSync
   * 
   * Sync the locally saved resources and readings with the external service
   * User must be logged in
   * 
   * Calls dispatch with an app action when sync is done.
   */
  async runExternalSync(userId: string, pendingResources: PendingResource[], pendingReadings: PendingReading[]): Promise<SomeResult<ExternalSyncStatusComplete>> {
    const savedResourceIds: string[] = [];
    let newResources: AnyResource[] = [];
    
    /* For each resource, see if it has been added to GGMN. If so, we can remove it from the user's pendingResources*/
    const checkResourcesResults: Array<SomeResult<AnyResource>> = await Promise.all(
      pendingResources
      .map(res => this.getResourceFromPendingId(res.id)))
      .then((results: Array<SomeResult<AnyResource>>) => results)
      // .catch(err => {
      //   maybeLog("checkResourcesResults error: " + err);
      //   return makeError<AnyResource>(err.message);
      // });

    maybeLog("Check saved resource results: ", checkResourcesResults);

    checkResourcesResults.forEach(r => {
      if (r.type === ResultType.SUCCESS) {
        newResources.push(r.result);
      }
    });

    const removePendingResults: Array<SomeResult<any>> = await Promise.all(  
      checkResourcesResults.map(async (result, idx) => {
        if (result.type === ResultType.ERROR) {
          return makeError<void>(SyncError.StationNotCreated);
        }

        const id = pendingResources[idx].id;
        try {
          const deleteResult =  await FirebaseApi.deletePendingResourceFromUser(this.orgId, userId, id)
          return deleteResult;
        } catch (err) {
          maybeLog("Error with deletePendingResourceFromUser: " + err);
          return makeError<any>(err.message);
        }
      })
    );
   

    /* 
      For each reading, make sure the resource has been saved first.    
      find the timeseriesId associated with the reading, and save it using the GGMN api.
    */
    const timeseriesIdResults: Array<SomeResult<string>> = await Promise.all(
      pendingReadings.map(p => this.getTimeseriesId(p.resourceId, p.timeseriesId))
    );

    const saveReadingResults: Array<SomeResult<any>> = await Promise.all(
      timeseriesIdResults.map(async (result, idx) => {
        //Skip the failed timeseries
        if (result.type === ResultType.ERROR) {
          return result;
        }

        const pendingReading = pendingReadings[idx];
        return await this.saveReadingToGGMN(pendingReading, result.result);
      })
    );

    maybeLog("SaveReadingResults:", saveReadingResults);

    /* For each successful reading save, remove it from Firebase */
    const removePendingReadingsResults: Array<SomeResult<void>> = await Promise.all(
      saveReadingResults.map(async (result, idx) =>  {
        if (result.type === ResultType.ERROR) {
          return result;
        }
        const reading = pendingReadings[idx];

        return await FirebaseApi.deletePendingReadingFromUser(this.orgId, userId, reading.id);
      })
    );
      
    maybeLog(`RemovePendingReadingsResults: `, removePendingReadingsResults);

    const pendingResourcesResults: CacheType<SomeResult<AnyResource>> = {};
    const pendingReadingsResults: CacheType<SomeResult<any>> = {};
    
    removePendingResults.forEach((result, idx) => {
      const id = pendingResources[idx].id;
      const resourceResult = checkResourcesResults[idx];
      //This is a hack - we ignore the removePendingReadingResults in favour of the actual saved resource
      pendingResourcesResults[id] = resourceResult;
    });

    //TODO: copy for PendingResourcesResults
    saveReadingResults.forEach((result, idx) => {
      const id = pendingReadings[idx].id;
      pendingReadingsResults[id] = result;
    });

    
    //For each reading we made, reload the resource in case we created a new timeseries
    const updatedResourceIds = dedupArray(pendingReadings.map(r => r.groundwaterStationId), (any: string) => any);
    const resources = await this.getNewResourcesForIds(updatedResourceIds);
    resources.forEach(result => {
      if (result.type === ResultType.SUCCESS) {
        newResources.push(result.result);
      }
    });

    newResources = dedupArray(newResources, (r: AnyResource) => r.id);

    return Promise.resolve(makeSuccess<ExternalSyncStatusComplete>({
      pendingResourcesResults,
      pendingReadingsResults,
      status: ExternalSyncStatusType.COMPLETE,
      newResources,
    }));
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

  onAuthStateChanged(listener: (user: RNFirebase.User) => void): () => void {
    return FirebaseApi.onAuthStateChanged(listener);
  }


  //
  // ExtendedResourceApi
  //----------------------------------------------------------------------

  /**
   * checkNewId
   * 
   * Check with the GGMN system that the new Id is valid. Uses a basic search, 
   * as GGMN doesn't provide an easy way for us to check the ids
   * 
   * If someResult.type is error, something went wrong
   * if someResult.result is true, id is valid, otherwise, id is invalid.
   */
  async checkNewId(id: string): Promise<SomeResult<CheckNewIdResult>> {
    /* perform a generic search */
    //https://ggmn.lizard.net/api/v3/search/?q=123&page_size=25

    const searchUrl = `${this.baseUrl}/api/v3/search/`;
    const url = appendUrlParameters(searchUrl, {
      q: id,
      page_size: searchPageSize,
      page: 1,
    });

    const options = {
      timeout,
      method: 'GET',
      headers: {
        ...defaultHeaders,
      },
    };

    maybeLog("checkNewId search url:", url);
    let response: any;
    try {
      response = await ftch(url, options);
    } catch (err) {
      // Return a special status if offline
      if (err.message === 'Network request failed') {
        return makeSuccess<CheckNewIdResult>(CheckNewIdResult.Unknown);
      }

      maybeLog("error: " + err);
      return {
        type: ResultType.ERROR,
        message: "Error loading search from GGMN.",
      }
    }

    const searchResponse = await naiveParseFetchResponse<GGMNSearchResponse>(response);
    if (searchResponse.type === ResultType.ERROR) {
      return searchResponse;
    }

    //if the results count is too high, id isn't specific enough.
    if (searchResponse.result.count >= searchPageSize) {
      return makeSuccess<CheckNewIdResult>(CheckNewIdResult.Unavailable);
    }

    const searchEntities = searchResponse.result.results;
    let exists: CheckNewIdResult = CheckNewIdResult.Available;
    searchEntities.forEach(s => {
      if (s.description === `${id}`) {
        exists = CheckNewIdResult.Unavailable;
      }
    });


    return makeSuccess<CheckNewIdResult>(exists);
  }


  //
  // Private GGMN Calls
  //---------------------------------------------------------------------------------

  /**
   * getTimeseriesId
   * 
   * Gets the Id of the timeseries from the location and and timeseries code.
   * The GGMN api is rather inconsistent, so locationName is most likely the
   * title or description of a groundwater station, and code is `GWmBGS` or `GWmMSL`
   * 
   * example url: `https://ggmn.lizard.net/api/v3/timeseries/?location__name=85570`
   * 
   */
  private async getTimeseriesId(locationName: string, code: string): Promise<SomeResult<string>> {
    const url = appendUrlParameters(`${this.baseUrl}/api/v3/timeseries/`, {
      location__name: locationName,
    });

    const authHeadersResult = await this.getOptionalAuthHeaders();
    let authHeaders = {};
    //We don't really care if the user is logged in, but just in case...
    if (authHeadersResult.type !== ResultType.ERROR) {
      authHeaders = authHeadersResult.result;
    }

    const options = {
      timeout,
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...authHeaders,
      },
    };

    maybeLog("getTimeseriesId url:", url);
    let response: any;
    try {
      response = await ftch(url, options);
    } catch (err) {
      maybeLog("error: " + err);
      return makeError(SyncError.GetTimeseriesIdTransport);
    }

    const searchResponse = await naiveParseFetchResponse<GGMNTimeseriesResponse>(response);
    if (searchResponse.type === ResultType.ERROR) {
      return searchResponse;
    }

    if (searchResponse.result.results.length > 2) {
      maybeLog(`Found too many timeseries for location name: ${locationName}`)
      return makeError(SyncError.GetTimeseriesIdTooMany)
    } 

    if (searchResponse.result.results.length < 1) {
      maybeLog(`Could not find any timeseries for location name: ${locationName}`);
      return makeError(SyncError.GetTimeseriesIdNone);
    }

    let timeseriesId = null;
    searchResponse.result.results.forEach(ts => {
      if (ts.code.toLowerCase() === code.toLowerCase()) {
        timeseriesId = ts.uuid;
      }
    });

    if (!timeseriesId) {
      maybeLog(`Couldn't find timeseries for location name: ${locationName} and code: ${code}`);
      return makeError(SyncError.GetTimeseriesIdNoTimeseries);
    }

    return makeSuccess(timeseriesId);
  }


  /**
   * resourceFromPendingId
   * 
   * Get Resource from pendingId, by performing a search and using the entity_id
   */
  private async getResourceFromPendingId(id: string): Promise<SomeResult<AnyResource>> {
    /* perform a generic search */
    //https://ggmn.lizard.net/api/v3/search/?q=123&page_size=25
    const searchUrl = `${this.baseUrl}/api/v3/search/`;
    const url = appendUrlParameters(searchUrl, {
      q: id,
      page_size: 5,
      page: 1,
    });

    const options = {
      timeout,
      method: 'GET',
      headers: {
        ...defaultHeaders,
      },
    };

    maybeLog("checkNewId search url:", url);
    let response: any;
    try {
      response = await ftch(url, options);
    } catch (err) {
      maybeLog("error: " + err);
      return {
        type: ResultType.ERROR,
        message: "Error loading search from GGMN.",
      }
    }

    const searchResponse = await naiveParseFetchResponse<GGMNSearchResponse>(response);
    if (searchResponse.type === ResultType.ERROR) {
      return searchResponse;
    }

    //if the results count is too high, id isn't specific enough.
    if (searchResponse.result.count > 1) {
      // return makeError<AnyResource>('Found more than 1 resource');
      return makeError<AnyResource>(SyncError.StationNotCreated);
    }

    if (searchResponse.result.count < 1) {
      // return makeError<AnyResource>(`Couldn't find resource for id: ${id}`);
      return makeError<AnyResource>(SyncError.StationNotCreated);
    }

    const searchEntities = searchResponse.result.results;
    const entityId = searchEntities[0].entity_id;
    return this.getResource(entityId);
  }


  /**
   * saveReadingToGGMN
   * 
   * Save the reading to ggmn
   */
  private async saveReadingToGGMN(reading: PendingReading, timeseriesId: string): Promise<SomeResult<void>> {
    const url = appendUrlParameters(`${this.baseUrl}/api/v3/timeseries/${timeseriesId}/data/`, {});
    const data = [{
      datetime: reading.date, //this must be in UTC, otherwise we get a 500.
      value: reading.value,
    }];

    const authHeadersResult = await this.getOptionalAuthHeaders();
    if (authHeadersResult.type === ResultType.ERROR) {
      maybeLog("User must be logged in to saveReadings To GGMN");
      return makeError(SyncError.SaveReadingNotLoggedIn);
    }
    const authHeaders = authHeadersResult.result;

    const options = {
      timeout,
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...authHeaders,
      },
      body: JSON.stringify(data),
    };

    maybeLog("saveReadingToGGMN url is", url);
    maybeLog("saveReadingToGGMN options are", options);

    return ftch(url, options)
    .then((response: any) => {
      return naiveParseFetchResponse<GGMNSaveReadingResponse>(response);
    })
    .then((res: SomeResult<GGMNSaveReadingResponse>) => {
      if (res.type === ResultType.ERROR) {
        return makeError(SyncError.GenericTransport);
      }
      return makeSuccess(undefined);
    })
    .catch((err: Error) => {
      maybeLog('saveReadingToGGMN', err);
      return makeError(SyncError.SaveReadingUnknown);
    });
  }


  //
  // Utils
  //----------------------------------------------------------------------


  static ggmnStationToResource(from: GGMNGroundwaterStation): GGMNResource {
    //Handle mutiple responses from GGMN Stations
    let timeseries: GGMNTimeseries[] = [];
    from.filters[0].timeseries.map(ts => this.ggmnTimeseriesToTimeseries(from.name, ts)).forEach(ts => timeseries.push(ts));
    from.timeseries.map(ts => this.ggmnTimeseriesToTimeseries(from.name, ts)).forEach(ts => timeseries.push(ts));

    const to: GGMNResource = {
      //Code is the code we gave when creating it, Id is some random id.
      id: `${from.code}`, // Not sure if we should use code or name
      name: `${from.name}`,
      //TODO: not sure about this!
      title: `${from.name}`,
      groundwaterStationId: `${from.id}`,
      description: `${from.name}`,
      pending: false,
      type: OrgType.GGMN,
      coords: {
        _latitude: from.geometry.coordinates[1],
        _longitude: from.geometry.coordinates[0],
      },
      timeseries,
    };

    return to;
  }

  //TODO: make a partial resource type that doesn't need all these fake fields
  static ggmnSearchEntityToResource(from: GGMNSearchEntity): GGMNResource {
  
    const to: GGMNResource = {
      type: OrgType.GGMN,
      pending: false,
      id: `${from.description}`, //In a search, description is the same as a groundwater station's code
      title: `${from.title}`,
      name: from.title,
      description: from.description,
      groundwaterStationId: from.entity_id,
      coords: {
        _latitude: 0,
        _longitude: 0
      },
      timeseries: [],
    };

    return to;
  }


  static ggmnTimeseriesToTimeseries(resourceId: string, from: GGMNResponseTimeseries): GGMNTimeseries {
    let readings: GGMNReading[] = [];
    if (from.events && from.events.length > 0) {
      readings = from.events.map(e => this.ggmnEventToReading(resourceId, from.name, from.uuid, e))
    }
    return {
      type: OrgType.GGMN,
      id: from.uuid,
      name: from.name,
      parameter: from.parameter,
      readings,
      firstReadingDateString: isNullOrUndefined(from.start) ? moment(0).toISOString() : moment(from.start).toISOString(),
    };
  }

  static ggmnEventToReading(resourceId: string, timeseriesId: string, timeseriesUuid: string, event: GGMNTimeseriesEvent): GGMNReading {
    return {
      type: OrgType.GGMN,
      resourceId,
      timeseriesUuid,
      timeseriesId,
      date: moment(event.timestamp).toISOString(),
      value: event.value,
      //TD Not sure
      groundwaterStationId: '',
    }
  }
}

export default GGMNApi;