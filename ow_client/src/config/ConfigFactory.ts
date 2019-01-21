import { BaseApiType, HomeScreenType, ResourceType, ScrollDirection } from "../enums";
import GGMNApi, { GGMNApiOptions } from '../api/GGMNApi';
import MyWellApi from '../api/MyWellApi';
import NetworkApi from "../api/NetworkApi";
import ExternalServiceApi, { MaybeExternalServiceApi, ExternalServiceApiType } from "../api/ExternalServiceApi";
import BaseApi from "../api/BaseApi";
import UserApi from "../api/UserApi";
import { TranslationFiles, TranslationEnum, TranslationFile, TranslationOrg } from 'ow_translations'
import { maybeLog } from "../utils";
import { SomeResult, ResultType } from "../typings/AppProviderTypes";
import FavouriteResourceList from "../components/FavouriteResourceList";
import { OrgType } from "../typings/models/OrgType";
import ExtendedResourceApi, { MaybeExtendedResourceApi, ExtendedResourceApiType } from "../api/ExtendedResourceApi";
import InternalAccountApi, { MaybeInternalAccountApi, InternalAccountApiType } from "../api/InternalAccountApi";
import { ConfigTimeseries } from "../typings/models/ConfigTimeseries";
import { Moment } from "moment";
import moment = require("moment");


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
  showSyncButton: boolean,
  showPendingButton: boolean,
  map_shouldLoadAllResources: boolean,
  newReading_enableImageUpload: boolean,
  homeScreen: HomeScreenType,
  resourceDetail_showSubtitle: boolean,
  resourceDetail_allowEditing: boolean,
  resourceDetail_allowDelete: boolean,
  resourceDetail_editReadings: boolean,
  favouriteResourceList_showGetStartedButtons: boolean,

  //These should eventually be moved to their own config section where we can dynamically
  //define what resources shold look like
  editResource_hasResourceName: boolean,
  editResource_showOwerName: boolean,
  editResource_availableTypes: string, //ResourceType[],
  editResource_defaultTypes: string, 
  editResource_allowCustomId: boolean,
  editResource_hasWaterColumnHeight: boolean,
  favouriteResource_scrollDirection: ScrollDirection,
  usesShortId: boolean,

  allowsUserRegistration: boolean,
  translations: TranslationFiles,
  translationOptions: TranslationEnum[],
  ggmn_ignoreReading: {date: string, value: number},
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
  externalServiceApi: MaybeExternalServiceApi; //Api for connecting to external services
  internalAccountApi: MaybeInternalAccountApi; //Api for using extended user features with normal backend
  userApi: UserApi; 
  extendedResourceApi: MaybeExtendedResourceApi;
  public orgType: OrgType;

  constructor(remoteConfig: RemoteConfig, envConfig: EnvConfig, networkApi: NetworkApi) {
    this.remoteConfig = remoteConfig;
    maybeLog("envConfig " + JSON.stringify(envConfig, null, 2));
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
      this.internalAccountApi = { internalAccountApiType: InternalAccountApiType.None};

      this.orgType = OrgType.GGMN

    } else {
      //Default to MyWellApi
      const mywellApi = new MyWellApi(this.networkApi, this.envConfig.orgId);
      //@ts-ignore
      this.appApi = mywellApi;
      //@ts-ignore
      this.userApi = mywellApi;
      this.externalServiceApi = {externalServiceApiType: ExternalServiceApiType.None};
      this.extendedResourceApi = {extendedResourceApiType: ExtendedResourceApiType.None};
      this.internalAccountApi = mywellApi;
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

  getInternalAccountApi(): MaybeInternalAccountApi {
    return this.internalAccountApi;
  }

  getShowConnectToButton(): boolean {
    return this.remoteConfig.showConnectToButton;
  }

  getShowSyncButton(): boolean { 
    return this.remoteConfig.showSyncButton;
  }

  getShowPendingButton(): boolean {
    return this.remoteConfig.showPendingButton;
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

  getResourceDetailAllowEditing(): boolean {
    return this.remoteConfig.resourceDetail_allowEditing;
  }

  getResourceDetailAllowDelete(): boolean {
    return this.remoteConfig.resourceDetail_allowDelete;
  }

  getResourceDetailEditReadings(): boolean {
    return this.remoteConfig.resourceDetail_editReadings;
  }

  getFavouriteResourceShouldShowGetStartedButtons() {
    return this.remoteConfig.favouriteResourceList_showGetStartedButtons;
  }

  getEditResourceHasResourceName() {
    return this.remoteConfig.editResource_hasResourceName;
  }

  getEditResourceShouldShowOwnerName() {
    return this.remoteConfig.editResource_showOwerName;
  }

  getAvailableResourceTypes(): ResourceType[]{
    return JSON.parse(this.remoteConfig.editResource_availableTypes);
  }

  getEditResourceAllowCustomId(): boolean {
    return this.remoteConfig.editResource_allowCustomId;
  }

  getEditResourceHasWaterColumnHeight(): boolean {
    return this.remoteConfig.editResource_hasWaterColumnHeight;
  }

  getFavouriteResourceScrollDirection(): ScrollDirection {
    return this.remoteConfig.favouriteResource_scrollDirection;
  }

  /**
   * getDefaultTimeseries
   * 
   * This determines the default timeseries for the environment
   */
  getDefaultTimeseries(resourceTypeString: string): ConfigTimeseries[] {
    const defaultTypes = JSON.parse(this.remoteConfig.editResource_defaultTypes);
    return defaultTypes[resourceTypeString];
  }


  getUsesShortId() {
    return this.remoteConfig.usesShortId;
  }

  /**
   * allowsUserRegistration
   * 
   * This determines whether or not OW points to an external user account provider (set to false), 
   * or registers users using the internal system.
   */
  allowsUserRegistration() {
    return this.remoteConfig.allowsUserRegistration;
  }


  getTranslationFiles(): TranslationFiles {
    return this.remoteConfig.translations;
  }

  getTranslationOptions(): TranslationEnum[] {
    return this.remoteConfig.translationOptions;
  }

  getGGMNIgnoreReadingDate(): Moment {
    if (this.remoteConfig.ggmn_ignoreReading && this.remoteConfig.ggmn_ignoreReading.date) {
      return moment(this.remoteConfig.ggmn_ignoreReading.date);
    }

    return moment("2017-01-01");
  }

  getGGMNIgnoreReadingValue(): number {
    if (this.remoteConfig.ggmn_ignoreReading && this.remoteConfig.ggmn_ignoreReading.value) {
      return this.remoteConfig.ggmn_ignoreReading.value;
    }

    return 0;
  }
}