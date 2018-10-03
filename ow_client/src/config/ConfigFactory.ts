import { BaseApiType } from "../enums";
import GGMNApi, { GGMNApiOptions } from '../api/GGMNApi';
import MyWellApi from '../api/MyWellApi';
import NetworkApi from "../api/NetworkApi";
import ExternalServiceApi from "../api/ExternalServiceApi";
import BaseApi from "../api/BaseApi";
import UserApi from "../api/UserApi";
import { TranslationFiles, TranslationEnum, TranslationFile, TranslationOrg } from 'ow_translations/Types';


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
  searchHint: string,

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
  userApi: UserApi; 
  translationFiles: TranslationFiles;

  constructor(remoteConfig: RemoteConfig, envConfig: EnvConfig, networkApi: NetworkApi, translationFiles: TranslationFiles) {
    this.remoteConfig = remoteConfig;
    console.log("envConfig", envConfig);
    this.envConfig = envConfig;
    this.networkApi = networkApi;
    this.translationFiles = translationFiles;

    console.log("init config factory with config", this.remoteConfig);


    //Set up App Api
    if (this.remoteConfig.baseApiType === BaseApiType.GGMNApi) {
      const options: GGMNApiOptions = {
        baseUrl: this.remoteConfig.ggmnBaseUrl,
      }
      const ggmnApi = new GGMNApi(this.networkApi, this.envConfig.orgId, options);
      //@ts-ignore
      this.appApi = ggmnApi
      this.externalServiceApi = ggmnApi;
      this.userApi = ggmnApi;
    } else {
      //Default to MyWellApi
      const mywellApi = new MyWellApi(this.networkApi, this.envConfig.orgId);
      //@ts-ignore
      this.appApi = mywellApi;
      //@ts-ignore
      this.userApi = mywellApi;
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
    //@ts-ignore
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

  /**
   * Get the hint text for the default search page with no recents
   */
  getSearchHint() { 
    return this.remoteConfig.searchHint;
  }


  /**
   * Get the translations for the given user language setting
   * 
   * I'm thinking of a better way to do this with less typing, but at least
   * this method is fully type safe
   */
  getTranslations(translation: TranslationEnum): TranslationFile {
    switch(this.translationFiles.type) {
      case (TranslationOrg.mywell): {
        switch (translation) {
          case 'en_AU': return this.translationFiles.en_AU;
          case 'en_US': return this.translationFiles.en_US;
          case 'guj_IN': return this.translationFiles.guj_IN;
          case 'hi_IN': return this.translationFiles.hi_IN;
          default: {
            throw new Error(`Error with translations. Could not find translation: ${translation} for Org: ${this.translationFiles.type}`);
          }
        }
      }
      case (TranslationOrg.ggmn): {
        switch (translation) {
          case 'en_AU': return this.translationFiles.en_AU;
          case 'nl_NL': return this.translationFiles.nl_NL;
          default: {
            throw new Error(`Error with translations. Could not find translation: ${translation} for Org: ${this.translationFiles.type}`);
          }
        }
      }
    }
  }
}