import { BaseApiType, HomeScreenType, ResourceType, ScrollDirection } from "../enums";
import GGMNApi, { GGMNApiOptions } from '../api/GGMNApi';
import MyWellApi from '../api/MyWellApi';
import NetworkApi from "../api/NetworkApi";
import ExternalServiceApi, { MaybeExternalServiceApi, ExternalServiceApiType } from "../api/ExternalServiceApi";
import BaseApi from "../api/BaseApi";
import UserApi from "../api/UserApi";
import { TranslationFiles, TranslationEnum, TranslationFile, TranslationOrg } from 'ow_translations/Types'
import { maybeLog } from "../utils";
import { SomeResult, ResultType } from "../typings/AppProviderTypes";
import FavouriteResourceList from "../components/FavouriteResourceList";
import { OrgType } from "../typings/models/OrgType";
import ExtendedResourceApi, { MaybeExtendedResourceApi, ExtendedResourceApiType } from "../api/ExtendedResourceApi";



/**
 * Things that are configureable remotely
 */
export type RemoteConfig = {
  applicationName: string,
  baseApiType: BaseApiType,
  firebaseBaseUrl: string,
  ggmnBaseUrl: string,
  mywellBaseUrl: string,
  showConnectToButton: boolean,
  map_shouldLoadAllResources: boolean,
  newReading_enableImageUpload: boolean,
  homeScreen: HomeScreenType,
  resourceDetail_showSubtitle: boolean,
  favouriteResourceList_showGetStartedButtons: boolean,

  //These should eventually be moved to their own config section where we can dynamically
  //define what resources shold look like
  editResource_showOwerName: boolean,
  editResource_availableTypes: ResourceType[],
  editResource_allowCustomId: boolean,
  favouriteResource_scrollDirection: ScrollDirection,

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
  externalServiceApi: MaybeExternalServiceApi;
  userApi: UserApi; 
  extendedResourceApi: MaybeExtendedResourceApi;
  public orgType: OrgType;

  constructor(remoteConfig: RemoteConfig, envConfig: EnvConfig, networkApi: NetworkApi) {
    this.remoteConfig = remoteConfig;
    maybeLog("envConfig " + envConfig);
    this.envConfig = envConfig;
    this.networkApi = networkApi;

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
      this.extendedResourceApi = ggmnApi;
      this.orgType = OrgType.GGMN

    } else {
      //Default to MyWellApi
      const mywellApi = new MyWellApi(this.networkApi, this.envConfig.orgId);
      //@ts-ignore
      this.appApi = mywellApi;
      //@ts-ignore
      this.userApi = mywellApi;
      this.externalServiceApi = {externalServiceApiType: ExternalServiceApiType.None};
      this.extendedResourceApi = {externalServiceApiType: ExtendedResourceApiType.None};
      this.orgType = OrgType.MYWELL
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
  getAppApi(auth?: any): BaseApi {
    //@ts-ignore
    return this.appApi;
  }

  getExternalServiceApi(): MaybeExternalServiceApi {
   return this.externalServiceApi;
  }

  getExtendedResourceApi(): MaybeExtendedResourceApi {
    return this.extendedResourceApi;
  }

  getShowConnectToButton() {
    if (this.remoteConfig.showConnectToButton) {
      return true;
    }

    return false;
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

  getHomeScreenType(): HomeScreenType {
    return this.remoteConfig.homeScreen;
  }

  getResourceDetailShouldShowSubtitle() {
    return this.remoteConfig.resourceDetail_showSubtitle;
  }

  getFavouriteResourceShouldShowGetStartedButtons() {
    return this.remoteConfig.favouriteResourceList_showGetStartedButtons;
  }

  getEditResourceShouldShowOwnerName() {
    return this.remoteConfig.editResource_showOwerName;
  }

  getAvailableResourceTypes(): ResourceType[]{
    return this.remoteConfig.editResource_availableTypes;
  }

  getEditResourceAllowCustomId(): boolean {
    return this.remoteConfig.editResource_allowCustomId;
  }

  getFavouriteResourceScrollDirection(): ScrollDirection {
    return this.remoteConfig.favouriteResource_scrollDirection;
  }
}