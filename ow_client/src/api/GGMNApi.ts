
import Config from 'react-native-config';

const ggmnBaseUrl = Config.GGMN_BASE_URL;
const timeout = 1000 * 10;

/**
 * The GGMN Api.
 * 
 * TODO: make an interface, and share components with BaseApi.js
 */
class GGMNApi {
  auth = {};

  /**
   * initialize with options
   * 
   * If options.auth is present then the user will be considered logged in
   * TODO: how to we pass this in with 
   */
  constructor(options: any) {
    if (options && options.auth) {
      this.auth = options.auth;
    }
  }

  /**
   * GET resources
   * 
   * Gets the resources and recent readings from GGMN api
   */
  getResources() {

  }
}

export default GGMNApi;