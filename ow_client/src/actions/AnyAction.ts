import { ActionType } from "./ActionType";
import { SomeResult } from "../typings/AppProviderTypes";
import { Resource, Reading, OWUser, SaveReadingResult, SaveResourceResult, TimeseriesRange, PendingReading, PendingResource } from "../typings/models/OurWater";
import { removeFavourite } from ".";
import { EmptyLoginDetails, LoginDetails, ExternalSyncStatus, AnyLoginDetails } from "../typings/api/ExternalServiceApi";
import { Location } from "../typings/Location";
import { Region } from "react-native-maps";
import { Action } from "redux";
import { GGMNSearchEntity, GGMNOrganisation } from "../typings/models/GGMN";
import { TranslationEnum } from "ow_translations/Types";

/* Step 3: Add the new action type to the AnyAction Type*/
export type AnyAction =
  AddFavouriteActionRequest |
  AddFavouriteActionResponse |
  AddRecentActionRequest |
  AddRecentActionResponse |
  ChangeTranslationActionRequest |
  ChangeTranslationActionResponse |
  ConnectToExternalServiceActionRequest |
  ConnectToExternalServiceActionResponse |
  DisconnectFromExternalServiceActionRequest |
  DisconnectFromExternalServiceActionResponse |
  DeletePendingReadingActionRequest |
  DeletePendingReadingActionResponse |
  DeletePendingResourceActionRequest |
  DeletePendingResourceActionResponse |
  GetExternalLoginDetailsActionRequest |
  GetExternalLoginDetailsActionResponse |
  GetExternalOrgsActionRequest |
  GetExternalOrgsActionResponse |
  GetLocationActionRequest |
  GetLocationActionResponse | 
  GetPendingReadingsRequest |
  GetPendingReadingsResponse |
  GetPendingResourcesRequest |
  GetPendingResourcesResponse |
  GetResourceActionRequest |
  GetResourceActionResponse |
  GetReadingsActionRequest |
  GetReadingsActionResponse |
  GetResourcesActionRequest |
  GetResourcesActionResponse |
  GetUserActionRequest |
  GetUserActionResponse |
  PerformSearchActionRequest |
  PerformSearchActionResponse |
  RemoveFavouriteActionRequest |
  RemoveFavouriteActionResponse |
  SaveReadingActionRequest |
  SaveReadingActionResponse |
  SaveResourceActionRequest |
  SaveResourceActionResponse |
  SetExternalOrganisation |
  SilentLoginActionRequest |
  SilentLoginActionResponse |
  StartExternalSyncActionRequest |
  StartExternalSyncActionResponse 
;


/* Step 2: create a new type for the request and response actions */
export type AddFavouriteActionRequest = { type: ActionType.ADD_FAVOURITE_REQUEST, resource: Resource };
export type AddFavouriteActionResponse = { type: ActionType.ADD_FAVOURITE_RESPONSE, result: SomeResult<void> };
export type AddRecentActionRequest = { type: ActionType.ADD_RECENT_REQUEST, resource: Resource };
export type AddRecentActionResponse = { type: ActionType.ADD_RECENT_RESPONSE, result: SomeResult<void> };
export type ChangeTranslationActionRequest = { type: ActionType.CHANGE_TRANSLATION_REQUEST, language: TranslationEnum};
export type ChangeTranslationActionResponse = { type: ActionType.CHANGE_TRANSLATION_RESPONSE, result: SomeResult<void>};
export type ConnectToExternalServiceActionRequest = { type: ActionType.CONNECT_TO_EXTERNAL_SERVICE_REQUEST };
export type ConnectToExternalServiceActionResponse = { type: ActionType.CONNECT_TO_EXTERNAL_SERVICE_RESPONSE, result: SomeResult<AnyLoginDetails> };
export type DisconnectFromExternalServiceActionRequest = { type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_REQUEST };
export type DisconnectFromExternalServiceActionResponse = { type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_RESPONSE };
export type DeletePendingReadingActionRequest = { type: ActionType.DELETE_PENDING_READING_REQUEST};
export type DeletePendingReadingActionResponse = { type: ActionType.DELETE_PENDING_READING_RESPONSE, result: SomeResult<void>};
export type DeletePendingResourceActionRequest = { type: ActionType.DELETE_PENDING_RESOURCE_REQUEST};
export type DeletePendingResourceActionResponse = { type: ActionType.DELETE_PENDING_RESOURCE_RESPONSE, result: SomeResult<void>};
export type GetExternalLoginDetailsActionRequest = { type: ActionType.GET_EXTERNAL_LOGIN_DETAILS_REQUEST };
export type GetExternalLoginDetailsActionResponse = { type: ActionType.GET_EXTERNAL_LOGIN_DETAILS_RESPONSE, result: SomeResult<AnyLoginDetails> };
export type GetExternalOrgsActionRequest = { type: ActionType.GET_EXTERNAL_ORGS_REQUEST}
export type GetExternalOrgsActionResponse = { type: ActionType.GET_EXTERNAL_ORGS_RESPONSE, result: SomeResult<GGMNOrganisation[]>}
export type GetLocationActionRequest = { type: ActionType.GET_LOCATION_REQUEST };
export type GetLocationActionResponse = { type: ActionType.GET_LOCATION_RESPONSE, result: SomeResult<Location> };
export type GetPendingReadingsRequest = { type: ActionType.GET_PENDING_READINGS_REQUEST};
export type GetPendingReadingsResponse = { type: ActionType.GET_PENDING_READINGS_RESPONSE, result: SomeResult<PendingReading[]>};
export type GetPendingResourcesRequest = { type: ActionType.GET_PENDING_RESOURCES_REQUEST};
export type GetPendingResourcesResponse = { type: ActionType.GET_PENDING_RESOURCES_RESPONSE, result: SomeResult<PendingResource[]>};
export type GetReadingsActionRequest = { type: ActionType.GET_READINGS_REQUEST, timeseriesId: string, range: TimeseriesRange };
export type GetReadingsActionResponse = { type: ActionType.GET_READINGS_RESPONSE, result: SomeResult<Reading[]>, timeseriesId: string, range: TimeseriesRange };
export type GetResourceActionRequest = { type: ActionType.GET_RESOURCE_REQUEST, resourceId: string };
export type GetResourceActionResponse = { type: ActionType.GET_RESOURCE_RESPONSE, resourceId: string, result: SomeResult<Resource>}
export type GetResourcesActionRequest = { type: ActionType.GET_RESOURCES_REQUEST };
export type GetResourcesActionResponse = { type: ActionType.GET_RESOURCES_RESPONSE, result: SomeResult<Resource[]> };
export type GetUserActionRequest = { type: ActionType.GET_USER_REQUEST };
export type GetUserActionResponse = { type: ActionType.GET_USER_RESPONSE, result: SomeResult<OWUser> };
export type PerformSearchActionRequest = { type: ActionType.PERFORM_SEARCH_REQUEST, page: number}; //If page is 1, we should empty the searches
export type PerformSearchActionResponse = { type: ActionType.PERFORM_SEARCH_RESPONSE, result: SomeResult<GGMNSearchEntity[]>}
export type RemoveFavouriteActionRequest = { type: ActionType.REMOVE_FAVOURITE_REQUEST};
export type RemoveFavouriteActionResponse = { type: ActionType.REMOVE_FAVOURITE_RESPONSE, result: SomeResult<void> };
export type SaveReadingActionRequest = { type: ActionType.SAVE_READING_REQUEST };
export type SaveReadingActionResponse = { type: ActionType.SAVE_READING_RESPONSE, result: SomeResult<SaveReadingResult> };
export type SaveResourceActionRequest = { type: ActionType.SAVE_RESOURCE_REQUEST };
export type SaveResourceActionResponse = { type: ActionType.SAVE_RESOURCE_RESPONSE, result: SomeResult<SaveResourceResult> };
export type SilentLoginActionRequest = { type: ActionType.SILENT_LOGIN_REQUEST };
export type SilentLoginActionResponse = { type: ActionType.SILENT_LOGIN_RESPONSE, userIdResult: SomeResult<string> };
export type SetExternalOrganisation = { type: ActionType.SET_EXTERNAL_ORGANISATION, organisation: GGMNOrganisation};
export type StartExternalSyncActionRequest = { type: ActionType.START_EXTERNAL_SYNC_REQUEST}
export type StartExternalSyncActionResponse = { type: ActionType.START_EXTERNAL_SYNC_RESPONSE, result: SomeResult<ExternalSyncStatus>}