import { OWUser, SaveReadingResult, SaveResourceResult, TimeseriesRange, SearchResult } from "../typings/models/OurWater";
import { SomeResult, ResultType, makeSuccess, makeError } from "../typings/AppProviderTypes";
import BaseApi from "../api/BaseApi";
import { SilentLoginActionRequest, SilentLoginActionResponse, GetLocationActionRequest, GetLocationActionResponse, GetResourcesActionRequest, AddFavouriteActionRequest, AddFavouriteActionResponse, AddRecentActionRequest, AddRecentActionResponse, ConnectToExternalServiceActionRequest, ConnectToExternalServiceActionResponse, DisconnectFromExternalServiceActionRequest, DisconnectFromExternalServiceActionResponse, GetExternalLoginDetailsActionResponse, GetExternalLoginDetailsActionRequest, GetReadingsActionRequest, GetReadingsActionResponse, GetResourcesActionResponse, RemoveFavouriteActionRequest, RemoveFavouriteActionResponse, SaveReadingActionRequest, SaveReadingActionResponse, SaveResourceActionResponse, SaveResourceActionRequest, GetUserActionRequest, GetUserActionResponse, GetPendingReadingsResponse, GetPendingResourcesResponse, StartExternalSyncActionRequest, StartExternalSyncActionResponse, PerformSearchActionRequest, PerformSearchActionResponse, DeletePendingReadingActionRequest, DeletePendingResourceActionResponse, DeletePendingReadingActionResponse, DeletePendingResourceActionRequest, GetExternalOrgsActionRequest, GetExternalOrgsActionResponse, ChangeTranslationActionRequest, ChangeTranslationActionResponse, GetResourceActionRequest, GetResourceActionResponse, GetShortIdActionRequest, GetShortIdActionResponse, SendResourceEmailActionRequest, SendResourceEmailActionResponse, GotShortIdsAction, SendVerifyCodeActionRequest, SendVerifyCodeActionResponse, VerifyCodeAndLoginActionRequest, VerifyCodeAndLoginActionResponse, LogoutActionRequest, LogoutActionResponse, UpdatedTranslationAction, RefreshReadings } from "./AnyAction";
import { ActionType } from "./ActionType";
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, AnyLoginDetails, ExternalSyncStatusComplete } from "../typings/api/ExternalServiceApi";
import { Location, MaybeLocation } from "../typings/Location";
import { getLocation, maybeLog, dedupArray } from "../utils";
import { RNFirebase } from "react-native-firebase";
import UserApi from "../api/UserApi";
import { MaybeExternalServiceApi, ExternalServiceApiType } from "../api/ExternalServiceApi";
import { ToastAndroid } from "react-native";
import { Region } from "react-native-maps";
import { GGMNOrganisation } from "../typings/models/GGMN";
import { TranslationEnum, TranslationFile, TranslationFiles } from "ow_translations";
import { AnyResource } from "../typings/models/Resource";
import { PendingReading } from "../typings/models/PendingReading";
import { PendingResource } from "../typings/models/PendingResource";
import { AnyReading } from "../typings/models/Reading";
import { AnonymousUser, FullUser } from "../typings/api/FirebaseApi";
import { MaybeUser, UserType, MobileUser } from "../typings/UserTypes";
import { InternalAccountApiType, MaybeInternalAccountApi, SaveUserDetailsType } from "../api/InternalAccountApi";


//Shorthand for messy dispatch response method signatures
type asyncDispatchResult<T> = (dispatch: any) => Promise<SomeResult<T>>


/* Step 4: Add the actions handlers here */

/**
 * Async Add favourite
 */
export function addFavourite(api: BaseApi, userId: string, resource: AnyResource): any {
  return async (dispatch: any ) => {
    dispatch(addFavouriteRequest(resource));
    const result = await api.addFavouriteResource(resource, userId);
    dispatch(addFavouriteResponse(result));
  }
}

function addFavouriteRequest(resource: AnyResource): AddFavouriteActionRequest {
  return {
    type: ActionType.ADD_FAVOURITE_REQUEST,
    resource,
  } 
}

function addFavouriteResponse(result: SomeResult<void>): AddFavouriteActionResponse {
  return {
    type: ActionType.ADD_FAVOURITE_RESPONSE,
    result,
  } 
}


/**
 * Async add recent
 */
export function addRecent(api: BaseApi, userId: string, resource: AnyResource): any {
  return async function (dispatch: any) {
    dispatch(addRecentRequest(resource));
    const result = await api.addRecentResource(resource, userId);

    //TODO: make this result void
    let voidResult: SomeResult<void> = {
      type: ResultType.SUCCESS,
      result: undefined
    }
    dispatch(addRecentResponse(voidResult));
  }
}

function addRecentRequest(resource: AnyResource): AddRecentActionRequest {
  return {
    type: ActionType.ADD_RECENT_REQUEST,
    resource,
  }
}

function addRecentResponse(result: SomeResult<void>): AddRecentActionResponse {
  return {
    type: ActionType.ADD_RECENT_RESPONSE,
    result
  };
}

export function changeTranslation(userApi: UserApi, userId: string, translation: TranslationEnum): asyncDispatchResult<void> {
  return async function(dispatch: any) {
    dispatch(changeTranslationRequest(translation));

    const result = await userApi.changeTranslation(userId, translation);
    dispatch(changeTranslationResponse(result));

    return result;
  }
}

function changeTranslationRequest(language: TranslationEnum): ChangeTranslationActionRequest {
  return {
    type: ActionType.CHANGE_TRANSLATION_REQUEST,
    language,
  }
}

function changeTranslationResponse(result: SomeResult<void>): ChangeTranslationActionResponse {
  return {
    type: ActionType.CHANGE_TRANSLATION_RESPONSE,
    result,
  }
}

/**
 * Async connect to external service
 */

export function connectToExternalService(api: MaybeExternalServiceApi, username: string, password: string, tempErrorMessage: string): any {
  return async function (dispatch: any) {
    dispatch(connectToExternalServiceRequest());

    if (api.externalServiceApiType === ExternalServiceApiType.None) {
      maybeLog("Tried to connect to external service, but no ExternalServiceApi was found");
      return;
    }

    let result: SomeResult < LoginDetails | EmptyLoginDetails>; 
    const details = await api.connectToService(username, password);
    if (details.status === ConnectionStatus.SIGN_IN_ERROR) {
      ToastAndroid.show(tempErrorMessage, ToastAndroid.SHORT);
      result = {
        type: ResultType.ERROR,
        message: 'Login Error',
      }
    } else {
      result = {
        type: ResultType.SUCCESS,
        result: details
      }
    }    
    dispatch(connectToExternalServiceResponse(result));

    //Load the needed organisations
    dispatch(getExternalOrgs(api));
  }
}

function connectToExternalServiceRequest(): ConnectToExternalServiceActionRequest {
  return {
    type: ActionType.CONNECT_TO_EXTERNAL_SERVICE_REQUEST
  }
}

function connectToExternalServiceResponse(result: SomeResult<LoginDetails | EmptyLoginDetails>): ConnectToExternalServiceActionResponse {
  return {
    type: ActionType.CONNECT_TO_EXTERNAL_SERVICE_RESPONSE,
    result: result,
  }
}


/**
 * Async disconnect from external service
 */
export function disconnectFromExternalService(api: MaybeExternalServiceApi): any {
  return async function (dispatch: any) {
    if (api.externalServiceApiType === ExternalServiceApiType.None) {
      maybeLog("Tried to connect to external service, but no ExternalServiceApi was found");
      return;
    }

    dispatch(disconnectFromExternalServiceRequest());
    await api.forgetExternalServiceLoginDetails();

    dispatch(disconnectFromExternalServiceResponse());
  }
}

function disconnectFromExternalServiceRequest(): DisconnectFromExternalServiceActionRequest {
  return {
    type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_REQUEST
  }
}

function disconnectFromExternalServiceResponse(): DisconnectFromExternalServiceActionResponse {
  return {
    type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_RESPONSE,
  }
}


/**
 * Async delete pending readings
 */
export function deletePendingReading(api: BaseApi, userId: string, pendingReadingId: string, resourceId: string): any {
  return async function(dispatch: any) {
    dispatch(deletePendingReadingRequest());
    const result = await api.deletePendingReading(userId, pendingReadingId);
    dispatch(deletePendingReadingResponse(result, resourceId, pendingReadingId));
  }
}

function deletePendingReadingRequest(): DeletePendingReadingActionRequest {
  return {
    type: ActionType.DELETE_PENDING_READING_REQUEST,
  }
}

function deletePendingReadingResponse(result: SomeResult<void>, resourceId: string, pendingReadingId: string): DeletePendingReadingActionResponse {
  return {
    type: ActionType.DELETE_PENDING_READING_RESPONSE,
    result,
    resourceId,
    pendingReadingId,
  }
} 


/**
 * Async delete pending resources. 
 * 
 * If there are pending readings associated with the resource, these will be deleted as well.
 */
export function deletePendingResource(api: BaseApi, userId: string, pendingResourceId: string): any {
  return async function(dispatch: any) {
    dispatch(deletePendingResourceRequest()); 
    const result = await api.deletePendingResource(userId, pendingResourceId);
    dispatch(deletePendingResourceResponse(result));
  }
}

function deletePendingResourceRequest(): DeletePendingResourceActionRequest {
  return {
    type: ActionType.DELETE_PENDING_RESOURCE_REQUEST,
  }
}

function deletePendingResourceResponse(result: SomeResult<void>): DeletePendingResourceActionResponse {
  return {
    type: ActionType.DELETE_PENDING_RESOURCE_RESPONSE,
    result,
  }
}

/**
 * Handle many pending readings in bulk
 */
 export function getBulkPendingReadings(result: SomeResult<Array<PendingReading>>) {
   return async function(dispatch: any) {
    //For each pending reading's resourceId, call update readings  
    dispatch(getPendingReadingsResponse(result));
    if (result.type === ResultType.ERROR) {
      return;
    }

    const resourceIds = dedupArray(result.result.map(r => r.resourceId), (id) => id);
    dispatch(refreshReadings(resourceIds, false));
  }
 }

/**
 * Async get external login details
 */
export function getExternalLoginDetails(externalServiceApi: MaybeExternalServiceApi): any {
  return async function (dispatch: any) {
    if (externalServiceApi.externalServiceApiType === ExternalServiceApiType.None) {
      maybeLog("Tried to connect to external service, but no ExternalServiceApi was found");
      return;
    }

    dispatch(getExternalLoginDetailsRequest());

    const loginDetails = await externalServiceApi.getExternalServiceLoginDetails();

    let result: SomeResult<AnyLoginDetails> = {
      type: ResultType.SUCCESS,
      result: loginDetails
    }
    dispatch(getExternalLoginDetailsResponse(result));
    //Load the needed organisations
    dispatch(getExternalOrgs(externalServiceApi));
  }
}

function getExternalLoginDetailsRequest(): GetExternalLoginDetailsActionRequest {
  return {
    type: ActionType.GET_EXTERNAL_LOGIN_DETAILS_REQUEST
  }
}

function getExternalLoginDetailsResponse(result: SomeResult<AnyLoginDetails>): GetExternalLoginDetailsActionResponse {
  return {
    type: ActionType.GET_EXTERNAL_LOGIN_DETAILS_RESPONSE,
    result,
  }
}

export function getExternalOrgs(externalServiceApi: MaybeExternalServiceApi): any {
  return async function(dispatch: any) {
    if (externalServiceApi.externalServiceApiType === ExternalServiceApiType.None) {
      maybeLog("Tried to connect to external service, but no ExternalServiceApi was found");
      return;
    }

    dispatch(getExternalOrgsRequest());

    const result = await externalServiceApi.getExternalOrganisations();
    dispatch(getExternalOrgsResponse(result));
  }
}

function getExternalOrgsRequest(): GetExternalOrgsActionRequest {
  return {
    type: ActionType.GET_EXTERNAL_ORGS_REQUEST,
  }
}

function getExternalOrgsResponse(result: SomeResult<GGMNOrganisation[]>): GetExternalOrgsActionResponse {
  return {
    type: ActionType.GET_EXTERNAL_ORGS_RESPONSE,
    result,
  }
}


/**
 * Async get user's location
 */
export function getGeolocation(): (dispatch: any) => Promise<SomeResult<Location>> {
  return async (dispatch: any) => {
    dispatch(getGeolocationRequest());

    const result = await getLocation();

    dispatch(getGeoLocationResponse(result));
    return result;
  }
}

function getGeolocationRequest(): GetLocationActionRequest {
  return {
    type: ActionType.GET_LOCATION_REQUEST
  }
}

function getGeoLocationResponse(result: SomeResult<Location>): GetLocationActionResponse   {
  return {
    type: ActionType.GET_LOCATION_RESPONSE,
    result
  }
}

/**
 * Get pending readings callback
 * 
 * triggered by a firebase listener
 */
export function getPendingReadingsResponse(result: SomeResult<PendingReading[]>): GetPendingReadingsResponse {
  return {
    type: ActionType.GET_PENDING_READINGS_RESPONSE,
    result,
  }
}

/**
 * Get pending readings callback
 * 
 * triggered by a firebase listener
 */
export function getPendingResourcesResponse(result: SomeResult<PendingResource[]>): GetPendingResourcesResponse {
  return {
    type: ActionType.GET_PENDING_RESOURCES_RESPONSE,
    result,
  }
}

/**
 * async get the readings for a resource
 * //TD - remove the need for timeseriesId
 */
export function getReadings(api: BaseApi, resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange): asyncDispatchResult<AnyReading[]> {
  return async (dispatch: any) => {
    dispatch(getReadingsRequest(resourceId, timeseriesName, timeseriesId, range));
    let result: SomeResult<AnyReading[]>;
    try {
      const readings = await api.getReadingsForTimeseries(resourceId, timeseriesName, timeseriesId, range);
      if (!readings) {
        throw new Error("No readings found!");
      }
      result = {
        type: ResultType.SUCCESS,
        result: readings,
      }
    } catch (err) {
      result = {
        type: ResultType.ERROR,
        message: err.message,
      }
    }

    dispatch(getReadingsResponse(timeseriesId, resourceId, timeseriesName, range, result));
    return result;
  }
}

export function getReadingsRequest(resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange): GetReadingsActionRequest {
  return {
    type: ActionType.GET_READINGS_REQUEST,
    resourceId,
    timeseriesName,
    timeseriesId,
    range,

  }
}

export function getReadingsResponse(timeseriesId: string, resourceId: string, timeseriesName: string, range: TimeseriesRange, result: SomeResult<AnyReading[]> ): GetReadingsActionResponse {
  return {
    type: ActionType.GET_READINGS_RESPONSE,
    resourceId,
    timeseriesName,
    timeseriesId,
    range,
    result,
  }
}

/**
 * Async get resource given a short Id
 */
export function getResource(api: BaseApi, resourceId: string, userId: string): (dispatch: any) => Promise<SomeResult<AnyResource>> {
  return async (dispatch: any) => {
    dispatch(getResourceRequest(resourceId));

    //TODO: we should only do this if we don't already have the resource...
    const result = await api.getResource(resourceId);
    dispatch(getResourceResponse(resourceId, result));

    //Adds the single resource to the caches
    if (result.type === ResultType.SUCCESS) {
      dispatch(getResourcesResponse(makeSuccess([result.result])))
    }
    return result;
  }
}

function getResourceRequest(resourceId: string): GetResourceActionRequest {
  return {
    type: ActionType.GET_RESOURCE_REQUEST,
    resourceId,
  }
}

function getResourceResponse(resourceId: string, result: SomeResult<AnyResource>): GetResourceActionResponse {
  return {
    type: ActionType.GET_RESOURCE_RESPONSE,
    resourceId,
    result,
  }
}


/**
 * Async get resources near user
 */
export function getResources(api: BaseApi, userId: string, region: Region): (dispatch: any) => Promise<SomeResult<AnyResource[]>> {
  return async (dispatch: any) => {
    dispatch(getResourcesRequest());

    //TODO: merge in with a cache 
    const result = await api.getResourcesWithinRegion(region);
    
    //Load the shortIds for each resource in the response
    //TD - check the cache first
    //TD - if just one of the loads fails, none of the others will end up in the cache
    if (result.type === ResultType.SUCCESS) {
      const ids = result.result.map(r => r.id);
      const shortIdResult = await api.preloadShortIds(ids);
      if (shortIdResult.type === ResultType.ERROR) {
        maybeLog('Error loading many shortIds: ', shortIdResult.message);
      } else {
        dispatch(gotShortIds(shortIdResult.result, ids));
      }
    }

    dispatch(getResourcesResponse(result, region));

    return result;
  }
}

function getResourcesRequest(): GetResourcesActionRequest {
  return {
    type: ActionType.GET_RESOURCES_REQUEST
  }
}

function getResourcesResponse(result: SomeResult<AnyResource[]>, safeArea: Region): GetResourcesActionResponse {
  return {
    type: ActionType.GET_RESOURCES_RESPONSE,
    result,
    safeArea
  }
}


/**
 * Async get short id for a resourceId
 */
export function getShortId(api: BaseApi, resourceId: string): any {
  return async (dispatch: any) => {
    dispatch(getShortIdRequest(resourceId));

    const result = await api.getShortId(resourceId);

    dispatch(getShortIdResponse(resourceId, result));
  }
}

function getShortIdRequest(resourceId: string): GetShortIdActionRequest {
  return {
    type: ActionType.GET_SHORT_ID_REQUEST,
    resourceId,
  }
}

function getShortIdResponse(resourceId: string, result: SomeResult<string>): GetShortIdActionResponse {
  return {
    type: ActionType.GET_SHORT_ID_RESPONSE,
    resourceId,
    result,
  }
}

function gotShortIds(shortIds: string[], longIds: string[]): GotShortIdsAction {
  return {
    type: ActionType.GOT_SHORT_IDS,
    shortIds,
    longIds,
  }
}


/**
 * Async get the user data
 */
export function getUser(userApi: UserApi, userId: string): any {
  return async (dispatch: any) => {
    dispatch(getUserRequest());
    //TODO: call the api
    const result = await userApi.getUser(userId);

    dispatch(getUserResponse(result));
  }
}

function getUserRequest(): GetUserActionRequest {
  return { type: ActionType.GET_USER_REQUEST }
}

/**
 * This is called by the above `getUser` function, and also
 * for the subscribeToUser callback
 */
export function getUserResponse(result: SomeResult<OWUser> ): GetUserActionResponse {
  return {
    type: ActionType.GET_USER_RESPONSE,
    result,
  }
}

export function loginCallback(user: SomeResult<AnonymousUser | MobileUser>): any {
  return function (dispatch: any) {
    dispatch({
      type: ActionType.LOGIN_CALLBACK,
      user,
    });
  }
}

export function logout(api: MaybeInternalAccountApi): asyncDispatchResult<any> {
  return async (dispatch: any) => {
    if (api.internalAccountApiType === InternalAccountApiType.None) {
      maybeLog("Tried to send verify code, but internal account api was none");
      return makeSuccess<void>(undefined);
    }
    dispatch(logoutRequest());
    const result = await api.logout();
    dispatch(logoutResponse());

    return result;
  }
}

function logoutRequest(): LogoutActionRequest {
  return {
    type: ActionType.LOGOUT_REQUEST,
  }
}

function logoutResponse(): LogoutActionResponse {
  return {
    type: ActionType.LOGOUT_RESPONSE,
  }
}


/**
 * Pass on the user subscription function to the reducer
 */
export function passOnUserSubscription(unsubscribe: () => void): any {
  return async function (dispatch: any) {
    dispatch({ type: ActionType.PASS_ON_USER_SUBSCRIPTION, unsubscribe })
  }
}

/**
 * Async search for resources
 */
export function performSearch(api: BaseApi, userId: string, searchQuery: string, page: number): any {
  return async (dispatch: any) => {
    dispatch(performSearchRequest(page, searchQuery));

    const searchResult = await api.performSearch(searchQuery, page);

    dispatch(performSearchResponse(searchResult))

    if (searchResult.type !== ResultType.ERROR) {
        if (searchResult.result.resources.length > 0) {
          await api.saveRecentSearch(userId, searchQuery);
        }
      }
    return searchResult;
  }
}

function performSearchRequest(page: number, searchQuery: string): PerformSearchActionRequest {
  return {
    type: ActionType.PERFORM_SEARCH_REQUEST,
    page,
    searchQuery,
  }
}

function performSearchResponse(result: SomeResult<SearchResult>): PerformSearchActionResponse {
  return {
    type: ActionType.PERFORM_SEARCH_RESPONSE,
    result,
  }
}

/**
 * Tell the reducer to look for the given resourceIds and refresh the readings
 * If forceRefresh is true, it will also search for deleted.
 */
function refreshReadings(resourceIds: string[], forceRefresh: boolean): RefreshReadings {
  return {
    type: ActionType.REFRESH_READINGS,
    resourceIds,
    forceRefresh,
  }
}

/**
 * Async remove the favourite
 */
export function removeFavourite(api: BaseApi, userId: string, resourceId: string): any {
  return async (dispatch: any) => {
    dispatch(removeFavouriteRequest());
    const result = await api.removeFavouriteResource(resourceId, userId);
    dispatch(removeFavouriteResponse(result));
  }
}

function removeFavouriteRequest(): RemoveFavouriteActionRequest {
  return {
    type: ActionType.REMOVE_FAVOURITE_REQUEST,
  } 
}

function removeFavouriteResponse(result: SomeResult<void>): RemoveFavouriteActionResponse {
  return {
    type: ActionType.REMOVE_FAVOURITE_RESPONSE,
    result,
  } 
}

/**
 * Async save reading
 */
export function saveReading(api: BaseApi, externalApi: MaybeExternalServiceApi, userId: string, resourceId: string, reading: PendingReading ): any {
  return async (dispatch: any) => {
    dispatch(saveReadingRequest());

    const result = await api.saveReading(resourceId, userId, reading);

    //TODO: do proper check to see if we are using pendingReadings or not
    dispatch(saveReadingResponse(result, reading));
    //TODO: this is how we tell state to re update the readings. It's a little hacky
    //TD: tidy this up
    // dispatch(getReadingsResponse(reading.timeseriesId, resourceId, '', TimeseriesRange.EXTENT, makeSuccess([])))
    dispatch(refreshReadings([resourceId], false));

    //Attempt to do a sync, just this resource
    //TD: do we want to enable this? For now it's causing confusion for the user.
    // if (externalApi.externalServiceApiType === ExternalServiceApiType.Has) {
    //   dispatch(startExternalSync(api, externalApi, userId, [], [reading]));
    // }

    return result;
  }
}

function saveReadingRequest(): SaveReadingActionRequest {
  return {
    type: ActionType.SAVE_READING_REQUEST,
  }
}

function saveReadingResponse(result: SomeResult<SaveReadingResult>, pendingReading: PendingReading): SaveReadingActionResponse {
  return {
    type: ActionType.SAVE_READING_RESPONSE,
    result,
    pendingReading,
  }
}


/**
 * Async save resource
 */
export function saveResource(api: BaseApi, externalApi: MaybeExternalServiceApi, userId: string, resource: AnyResource | PendingResource ): 
  (dispatch: any) => Promise<SomeResult<SaveResourceResult>> {
  return async (dispatch: any) => {
    dispatch(saveResourceRequest());
    const result = await api.saveResource(userId, resource);

    dispatch(saveResourceResponse(result));    

    //Attempt to do a sync, only this resource
    if (externalApi.externalServiceApiType === ExternalServiceApiType.Has && resource.pending === true){
      dispatch(startExternalSync(api, externalApi, userId, [resource], []));
    }

    return result;
  }
}

function saveResourceRequest(): SaveResourceActionRequest {
  return {
    type: ActionType.SAVE_RESOURCE_REQUEST,
  }
}

function saveResourceResponse(result: SomeResult<SaveResourceResult>): SaveResourceActionResponse {
  return {
    type: ActionType.SAVE_RESOURCE_RESPONSE,
    result
  }
}

export function saveUserDetails(api: MaybeInternalAccountApi, userId: string, userDetails: SaveUserDetailsType): any {
  return async function(dispatch: any) {

    if (api.internalAccountApiType === InternalAccountApiType.None) {
      maybeLog("Tried to connect to InternalAccountApi, but no InternalAccountApi was found");
      return makeSuccess<void>(undefined);
    }

    await api.saveUserDetails(userId, userDetails);

    dispatch({
      type: ActionType.SAVE_USER_DETAILS_REQUEST,
    });
  }
}

export function setExternalOrganisation(api: MaybeExternalServiceApi, organisation: GGMNOrganisation): any {
  return async function(dispatch: any) {
    //TODO: if this fails, state could get out of sync with the saved credentials.
    // Let's worry about it later

    if (api.externalServiceApiType === ExternalServiceApiType.None) {
      maybeLog("Tried to connect to external service, but no ExternalServiceApi was found");
      return;
    }

    await api.selectExternalOrganisation(organisation);
    dispatch({
      type: ActionType.SET_EXTERNAL_ORGANISATION,
      organisation,
    });
    ToastAndroid.show("Selected Organisation", ToastAndroid.SHORT);
  }
}


/**
 * Get the user's email and trigger a resource creation email
 * 
 * //TODO: should we pass in pending resources?
 */
export function sendResourceEmail(api: MaybeExternalServiceApi, user: MaybeUser, username: string, pendingResources: PendingResource[], pendingReadings: PendingReading[], translation: TranslationFile): (dispatch: any) => Promise<SomeResult<void>> {
  return async function(dispatch: any) {
    if (api.externalServiceApiType === ExternalServiceApiType.None) {
      maybeLog("Tried to connect to external service, but no ExternalServiceApi was found");
      return makeSuccess<void>(undefined);
    }

    if (user.type !== UserType.USER) {
      maybeLog("Tried to send resource email, but no user found.");
      return makeError<void>("Couldn't find user. Try logging in again.");
    }

    dispatch(sendResourceEmailRequest());
    const emailResult = await api.getEmail(username);
    if (emailResult.type === ResultType.ERROR) {
      return emailResult;
    }

    const email = emailResult.result;
    const subject = translation.templates.resource_email_subject;
    const message = translation.templates.resource_email_message;
    const sendEmailResult = await api.sendResourceEmail(user.token, pendingResources, pendingReadings, {
      email,
      subject,
      message,
    });

    dispatch(sendResourceEmailResponse(sendEmailResult));

    return sendEmailResult;
  }
}

function sendResourceEmailRequest(): SendResourceEmailActionRequest {
  return {
    type: ActionType.SEND_RESOURCE_EMAIL_REQUEST,
  }
}

function sendResourceEmailResponse(result: SomeResult<void>): SendResourceEmailActionResponse {
  return {
    type: ActionType.SEND_RESOURCE_EMAIL_RESPONSE,
    result,
  }
}


/**
 * Send the verify code to the user
 */
export function sendVerifyCode(api: MaybeInternalAccountApi, mobile: string): (dispatch: any) => Promise<SomeResult<any>> {
  return async function(dispatch: any) {
    if (api.internalAccountApiType === InternalAccountApiType.None) {
      maybeLog("Tried to send verify code, but internal account api was none");
      return makeSuccess<void>(undefined);
    }
    dispatch(sendVerifyCodeRequest());
    const result = await api.sendVerifyCode(mobile);
    dispatch(sendVerifyCodeResponse(result));

    return result;
  }
}

function sendVerifyCodeRequest(): SendVerifyCodeActionRequest {
  return {
    type: ActionType.SEND_VERIFY_CODE_REQUEST,
  }
}

function sendVerifyCodeResponse(result: SomeResult<RNFirebase.ConfirmationResult>): SendVerifyCodeActionResponse {
  return {
    type: ActionType.SEND_VERIFY_CODE_RESPONSE,
    result,
  }
}

/**
 * Async log in silently
 */
export function silentLogin(api: BaseApi): any {
  return async function(dispatch: any) {
    dispatch(silentLoginRequest());
    const userIdResult = await api.silentSignin();
    dispatch(silentLoginResponse(userIdResult));
  }
}

function silentLoginRequest(): SilentLoginActionRequest {
  return {
    type: ActionType.SILENT_LOGIN_REQUEST
  }
}

function silentLoginResponse(userIdResult: SomeResult<AnonymousUser>): SilentLoginActionResponse {
  return {
    type: ActionType.SILENT_LOGIN_RESPONSE,
    userIdResult,
  }
}

/**
 * trigger an external sync
 */
export function startExternalSync(baseApi: BaseApi, api: MaybeExternalServiceApi, userId: string, pendingResources: PendingResource[], pendingReadings: PendingReading[]): (dispatch: any) => void {
  return async function(dispatch: any) {
    if (api.externalServiceApiType === ExternalServiceApiType.None) {
      maybeLog("Tried to connect to external service, but no ExternalServiceApi was found");
      return makeSuccess<void>(undefined);
    }

    dispatch(externalSyncRequest());
    
    let result: SomeResult<ExternalSyncStatusComplete>;
    try {
      result = await api.runExternalSync(userId, pendingResources, pendingReadings)
    } catch (err) {
      maybeLog("Sync error", err);
      result = makeError<ExternalSyncStatusComplete>(err.message);
    }
    // result = makeError<ExternalSyncStatusComplete>("nothing");

    /*
      TODO: 
      - update runExternalSync to return an updated resource after the sync
      - make actions and handlers for an updated resource, which updates the state:
        resources, resourceCache, favouriteResources, recentResources and readings
    */

    //TD: this a little hacky, but we assume that the updated resources are in the user's recents
    if (result.type === ResultType.SUCCESS) {
      result.result.newResources.forEach(r => dispatch(addRecent(baseApi, userId, r)));
      //add the updated resources to the list.
      dispatch(getResourcesResponse(makeSuccess(result.result.newResources)));
    }

    //TODO: update the favourites as well.

    dispatch(externalSyncResponse(result));

  }
}

function externalSyncRequest(): StartExternalSyncActionRequest {
  return {
    type: ActionType.START_EXTERNAL_SYNC_REQUEST
  }
}

function externalSyncResponse(result: SomeResult<ExternalSyncStatusComplete>): StartExternalSyncActionResponse {
  return {
    type: ActionType.START_EXTERNAL_SYNC_RESPONSE,
    result,
  }
}

export function updatedTranslation(translationFiles: TranslationFiles, translationOptions: TranslationEnum[]): UpdatedTranslationAction {
  return {
      type: ActionType.UPDATED_TRANSLATION,
      translationFiles,
      translationOptions,
  };
}

export function verifyCodeAndLogin(api:MaybeInternalAccountApi, userApi: UserApi, confirmResult: RNFirebase.ConfirmationResult, code: string, oldUserId: string): asyncDispatchResult<any> {
  return async function(dispatch: any) {
    dispatch(verifyCodeAndLoginRequest());
    if (api.internalAccountApiType === InternalAccountApiType.None) {
      maybeLog("Tried to send verify code, but internal account api was none");
      return makeSuccess<void>(undefined);
    }

    const result = await api.verifyCodeAndLogin(confirmResult, code, oldUserId);

    //Subscribe to the new user id
    if(result.type === ResultType.SUCCESS) {
      const unsubscribe = userApi.subscribeToUser(result.result.userId, (user) => dispatch(getUserResponse({ type: ResultType.SUCCESS, result: user })))
      dispatch(passOnUserSubscription(unsubscribe));
    }

    dispatch(verifyCodeAndLoginResponse(result));
    return result;
  }
}

function verifyCodeAndLoginRequest(): VerifyCodeAndLoginActionRequest {
  return {
    type: ActionType.VERIFY_CODE_AND_LOGIN_REQUEST
  }
}

function verifyCodeAndLoginResponse(result: SomeResult<FullUser>): VerifyCodeAndLoginActionResponse {
  return {
    type: ActionType.VERIFY_CODE_AND_LOGIN_RESPONSE,
    result,
  }
}