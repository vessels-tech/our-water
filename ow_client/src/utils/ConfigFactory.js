/**
 * ConfigFactory gives us the necessary components and env vars
 * based on the config of the application.
 * 
 * Inspired by: https://martinfowler.com/articles/feature-toggles.html
 */
export class ConfigFactory {

  constructor(config) {
    this.config = config;
  }

  /**
   * TODO: handle feature flags and translations!
   */
  getApplicationName() {
    if (this.config.applicationName) {
      return this.config.applicationName;
    }

    //Default
    return 'MyWell';
  }

  /**
   * Return 
   */
  getBaseApi(auth) {
    //TODO: should 
    if (this.config.baseApi === BaseApiType.GGMNApi) {
      return new GGMNApi(auth);
    }

    //Default to MyWellApi
    return new MyWellApi();
  }

}