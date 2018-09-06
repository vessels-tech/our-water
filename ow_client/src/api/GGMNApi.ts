import BaseApi from "./BaseApi";
import NetworkApi from "./NetworkApi";
import { Firebase } from "react-native-firebase";
import FirebaseApi from "./FirebaseApi";
import * as Keychain from 'react-native-keychain';
//@ts-ignore
import { default as ftch } from 'react-native-fetch-polyfill';

import { appendUrlParameters, getDemoResources, rejectRequestWithError, calculateBBox, naiveParseFetchResponse } from "../utils";
import { GGMNLocationResponse, GGMNLocation, GGMNOrganisationResponse, GGMNGroundwaterStationResponse, GGMNGroundwaterStation, GGMNTimeseriesResponse, GGMNTimeseriesEvent, GGMNTimeseries } from "../typings/models/GGMN";
import { Resource, SearchResult, Reading, SaveReadingResult, OWTimeseries, OWTimeseriesResponse, OWTimeseriesEvent } from "../typings/models/OurWater";
import { ResourceType } from "../enums";
import ExternalServiceApi from "./ExternalServiceApi";
import { LoginRequest, ExternalLoginDetails, LoginStatus, OptionalAuthHeaders } from "../typings/api/ExternalServiceApi";
import { Region } from "react-native-maps";
import { isNullOrUndefined } from "util";
import * as moment from 'moment';

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
class GGMNApi implements BaseApi, ExternalServiceApi {
  auth: any = null;
  baseUrl: string;
  networkApi: NetworkApi;
  orgId: string;

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
  silentSignin(): Promise<any> {
    return FirebaseApi.signIn();
  }

  /**
  * Connect to an external service.
  * This is really just a check to see that the login credentials provided work.
  * 
  * Maybe we don't need to save the sessionId. It should be handled
  * automatically by our cookies
  */
  connectToService(username: string, password: string): Promise<any> {
    const url = `${this.baseUrl}/api/v3/organisations/`;
    console.log("url is", url);

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

        return true; //If the request succeeded, then we are logged in.
      });
  }

  /**
   * This is a broken implementation, we will use a different endpoint instead
   */
  private dep_connectToService(username: string, password: string): Promise<any> {
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

  async getExternalServiceLoginDetails(): Promise<ExternalLoginDetails> {
    //Try performing a login first, just in case
    const credentials = await this.getCredentials();
    try {
      await this.connectToService(credentials.username, credentials.password);
      return {
        username: credentials.username,
        status: LoginStatus.Success,
      };
    } catch (err) {
      console.log("error logging in", err);
      return {
        username: credentials.username,
        status: LoginStatus.Error,
      }
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
  addRecentResource(resource: Resource, userId: string): Promise<any> {
    return FirebaseApi.addRecentResource(this.orgId, resource, userId);
  }

  addFavouriteResource(resource: Resource, userId: string): Promise<any> {
    return FirebaseApi.addFavouriteResource(this.orgId, resource, userId);
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
    console.log("UUID:", timeseriesId);
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
          date: moment(e.timestamp),
          value: e.value,
          timeseriesId: timeseries.id,
        };
      });
    });

  }

  /**
   * Save the reading 
   * We do this in 2 parts:
   *  1. First, we save to our user's object in firebase
   *  2. Then we persist the reading actually to GGMN
   * 
   * That way, we can get the benefits of local caching and offline mode, 
   * as well as the actual syncing with GGMN. 
   * 
   * TODO: figure out how to trigger #2, can trigger now, and then if it fails, 
   * put it on a timer/user click banner
   */
  saveReading(resourceId: string, userId: string, reading: Reading): Promise<SaveReadingResult> {

    return FirebaseApi.saveReadingPossiblyOffineToUser(this.orgId, userId, reading)
    .then(async () => {
      console.log("TODO: #2 actually save the reading to GGMN Fool, but don't care about the result");
      try {
        await this.getCredentials()
      } catch (err) {
        //Could not get credentials, or user hasn't logged in
        return {
          requiresLogin: true,
        }
      }

      return {
        requiresLogin: false,
      };
    });
  }


  /**
   * Get the pending readings listener from the firebase api
   */
  listenForPendingReadings(userId: string, callback: any): any {
    return FirebaseApi.listenForPendingReadingsToUser(this.orgId, userId, callback);
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

  performSearch(searchQuery: string): Promise<SearchResult> {
    //TODO: implement search for offline mode
    return Promise.resolve({
      resources: getDemoResources(),
      groups:[],
      users: [],
      offline: false,
    });
  }

  //
  // Utils
  //----------------------------------------------------------------------

  //TODO: this will fall apart, as we need a specific GGMNResource type :(
  //For now, we can make OurWater handle all the fields, and worry about making
  //it flexible later on
  static ggmnStationToResource(from: GGMNGroundwaterStation): Resource {
    const to: Resource = {
      id: `ggmn_${from.id}`,
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