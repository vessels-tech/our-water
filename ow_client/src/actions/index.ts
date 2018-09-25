import { Resource, Reading } from "../typings/models/OurWater";
import { SomeResult, ResultType } from "../typings/AppProviderTypes";
import BaseApi from "../api/BaseApi";

export enum ActionType {
  SILENT_LOGIN_REQUEST = 'SILENT_LOGIN_REQUEST',
  SILENT_LOGIN_RESPONSE = 'SILENT_LOGIN_RESPONSE',
  ADD_FAVOURITE = 'ADD_FAVOURITE',
  REMOVE_FAVOURITE = 'REMOVE_FAVOURITE',
  TOGGLE_CONNECTION = 'TOGGLE_CONNECTION',
  ADD_RECENT_REQUEST = 'ADD_RECENT_REQUEST',
  ADD_RECENT_RESPONSE = 'ADD_RECENT_RESPONSE',
  SAVE_READING = 'SAVE_READING',
  SAVE_RESOURCE = 'SAVE_RESOURCE',
  CONNECT_TO_EXTERNAL_SERVICE = 'CONNECT_TO_EXTERNAL_SERVICE',
  DISCONNECT_FROM_EXTERNAL_SERVICE = 'DISCONNECT_FROM_EXTERNAL_SERVICE',

  //Get location
  //get resources
  //get resources in location
}

//Add new actions to this type
export type AnyAction = 
  SilentLoginActionRequest |
  SilentLoginActionResponse |
  AddFavouriteAction |
  RemoveFavouriteAction |
  ToggleConnectionAction |
  AddRecentActionRequest |
  AddRecentActionResponse |
  SaveReadingAction |
  SaveResourceAction |
  ConnectToExternalServiceAction |
  DisconnectFromExternalServiceAction
  ;


/**
 * TODO: other actions:
 * GetLocationRequest
 * GetLocationResponse
 * GetResourcesRequest
 * GetResourcesResponse
 */

export type SilentLoginActionRequest = {
  type: ActionType.SILENT_LOGIN_REQUEST
}

export type SilentLoginActionResponse = {
  type: ActionType.SILENT_LOGIN_RESPONSE,
  userIdResult: SomeResult<string>,
}


export type AddFavouriteAction = {
  type: ActionType.ADD_FAVOURITE,
  resource: Resource,
}

export type RemoveFavouriteAction = {
  type: ActionType.REMOVE_FAVOURITE,
  resourceId: string,
}

export type ToggleConnectionAction = {
  type: ActionType.TOGGLE_CONNECTION,
  isConnected: boolean,
}

export type AddRecentActionRequest = {
  type: ActionType.ADD_RECENT_REQUEST,
  resource: Resource,
}

//This gets called when the AddRecentActionRequest finishes
export type AddRecentActionResponse = {
  type: ActionType.ADD_RECENT_RESPONSE,
  result: SomeResult<Resource[]>
}

export type SaveReadingAction = {
  type: ActionType.SAVE_READING,
  reading: Reading,
}

export type SaveResourceAction = {
  type: ActionType.SAVE_RESOURCE ,
  resource: Resource,
}

export type ConnectToExternalServiceAction = {
  type: ActionType.CONNECT_TO_EXTERNAL_SERVICE,
  username: string,
  password: string,
}

export type DisconnectFromExternalServiceAction = {
  type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE,
}

/**
 * Action creators
 * 
 * Utility functions to easily make actions for us
 */
export function addFavourite(resource: Resource): AddFavouriteAction {
  return {
    type: ActionType.ADD_FAVOURITE,
    resource,
  } 
}

export function removeFavourite(resourceId: string): RemoveFavouriteAction {
  return {
    type: ActionType.REMOVE_FAVOURITE,
    resourceId,
  } 
}

export function toggleConnection(isConnected: boolean): ToggleConnectionAction {
  console.log("ToggleConnection creator called");
  return {
    type: ActionType.TOGGLE_CONNECTION,
    isConnected,
  }
}


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
 * Dispatch a AddRecentRequest, do the loading, 
 * then handle the error or response
 * 
 * //TODO: figure out a better way to get the api and userId in here
 */
export function addRecent(api: BaseApi, userId: string, resource: Resource): any {
  return async function(dispatch: any) {
    dispatch(addRecentRequest(resource));

    console.log("adding recent resource 2");

    const result = await api.addRecentResource(resource, userId);
    console.log("adding recent resource 3", result);

    //TODO: where should our error handling logic live?
    dispatch(addRecentResponse(result));
  }
}

export function addRecentRequest(resource: Resource): AddRecentActionRequest {
  return {
    type: ActionType.ADD_RECENT_REQUEST,
    resource,
  }
}

export function addRecentResponse(result: SomeResult<Resource[]>): AddRecentActionResponse {
  return {
    type: ActionType.ADD_RECENT_RESPONSE,
    result
  };
}

export function saveReading(reading: Reading) : SaveReadingAction {
  return {
    type: ActionType.SAVE_READING,
    reading,
  }
}

export function saveResource(resource: Resource) : SaveResourceAction {
  return {
    type: ActionType.SAVE_RESOURCE,
    resource
  }
}

export function connectToExternalService(username: string, password: string) : ConnectToExternalServiceAction {
  return {
    type: ActionType.CONNECT_TO_EXTERNAL_SERVICE,
    username,
    password
  }
}
export function disconnectFromExternalService() : DisconnectFromExternalServiceAction {

  return {
    type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE,
  }
}