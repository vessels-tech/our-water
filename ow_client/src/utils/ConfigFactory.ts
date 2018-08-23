import { BaseApiType } from "../enums";
import GGMNApi from '../api/GGMNApi';
import MyWellApi from '../api/MyWellApi';


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
}

/**
 * Things that are configurable with env vars
 */
type EnvConfig = {
  // baseApiType: BaseApiType,

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

  constructor(remoteConfig: RemoteConfig, envConfig: EnvConfig) {
    this.remoteConfig = remoteConfig;
    this.envConfig = envConfig;

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
   * Return the base api based on the remoteConfig
   * 
   * 
   */
  getBaseApi(auth: any) {
    //TODO: should 
    if (this.remoteConfig.baseApiType === BaseApiType.GGMNApi) {
      return new GGMNApi({});
    }

    //Default to MyWellApi
    return new MyWellApi();
  }

  getShowConnectToButton() {
    if (this.remoteConfig.showConnectToButton) {
      return true;
    }

    return false;
  }

  getConnectToButtonText() {
    if (!this.remoteConfig.showConnectToButton) {
      console.warn("showConnectToButton is disabled. Text should be null");
      return null;
    }

    return this.remoteConfig.connectToButtonText;
  }

}