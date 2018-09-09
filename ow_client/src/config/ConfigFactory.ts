import { BaseApiType } from "../enums";
import GGMNApi, { GGMNApiOptions } from '../api/GGMNApi';
import MyWellApi from '../api/MyWellApi';
import NetworkApi from "../api/NetworkApi";
import ExternalServiceApi from "../api/ExternalServiceApi";
import BaseApi from "../api/BaseApi";


/**
 * Things that are configureable remotely
 */
export type RemoteConfig = {
  applicationName: string,
  baseApiType: BaseApiType,
  connectToButtonText: string,
  firebaseBaseUrl: string,
  ggmnBaseUrl: string,
  mywellBaseUrl: string,
  showConnectToButton: boolean,
  connectToDescription: string,
  connectToText: string,
  map_shouldLoadAllResources: boolean,
  settings_registerResourceText: string,
  newReading_enableImageUpload: boolean,

}

/**
 * Things that are configurable with env vars
 */
export type EnvConfig = {
  orgId: string,

}

/**
 * ConfigFactory gives us the necessary components and env vars
 * based on the config of the application.
 * 
 * Inspired by: https://martinfowler.com/articles/feature-toggles.html
 */
export class ConfigFactory {
  remoteConfig: RemoteConfig; //the firebase config object. Configurable remotely
  envConfig: EnvConfig; //The env config object. Configurable only at build time 
  networkApi: NetworkApi;

  appApi: BaseApi; //TODO: change to appApi
  externalServiceApi?: ExternalServiceApi;

  constructor(remoteConfig: RemoteConfig, envConfig: EnvConfig, networkApi: NetworkApi) {
    this.remoteConfig = remoteConfig;
    console.log("envConfig", envConfig);
    this.envConfig = envConfig;
    this.networkApi = networkApi;

    console.log("init config factory with config", this.remoteConfig);


    //Set up App Api
    if (this.remoteConfig.baseApiType === BaseApiType.GGMNApi) {
      const options: GGMNApiOptions = {
        baseUrl: this.remoteConfig.ggmnBaseUrl,
      }
      const ggmnApi = new GGMNApi(this.networkApi, this.envConfig.orgId, options);
      this.appApi = ggmnApi
      this.externalServiceApi = ggmnApi;
    } else {
      //Default to MyWellApi
      this.appApi = new MyWellApi(this.networkApi, this.envConfig.orgId);
      // throw new Error(`ExternalServiceApi not available for baseApiType: ${this.remoteConfig.baseApiType}`);
    }


  }

  /**
   * TODO: handle feature flags and translations!
   */
  getApplicationName() {
    if (this.remoteConfig.applicationName) {
      return this.remoteConfig.applicationName;
    }

    //Default
    return 'MyWell';
  }

  /**
   * Return the AppApi based on the remoteConfig
   * 
   * 
   */
  //TODO: remove the return annotation eventually.
  getAppApi(auth?: any): GGMNApi {
    return this.appApi;
  }

  getExternalServiceApi(): ExternalServiceApi {
    if (!this.externalServiceApi) {
      throw new Error(`ExternalServiceApi not available for baseApiType: ${this.remoteConfig.baseApiType}`);
    }

   return this.externalServiceApi;
  }

  getShowConnectToButton() {
    if (this.remoteConfig.showConnectToButton) {
      return true;
    }

    return false;
  }

  getConnectToButtonText(): string {
    return this.checkConnectToButtonStatus(this.remoteConfig.connectToButtonText);
  }

  getConnectToButtonConnectedText(): string {
    return this.checkConnectToButtonStatus(this.remoteConfig.connectToText);
  }

  getConnectToButtonDescription(): string {
    return this.checkConnectToButtonStatus(this.remoteConfig.connectToDescription);
  }

  getRegisterResourceButtonText(): string {
    return this.remoteConfig.settings_registerResourceText;
  }

  private checkConnectToButtonStatus(success: string) {
    if (!this.remoteConfig.showConnectToButton) {
      console.warn("showConnectToButton is disabled. Text should be empty");
      return '';
    }

    return success;
  }

  getNewReadingShouldShowImageUpload(): boolean {
    return this.remoteConfig.newReading_enableImageUpload;
  }

  /**
   * Should the map load all of the resources? Or just resources closest to the 
   * user? This method will tell you 
   * 
   * It's much less efficent if we load them all at once, but some apis
   * don't support loading just some by location
   */
  getShouldMapLoadAllResources() {
    return this.remoteConfig.map_shouldLoadAllResources;
  }

}