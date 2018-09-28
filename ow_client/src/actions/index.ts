import { Resource, Reading, OWUser, SaveReadingResult, SaveResourceResult, TimeseriesRange } from "../typings/models/OurWater";
import { SomeResult, ResultType } from "../typings/AppProviderTypes";
import BaseApi from "../api/BaseApi";
import { AsyncResource } from "async_hooks";
import { SilentLoginActionRequest, SilentLoginActionResponse, GetLocationActionRequest, GetLocationActionResponse, GetResourcesActionRequest, AddFavouriteActionRequest, AddFavouriteActionResponse, AddRecentActionRequest, AddRecentActionResponse, ConnectToExternalServiceActionRequest, ConnectToExternalServiceActionResponse, DisconnectFromExternalServiceActionRequest, DisconnectFromExternalServiceActionResponse, GetExternalLoginDetailsActionResponse, GetExternalLoginDetailsActionRequest, GetReadingsActionRequest, GetReadingsActionResponse, GetResourcesActionResponse, RemoveFavouriteActionRequest, RemoveFavouriteActionResponse, SaveReadingActionRequest, SaveReadingActionResponse, SaveResourceActionResponse, SaveResourceActionRequest, GetUserActionRequest, GetUserActionResponse, GetPendingReadingsResponse, GetPendingResourcesResponse, StartExternalSyncActionRequest, StartExternalSyncActionResponse, PerformSearchActionRequest, PerformSearchActionResponse, DeletePendingReadingRequest, DeletePendingReadingResponse, DeletePendingReadingActionRequest, DeletePendingResourceActionResponse, DeletePendingReadingActionResponse, DeletePendingResourceActionRequest } from "./AnyAction";
import { ActionType } from "./ActionType";
import { LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus, ExternalSyncStatus, ExternalSyncStatusType } from "../typings/api/ExternalServiceApi";
import { Location } from "../typings/Location";
import { getLocation } from "../utils";
import { Firebase } from "react-native-firebase";
import FirebaseApi from "../api/FirebaseApi";
import UserApi from "../api/UserApi";
import ExternalServiceApi from "../api/ExternalServiceApi";
import { ToastAndroid } from "react-native";
import { MapRegion } from "../components/MapSection";
import { Region } from "react-native-maps";
import { GGMNSearchEntity } from "../typings/models/GGMN";


/* Step 4: Add the actions handlers here */

/**
 * Async Add favourite
 */
export function addFavourite(api: BaseApi, userId: string, resource: Resource): any {
  return async (dispatch: any ) => {
    dispatch(addFavouriteRequest(resource));

    const result = await api.addFavouriteResource(resource, userId);

    dispatch(addFavouriteResponse(result));
  }
}

function addFavouriteRequest(resource: Resource): AddFavouriteActionRequest {
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
export function addRecent(api: BaseApi, userId: string, resource: Resource): any {
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

function addRecentRequest(resource: Resource): AddRecentActionRequest {
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

/**
 * Async connect to external service
 */

export function connectToExternalService(api: ExternalServiceApi, username: string, password: string): any {
  return async function (dispatch: any) {
    dispatch(connectToExternalServiceRequest());

    let result: SomeResult < LoginDetails | EmptyLoginDetails>; 
    const details = await api.connectToService(username, password);
    if (details.status === ConnectionStatus.SIGN_IN_ERROR) {
      //TODO: should we really have ui elements here?
      //TODO: get better error messages
      ToastAndroid.show(`Sorry, could not log you in.`, ToastAndroid.SHORT);
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
export function disconnectFromExternalService(api: ExternalServiceApi): any {
  return async function (dispatch: any) {
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
export function deletePendingReading(api: BaseApi, userId: string, pendingReadingId: string): any {
  return async function(dispatch: any) {
    dispatch(deletePendingReadingRequest());
    const result = api.deletePendingReading(userId, pendingReadingId);
    dispatch(deletePendingReadingResponse(result));
  }
}

function deletePendingReadingRequest(): DeletePendingReadingActionRequest {
  return {
    type: ActionType.DELETE_PENDING_READING_REQUEST,
  }
}

function deletePendingReadingResponse(result: SomeResult<void>): DeletePendingReadingActionResponse {
  return {
    type: ActionType.DELETE_PENDING_READING_RESPONSE,
    result,
  }
} 


/**
 * Async delete pending resources
 */
export function deletePendingResource(api: BaseApi, userId: string, pendingResourceId: string): any {
  return async function(dispatch: any) {
    dispatch(deletePendingResourceRequest()); 
    const result = api.deletePendingResource(userId, pendingResourceId);
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
 * Async get external login details
 */
export function getExternalLoginDetails(externalServiceApi: ExternalServiceApi): any {
  return async function (dispatch: any) {
    dispatch(getExternalLoginDetailsRequest());

    const loginDetails = await externalServiceApi.getExternalServiceLoginDetails();

    let result: SomeResult<LoginDetails | EmptyLoginDetails> = {
      type: ResultType.SUCCESS,
      result: loginDetails
    }
    dispatch(getExternalLoginDetailsResponse(result));
  }
}

function getExternalLoginDetailsRequest(): GetExternalLoginDetailsActionRequest {
  return {
    type: ActionType.GET_EXTERNAL_LOGIN_DETAILS_REQUEST
  }
}

function getExternalLoginDetailsResponse(result: SomeResult<LoginDetails | EmptyLoginDetails>): GetExternalLoginDetailsActionResponse {
  return {
    type: ActionType.GET_EXTERNAL_LOGIN_DETAILS_RESPONSE,
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
export function getPendingReadingsResponse(result: SomeResult<Reading[]>): GetPendingReadingsResponse {
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
export function getPendingResourcesResponse(result: SomeResult<Resource[]>): GetPendingResourcesResponse {
  return {
    type: ActionType.GET_PENDING_RESOURCES_RESPONSE,
    result,
  }
}

/**
 * async get the readings for a resource
 */
export function getReadings(api: BaseApi, resourceId: string, timeseriesId: string, range: TimeseriesRange): any {
  return async (dispatch: any) => {
    dispatch(getReadingsRequest(timeseriesId, range));

    let result: SomeResult<Reading[]>;
    try {
      const readings = await api.getReadingsForTimeseries(resourceId, timeseriesId, range);
      result = {
        type: ResultType.SUCCESS,
        result: readings,
      }
    } catch (err) {
      console.log("Error loading readings");
      result = {
        type: ResultType.ERROR,
        message: err.message,
      }
    }

    dispatch(getReadingsResponse(timeseriesId, range, result));
  }
}

export function getReadingsRequest(timeseriesId: string, range: TimeseriesRange): GetReadingsActionRequest {
  return {
    type: ActionType.GET_READINGS_REQUEST,
    timeseriesId,
    range,

  }
}

export function getReadingsResponse(timeseriesId: string, range: TimeseriesRange, result: SomeResult<Reading[]> ): GetReadingsActionResponse {
  return {
    type: ActionType.GET_READINGS_RESPONSE,
    timeseriesId,
    range,
    result,
  }
}

/**
 * Async get resources near user
 */
export function getResources(api: BaseApi, userId: string, region: Region): (dispatch: any) => Promise<SomeResult<Resource[]>> {
  return async (dispatch: any) => {
    dispatch(getResourcesRequest());

    //TODO: merge in with a cache somehow?
    const result = await api.getResourcesWithinRegion(region);
    dispatch(getResourcesResponse(result));

    return result;
  }
}

function getResourcesRequest(): GetResourcesActionRequest {
  return {
    type: ActionType.GET_RESOURCES_REQUEST
  }
}

function getResourcesResponse(result: SomeResult<Resource[]>): GetResourcesActionResponse {
  return {
    type: ActionType.GET_RESOURCES_RESPONSE,
    result,
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


/**
 * Async search for resources
 */
export function performSearch(api: BaseApi, userId: string, searchQuery: string, page: number): any {
  return async (dispatch: any) => {
    dispatch(performSearchRequest(page));

    const searchResult = await api.performSearch(searchQuery, page);

    dispatch(performSearchResponse(searchResult))

    if (searchResult.type !== ResultType.ERROR && searchResult.result.length > 0) {
      //Add successful search to list
      await api.saveRecentSearch(userId, searchQuery);
    }

    console.log("searchResult", searchResult);  

    return searchResult;
  }
}

function performSearchRequest(page: number): PerformSearchActionRequest {
  return {
    type: ActionType.PERFORM_SEARCH_REQUEST,
    page
  }
}

function performSearchResponse(result: SomeResult<GGMNSearchEntity[]>): PerformSearchActionResponse {
  return {
    type: ActionType.PERFORM_SEARCH_RESPONSE,
    result,
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

export function saveReading(api: BaseApi, userId: string, resourceId: string, reading: Reading ): any {
  return async (dispatch: any) => {
    dispatch(saveReadingRequest());

    const result = await api.saveReading(resourceId, userId, reading);

    dispatch(saveReadingResponse(result));
    return result;
  }
}

function saveReadingRequest(): SaveReadingActionRequest {
  return {
    type: ActionType.SAVE_READING_REQUEST,
  }
}

function saveReadingResponse(result: SomeResult<SaveReadingResult>): SaveReadingActionResponse {
  return {
    type: ActionType.SAVE_READING_RESPONSE,
    result
  }
}


/**
 * Async save resource
 */
export function saveResource(api: BaseApi, userId: string, resource: Resource ): 
  (dispatch: any) => Promise<SomeResult<SaveResourceResult>> {
  return async (dispatch: any) => {
    dispatch(saveResourceRequest());

    const result = await api.saveResource(userId, resource);

    dispatch(saveResourceResponse(result));
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

function silentLoginResponse(userIdResult: SomeResult<string>): SilentLoginActionResponse {
  return {
    type: ActionType.SILENT_LOGIN_RESPONSE,
    userIdResult,
  }
}

/**
 * trigger an external sync
 */
export function startExternalSync(api: ExternalServiceApi, userId: string): (dispatch: any) => void {
  return async function(dispatch: any) {
    dispatch(externalSyncRequest());
    //TODO: call the api!
    // api.sync;

    const result: SomeResult<ExternalSyncStatus> = {
      type: ResultType.SUCCESS,
      result: {
        type: ExternalSyncStatusType.NOT_RUNNING,
      }
    }

    dispatch(externalSyncResponse(result));
  }
}

function externalSyncRequest(): StartExternalSyncActionRequest {
  return {
    type: ActionType.START_EXTERNAL_SYNC_REQUEST
  }
}

function externalSyncResponse(result: SomeResult<ExternalSyncStatus>): StartExternalSyncActionResponse {
  return {
    type: ActionType.START_EXTERNAL_SYNC_RESPONSE,
    result,
  }
}