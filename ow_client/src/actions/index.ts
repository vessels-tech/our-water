import { Resource, Reading, OWUser } from "../typings/models/OurWater";
import { SomeResult, ResultType } from "../typings/AppProviderTypes";
import BaseApi from "../api/BaseApi";
import { AsyncResource } from "async_hooks";
import { SilentLoginActionRequest, SilentLoginActionResponse, GetLocationActionRequest, GetLocationActionResponse, GetResourcesActionRequest, AddFavouriteActionRequest, AddFavouriteActionResponse, AddRecentActionRequest, AddRecentActionResponse, ConnectToExternalServiceActionRequest, ConnectToExternalServiceActionResponse, DisconnectFromExternalServiceActionRequest, DisconnectFromExternalServiceActionResponse, GetExternalLoginDetailsActionResponse, GetExternalLoginDetailsActionRequest, GetReadingsActionRequest, GetReadingsActionResponse, GetResourcesActionResponse, RemoveFavouriteActionRequest, RemoveFavouriteActionResponse, SaveReadingActionRequest, SaveReadingActionResponse, SaveResourceActionResponse, SaveResourceActionRequest, GetUserActionRequest, GetUserActionResponse } from "./AnyAction";
import { ActionType } from "./ActionType";
import { LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus } from "../typings/api/ExternalServiceApi";
import { Location } from "../typings/Location";
import { getLocation } from "../utils";
import { Firebase } from "react-native-firebase";
import FirebaseApi from "../api/FirebaseApi";
import UserApi from "../api/UserApi";
import ExternalServiceApi from "../api/ExternalServiceApi";


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

export function connectToExternalService(username: string, password: string): any {
  return async function (dispatch: any) {
    dispatch(connectToExternalServiceRequest());
    //TODO: call api
    let result: SomeResult<EmptyLoginDetails> = {
      type: ResultType.SUCCESS,
      result: {
        type: LoginDetailsType.EMPTY,
        status: ConnectionStatus.NO_CREDENTIALS,
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
export function disconnectFromExternalService(username: string, password: string): any {
  return async function (dispatch: any) {
    dispatch(disconnectFromExternalServiceRequest());
    //TODO: call api

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
    result: result,
  }
}

/**
 * Async get user's location
 */
export function getGeolocation(): any {
  return async (dispatch: any) => {
    dispatch(getGeolocationRequest());

    const result = await getLocation();

    dispatch(getGeoLocationResponse(result));
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
 * async get the readings for a resource
 */
export function getReadings(resourceId: string, timeseriesId: string, startDate: number, endDate: number): any {
  return async (dispatch: any) => {
    dispatch(getReadingsRequest());

    //TODO: call api
    let result: SomeResult<Reading[]> = {
      type: ResultType.SUCCESS,
      result: []
    }

    dispatch(getReadingsResponse(result));
  }
}

export function getReadingsRequest(): GetReadingsActionRequest {
  return {
    type: ActionType.GET_READINGS_REQUEST
  }
}

export function getReadingsResponse(result: SomeResult<Reading[]> ): GetReadingsActionResponse {
  return {
    type: ActionType.GET_READINGS_RESPONSE,
    result,
  }
}

/**
 * Async get resources near user
 */
export function getResources(): any {
  return async (dispatch: any) => {
    dispatch(getResourcesRequest());
    //TODO: call the api

    let result: SomeResult<Resource[]> = {
      type: ResultType.SUCCESS,
      result: []
    }

    dispatch(getResourcesResponse(result));
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

export function saveReading(resourceId: string, timeseriesId: string, reading: Reading ): any {
  return async (dispatch: any) => {
    dispatch(saveReadingRequest());

    //TODO: call the api
    let voidResult: SomeResult<void> = {
      type: ResultType.SUCCESS,
      result: undefined
    }

    dispatch(saveReadingResponse(voidResult));
  }
}

function saveReadingRequest(): SaveReadingActionRequest {
  return {
    type: ActionType.SAVE_READING_REQUEST,
  }
}

function saveReadingResponse(result: SomeResult<void>): SaveReadingActionResponse {
  return {
    type: ActionType.SAVE_READING_RESPONSE,
    result
  }
}


/**
 * Async save resource
 */
export function saveResource(resource: Resource ): any {
  return async (dispatch: any) => {
    dispatch(saveResourceRequest());

    //TODO: call the api
    let voidResult: SomeResult<void> = {
      type: ResultType.SUCCESS,
      result: undefined
    }

    dispatch(saveResourceResponse(voidResult));
  }
}

function saveResourceRequest(): SaveResourceActionRequest {
  return {
    type: ActionType.SAVE_RESOURCE_REQUEST,
  }
}

function saveResourceResponse(result: SomeResult<void>): SaveResourceActionResponse {
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