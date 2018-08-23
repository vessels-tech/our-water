import BaseApi from "./BaseApi";
import NetworkApi from "./NetworkApi";
import { Resource } from "../typings/Resource";

// import Config from 'react-native-config';

// const ggmnBaseUrl = Config.GGMN_BASE_URL;
// const timeout = 1000 * 10;

/**
 * The GGMN Api.
 * 
 * TODO: make an interface, and share components with BaseApi.js
 */
class GGMNApi implements BaseApi {
  auth = {};
  networkApi: NetworkApi;
  orgId: string;


  /**
   * initialize with options
   * 
   * If options.auth is present then the user will be considered logged in
   * TODO: how to we pass this in with 
   */
  constructor(networkApi: NetworkApi, orgId: string, options: any = {}) {
    if (options && options.auth) {
      this.auth = options.auth;
    }

    this.networkApi = networkApi;
    this.orgId = orgId;
  }

  /**
   * GET resources
   * 
   * Gets the resources and recent readings from GGMN api
   */
  getResources(): Promise<Array<Resource>> {
    //TODO: implement!!!
    return Promise.resolve([{}]);
  }


  getResourceNearLocation(latitude: number, longitude: number, distance: number): Promise<Array<Resource>> {
    console.log("getResourceNearLocation not available for GGMNApi. Defaulting to getResources()");

    return this.getResources();

  }
}

export default GGMNApi;