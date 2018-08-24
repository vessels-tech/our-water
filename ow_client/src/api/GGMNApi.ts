import BaseApi from "./BaseApi";
import NetworkApi from "./NetworkApi";
import { Resource } from "../typings/Resource";
import { Firebase } from "react-native-firebase";
import FirebaseApi from "./FirebaseApi";
//@ts-ignore
import { default as ftch } from 'react-native-fetch-polyfill';

// import Config from 'react-native-config';

// const ggmnBaseUrl = Config.GGMN_BASE_URL;
// const timeout = 1000 * 10;

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
    return FirebaseApi.addFavouriteResource(this.orgId, resource, userId);
  }

  /**
   * GET resources
   * 
   * Gets the resources and recent readings from GGMN api
   */
  getResources(): Promise<Array<Resource>> {
    const resourceUrl = `${this.baseUrl}/v3/locations/`;
    // const url = appendUrlParameters(resourceUrl, { latitude, longitude, distance });

    


    //TODO: implement!!!
    return Promise.resolve([]);
  }


  getResourceNearLocation(latitude: number, longitude: number, distance: number): Promise<Array<Resource>> {
    console.log("getResourceNearLocation not available for GGMNApi. Defaulting to getResources()");

    return this.getResources();

  }
}

export default GGMNApi;