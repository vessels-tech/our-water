import BaseApi from "./BaseApi";
import NetworkApi from "./NetworkApi";
import { Firebase } from "react-native-firebase";
import FirebaseApi from "./FirebaseApi";
//@ts-ignore
import { default as ftch } from 'react-native-fetch-polyfill';
import { appendUrlParameters, parseFetchResponse } from "../utils";
import { GGMNLocationResponse, GGMNLocation } from "../typings/models/GGMN";
import { isMoment } from "moment";
import { Resource } from "../typings/models/OurWater";
import { ResourceType } from "../enums";

// TODO: make configurable
const timeout = 1000 * 10;

export interface GGMNApiOptions {
  baseUrl: string,
  auth?: any,
}

/**
 * The GGMN Api.
 * 
 * TODO: make an interface, and share components with BaseApi.js
 */
class GGMNApi implements BaseApi {
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
    return FirebaseApi.addRecentResource(this.orgId, resource, userId);
  }

  addFavouriteResource(resource: Resource, userId: string): Promise<any> {
    return FirebaseApi.addFavouriteResource(this.orgId, resource, userId);
  }


  /**
   * GET resources
   * 
   * Gets the resources and recent readings from GGMN api.
   * TODO: figure out pagination and whatnot!
   * Maybe we can sort by updatedAt
   */
  getResources(): Promise<Array<Resource>> {
    const resourceUrl = `${this.baseUrl}/v3/locations/`;
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
    .then((response: any) => parseFetchResponse<GGMNLocationResponse>(response))
    .then((response: GGMNLocationResponse) => {
      console.log("response", response);
      //TODO: finish getting the resources
      return response.results.map(from => GGMNApi.ggmnLocationToResource(from));
    });
  }


  getResourceNearLocation(latitude: number, longitude: number, distance: number): Promise<Array<Resource>> {
    const realDistance = distance * 1000000; //not sure what units distance is in
    const resourceUrl = `${this.baseUrl}/v3/locations/`;
    const url = appendUrlParameters(resourceUrl, {
      dist: realDistance,
      point: `${longitude},${latitude}`
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
      .then((response: any) => parseFetchResponse<GGMNLocationResponse>(response))
      .then((response: GGMNLocationResponse) => {
        console.log("response", response);
        //TODO: finish getting the resources
        return response.results.map(from => GGMNApi.ggmnLocationToResource(from));
      });
  }

  static ggmnLocationToResource(from: GGMNLocation): Resource {
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
        name: from.organisation.name,
      }
    };

    return to;
  }
}

export default GGMNApi;