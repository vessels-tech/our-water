import { ActionType } from "./ActionType";
import { SomeResult } from "../typings/AppProviderTypes";
import { Reading, OWUser, SaveReadingResult, SaveResourceResult, TimeseriesRange, SearchResult as SearchResultV1} from "../typings/models/OurWater";
import { AnyLoginDetails, ExternalSyncStatusComplete } from "../typings/api/ExternalServiceApi";
import { Location, MaybeLocation } from "../typings/Location";
import { Region } from "react-native-maps";
import { Action } from "redux";
import { GGMNSearchEntity, GGMNOrganisation } from "../typings/models/GGMN";
import { TranslationEnum, TranslationFiles } from "ow_translations";
import { ShortId } from "../typings/models/ShortId";
import { PendingReading } from "../typings/models/PendingReading";
import { PendingResource } from "../typings/models/PendingResource";
import { AnyResource } from "../typings/models/Resource";
import { AnyReading } from "../typings/models/Reading";
import { AnonymousUser, FullUser } from "../typings/api/FirebaseApi";
import { RNFirebase } from "react-native-firebase";
import { MobileUser } from "../typings/UserTypes";
import { Cursor } from "../screens/HomeMapScreen";
import { SearchResult, PartialResourceResult, PlaceResult } from "ow_common/lib/api/SearchApi";
import { GenericSearchResult } from "../api/BaseApi";

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
  GetResourcesPaginatedActionRequest |
  GetResourcesPaginatedActionResponse |
  GetShortIdActionRequest |
  GetShortIdActionResponse |
  GetUserActionRequest |
  GetUserActionResponse |
  GotShortIdsAction |
  LoginCallbackResponse |
  LogoutActionRequest |
  LogoutActionResponse |
  PassOnUserSubscriptionAction |
  PerformSearchActionRequest |
  PerformSearchActionResponse |
  PerformSearchActionResponseV2 |
  RefreshReadings |
  RemoveFavouriteActionRequest |
  RemoveFavouriteActionResponse |
  SaveReadingActionRequest |
  SaveReadingActionResponse |
  SaveResourceActionRequest |
  SaveResourceActionResponse |
  SaveUserDetailsActionRequest |
  SetExternalOrganisation |
  SendResourceEmailActionRequest |
  SendResourceEmailActionResponse |
  SendVerifyCodeActionRequest |
  SendVerifyCodeActionResponse |
  SilentLoginActionRequest |
  SilentLoginActionResponse |
  StartExternalSyncActionRequest |
  StartExternalSyncActionResponse |
  StartInternalSyncActionRequest |
  StartInternalSyncActionResponse |
  UpdatedTranslationAction |
  VerifyCodeAndLoginActionRequest |
  VerifyCodeAndLoginActionResponse
;


/* Step 2: create a new type for the request and response actions */
export type AddFavouriteActionRequest = { type: ActionType.ADD_FAVOURITE_REQUEST, resource: AnyResource };
export type AddFavouriteActionResponse = { type: ActionType.ADD_FAVOURITE_RESPONSE, result: SomeResult<void> };
export type AddRecentActionRequest = { type: ActionType.ADD_RECENT_REQUEST, resource: AnyResource };
export type AddRecentActionResponse = { type: ActionType.ADD_RECENT_RESPONSE, result: SomeResult<void> };
export type ChangeTranslationActionRequest = { type: ActionType.CHANGE_TRANSLATION_REQUEST, language: TranslationEnum};
export type ChangeTranslationActionResponse = { type: ActionType.CHANGE_TRANSLATION_RESPONSE, result: SomeResult<void>};
export type ConnectToExternalServiceActionRequest = { type: ActionType.CONNECT_TO_EXTERNAL_SERVICE_REQUEST };
export type ConnectToExternalServiceActionResponse = { type: ActionType.CONNECT_TO_EXTERNAL_SERVICE_RESPONSE, result: SomeResult<AnyLoginDetails> };
export type DisconnectFromExternalServiceActionRequest = { type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_REQUEST };
export type DisconnectFromExternalServiceActionResponse = { type: ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_RESPONSE };
export type DeletePendingReadingActionRequest = { type: ActionType.DELETE_PENDING_READING_REQUEST};
export type DeletePendingReadingActionResponse = { type: ActionType.DELETE_PENDING_READING_RESPONSE, result: SomeResult<void>, resourceId: string, pendingReadingId: string};
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
//We only need timeseries id here to lookup in GGMN. Ideally we could use resourceId + timeseriesName instead
export type GetReadingsActionRequest = { type: ActionType.GET_READINGS_REQUEST, resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange };
export type GetReadingsActionResponse = { type: ActionType.GET_READINGS_RESPONSE, result: SomeResult<AnyReading[]>, resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange };
export type GetResourceActionRequest = { type: ActionType.GET_RESOURCE_REQUEST, resourceId: string };
export type GetResourceActionResponse = { type: ActionType.GET_RESOURCE_RESPONSE, resourceId: string, result: SomeResult<AnyResource>}
export type GetResourcesActionRequest = { type: ActionType.GET_RESOURCES_REQUEST };
export type GetResourcesActionResponse = { type: ActionType.GET_RESOURCES_RESPONSE, result: SomeResult<AnyResource[]>, safeArea: Region };
export type GetResourcesPaginatedActionRequest = { type: ActionType.GET_RESOURCES_REQUEST_PAGINATED};
export type GetResourcesPaginatedActionResponse = { type: ActionType.GET_RESOURCES_RESPONSE_PAGINATED, result: SomeResult<[AnyResource[], Cursor]>, safeArea: Region };
export type GetShortIdActionRequest = { type: ActionType.GET_SHORT_ID_REQUEST, resourceId: string};
export type GetShortIdActionResponse = { type: ActionType.GET_SHORT_ID_RESPONSE, resourceId: string, result: SomeResult<string>};
export type GetUserActionRequest = { type: ActionType.GET_USER_REQUEST };
export type GetUserActionResponse = { type: ActionType.GET_USER_RESPONSE, result: SomeResult<OWUser> };
export type GotShortIdsAction = { type: ActionType.GOT_SHORT_IDS , shortIds: string[], longIds: string[]};
export type LoginCallbackResponse = { type: ActionType.LOGIN_CALLBACK, user: SomeResult<AnonymousUser | MobileUser>};
export type LogoutActionRequest = { type: ActionType.LOGOUT_REQUEST };
export type LogoutActionResponse = { type: ActionType.LOGOUT_RESPONSE };
export type PassOnUserSubscriptionAction = { type: ActionType.PASS_ON_USER_SUBSCRIPTION, unsubscribe: () => any};
export type PerformSearchActionRequest = { type: ActionType.PERFORM_SEARCH_REQUEST, page: number, searchQuery: string}; //If page is 1, we should empty the searches
export type PerformSearchActionResponse = { type: ActionType.PERFORM_SEARCH_RESPONSE, result: SomeResult<SearchResultV1>};
export type PerformSearchActionResponseV2 = { type: ActionType.PERFORM_SEARCH_RESPONSE_V2, result: GenericSearchResult};
export type RefreshReadings = { type: ActionType.REFRESH_READINGS, resourceIds: string[], forceRefresh: boolean };
export type RemoveFavouriteActionRequest = { type: ActionType.REMOVE_FAVOURITE_REQUEST};
export type RemoveFavouriteActionResponse = { type: ActionType.REMOVE_FAVOURITE_RESPONSE, result: SomeResult<void> };
export type SaveReadingActionRequest = { type: ActionType.SAVE_READING_REQUEST };
export type SaveReadingActionResponse = { type: ActionType.SAVE_READING_RESPONSE, result: SomeResult<SaveReadingResult>, pendingReading: PendingReading };
export type SaveResourceActionRequest = { type: ActionType.SAVE_RESOURCE_REQUEST };
export type SaveResourceActionResponse = { type: ActionType.SAVE_RESOURCE_RESPONSE, result: SomeResult<SaveResourceResult> };
export type SaveUserDetailsActionRequest = { type: ActionType.SAVE_USER_DETAILS_REQUEST};
export type SilentLoginActionRequest = { type: ActionType.SILENT_LOGIN_REQUEST };
export type SilentLoginActionResponse = { type: ActionType.SILENT_LOGIN_RESPONSE, userIdResult: SomeResult<AnonymousUser> };
export type SetExternalOrganisation = { type: ActionType.SET_EXTERNAL_ORGANISATION, organisation: GGMNOrganisation};
export type SendResourceEmailActionRequest = {type: ActionType.SEND_RESOURCE_EMAIL_REQUEST};
export type SendResourceEmailActionResponse = {type: ActionType.SEND_RESOURCE_EMAIL_RESPONSE, result: SomeResult<void>};
export type SendVerifyCodeActionRequest = {type: ActionType.SEND_VERIFY_CODE_REQUEST};
export type SendVerifyCodeActionResponse = { type: ActionType.SEND_VERIFY_CODE_RESPONSE, result: SomeResult<RNFirebase.ConfirmationResult>};
export type StartExternalSyncActionRequest = { type: ActionType.START_EXTERNAL_SYNC_REQUEST};
export type StartExternalSyncActionResponse = { type: ActionType.START_EXTERNAL_SYNC_RESPONSE, result: SomeResult<ExternalSyncStatusComplete>};

//Internal sync is like external sync, but uses AppApi, and is just moving things from user's pending collections to the public collections
export type StartInternalSyncActionRequest = { type: ActionType.START_INTERNAL_SYNC_REQUEST};
//TD: Change from ExternalSyncStatusComplete
export type StartInternalSyncActionResponse = { type: ActionType.START_INTERNAL_SYNC_RESPONSE, result: SomeResult<ExternalSyncStatusComplete>};

export type UpdatedTranslationAction = { type: ActionType.UPDATED_TRANSLATION, translationFiles: TranslationFiles, translationOptions: TranslationEnum[]};
export type VerifyCodeAndLoginActionRequest = {type: ActionType.VERIFY_CODE_AND_LOGIN_REQUEST }
export type VerifyCodeAndLoginActionResponse = {type: ActionType.VERIFY_CODE_AND_LOGIN_RESPONSE, result: SomeResult<FullUser>};