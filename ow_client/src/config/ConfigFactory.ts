import { BaseApiType } from "../enums";
import GGMNApi, { GGMNApiOptions } from '../api/GGMNApi';
import MyWellApi from '../api/MyWellApi';
import NetworkApi from "../api/NetworkApi";
import ExternalServiceApi from "../api/ExternalServiceApi";


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

  constructor(remoteConfig: RemoteConfig, envConfig: EnvConfig, networkApi: NetworkApi) {
    this.remoteConfig = remoteConfig;
    console.log("envConfig", envConfig);
    this.envConfig = envConfig;
    this.networkApi = networkApi;

    console.log("init config factory with config", this.remoteConfig);
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
  getAppApi(auth?: any) {
    //TODO: should 
    if (this.remoteConfig.baseApiType === BaseApiType.GGMNApi) {
      const options: GGMNApiOptions = {
        baseUrl: this.remoteConfig.ggmnBaseUrl,
      }
      return new GGMNApi(this.networkApi, this.envConfig.orgId, options);
    }

    //Default to MyWellApi
    return new MyWellApi(this.networkApi, this.envConfig.orgId);
  }

  getExternalServiceApi(): ExternalServiceApi {
    if (this.remoteConfig.baseApiType === BaseApiType.GGMNApi) {
      const options: GGMNApiOptions = {
        baseUrl: this.remoteConfig.ggmnBaseUrl,
      }
      return new GGMNApi(this.networkApi, this.envConfig.orgId, options);
    }
    
    throw new Error(`ExternalServiceApi not available for baseApiType: ${this.remoteConfig.baseApiType}`);
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