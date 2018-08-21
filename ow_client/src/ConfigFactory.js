

/**
 * ConfigFactory gives us the necessary components and env vars
 * based on the config of the application.
 */

export class ConfigFactory {

  constructor(featureDecisions) {

  }

  /**
   * TODO: handle feature flags and translations!
   */
  getApplicationName() {
    return 'MyWell';
  }

  /**
   * Return 
   */
  getBaseApi() {
    //TODO: check which BaseApi to use
  }

}