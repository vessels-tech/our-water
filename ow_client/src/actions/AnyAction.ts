import { ActionType } from "./ActionType";
import { SomeResult } from "../typings/AppProviderTypes";
import { Resource, Reading, OWUser, SaveReadingResult } from "../typings/models/OurWater";
import { removeFavourite } from ".";
import { EmptyLoginDetails, LoginDetails } from "../typings/api/ExternalServiceApi";
import { Location } from "../typings/Location";
import { Region } from "react-native-maps";

/* Step 3: Add the new action type to the AnyAction Type*/
export type AnyAction =
  AddFavouriteActionRequest |
  AddFavouriteActionResponse |
  AddRecentActionRequest |
  AddRecentActionResponse |
  ConnectToExternalServiceActionRequest |
  ConnectToExternalServiceActionResponse |
  DisconnectFromExternalServiceActionRequest |
  DisconnectFromExternalServiceActionResponse |
  GetExternalLoginDetailsActionRequest |
  GetExternalLoginDetailsActionResponse |
  GetLocationActionRequest |
  GetLocationActionResponse |
  GetReadingsActionRequest |
  GetReadingsActionResponse |
  GetResourcesActionRequest |
  GetResourcesActionResponse |
  GetUserActionRequest |
  GetUserActionResponse |
  RemoveFavouriteActionRequest |
  RemoveFavouriteActionResponse |
  SaveReadingActionRequest |
  SaveReadingActionResponse |
  SaveResourceActionRequest |
  SaveResourceActionResponse |
  SilentLoginActionRequest |
  SilentLoginActionResponse
  ;



/* Step 2: create a new type for the request and response actions */
//TODO: where do we get the orgId and userId from?
export type AddFavouriteActionRequest = { type: ActionType.ADD_FAVOURITE_REQUEST, resource: Resource };
export type AddFavouriteActionResponse = { type: ActionType.ADD_FAVOURITE_RESPONSE, result: SomeResult<void> };
export type AddRecentActionRequest = { type: ActionType.ADD_RECENT_REQUEST, resource: Resource };
export type AddRecentActionResponse = { type: ActionType.ADD_RECENT_RESPONSE, result: SomeResult<void> };
export type ConnectToExternalServiceActionRequest = { type: ActionType.CONNECT_TO_EXTERNAL_SERVICE_REQUEST };
export type ConnectToExternalServiceActionResponse = { type: ActionType.CONNECT_TO_EXTERNAL_SERVICE_RESPONSE, result: SomeResult<LoginDetails | EmptyLoginDetails> };
export type DisconnectFromExternalServiceActionRequest = { type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_REQUEST };
export type DisconnectFromExternalServiceActionResponse = { type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_RESPONSE };
export type GetExternalLoginDetailsActionRequest = { type: ActionType.GET_EXTERNAL_LOGIN_DETAILS_REQUEST };
export type GetExternalLoginDetailsActionResponse = { type: ActionType.GET_EXTERNAL_LOGIN_DETAILS_RESPONSE, result: SomeResult<LoginDetails | EmptyLoginDetails> };
export type GetLocationActionRequest = { type: ActionType.GET_LOCATION_REQUEST };
export type GetLocationActionResponse = { type: ActionType.GET_LOCATION_RESPONSE, result: SomeResult<Location> };
export type GetReadingsActionRequest = { type: ActionType.GET_READINGS_REQUEST };
export type GetReadingsActionResponse = { type: ActionType.GET_READINGS_RESPONSE, result: SomeResult<Reading[]> };
export type GetResourcesActionRequest = { type: ActionType.GET_RESOURCES_REQUEST };
export type GetResourcesActionResponse = { type: ActionType.GET_RESOURCES_RESPONSE, result: SomeResult<Resource[]> };
export type GetUserActionRequest = { type: ActionType.GET_USER_REQUEST };
export type GetUserActionResponse = { type: ActionType.GET_USER_RESPONSE, result: SomeResult<OWUser> };
export type RemoveFavouriteActionRequest = { type: ActionType.REMOVE_FAVOURITE_REQUEST};
export type RemoveFavouriteActionResponse = { type: ActionType.REMOVE_FAVOURITE_RESPONSE, result: SomeResult<void> };
export type SaveReadingActionRequest = { type: ActionType.SAVE_READING_REQUEST };
export type SaveReadingActionResponse = { type: ActionType.SAVE_READING_RESPONSE, result: SomeResult<SaveReadingResult> };
export type SaveResourceActionRequest = { type: ActionType.SAVE_RESOURCE_REQUEST };
export type SaveResourceActionResponse = { type: ActionType.SAVE_RESOURCE_RESPONSE, result: SomeResult<void> };
export type SilentLoginActionRequest = { type: ActionType.SILENT_LOGIN_REQUEST };
export type SilentLoginActionResponse = { type: ActionType.SILENT_LOGIN_RESPONSE, userIdResult: SomeResult<string> };