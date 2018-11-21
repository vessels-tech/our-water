
import {  TimeseriesReadings, TimeSeriesReading, SearchResult } from "../typings/models/OurWater";
import { SyncStatus } from "../typings/enums";
import { LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus, ExternalSyncStatusType, AnyLoginDetails, AnyExternalSyncStatus, ExternalSyncStatusRunning, ExternalSyncStatusComplete } from "../typings/api/ExternalServiceApi";
import { ResultType, SomeResult } from "../typings/AppProviderTypes";
import { MaybeUser, UserType } from "../typings/UserTypes";
import { ActionType } from "../actions/ActionType";
import { AnyAction } from "../actions/AnyAction";
import { Location, NoLocation, LocationType } from "../typings/Location";
import { getTimeseriesReadingKey } from "../utils";
import { ActionMeta, SyncMeta, SearchResultsMeta } from "../typings/Reducer";
import { GGMNSearchEntity, GGMNOrganisation } from "../typings/models/GGMN";
import { TranslationEnum, TranslationFile } from "ow_translations";
import { translationsForTranslationOrg, getTranslationForLanguage } from 'ow_translations';
import * as EnvConfig from '../utils/EnvConfig';
import { AnyResource } from "../typings/models/Resource";
import { PendingReading } from "../typings/models/PendingReading";
import { PendingResource } from "../typings/models/PendingResource";

const orgId = EnvConfig.OrgId;

const RESOURCE_CACHE_MAX_SIZE = 500;

const defaultLanguage = TranslationEnum.en_AU;
const translations = translationsForTranslationOrg(orgId);
const defaultTranslation = getTranslationForLanguage(translations, defaultLanguage);

export type AppState = {
  //Session based
  isConnected: boolean,
  
  //Local
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  location: Location | NoLocation,
  locationMeta: SyncMeta,
  //TODO: cache this locally as well as on firebase
  language: TranslationEnum,
  translation: TranslationFile,

  //Api
  resources: AnyResource[],
  myResources: AnyResource[],
  resourcesMeta: ActionMeta,
  resourceMeta: Map<string, ActionMeta>, //resourceId => ActionMeta, for loading individual resources on request
  resourcesCache: Map<string, AnyResource>, //A super simple cache implementation
  externalSyncStatus: AnyExternalSyncStatus,
  externalOrgs: GGMNOrganisation[], //A list of external org ids the user can select from
  externalOrgsMeta: ActionMeta,
  tsReadings: TimeseriesReadings, //simple map: key: `resourceId+timeseriesName+range` => TimeseriesReading
  shortIdMeta: Map<string, ActionMeta>, //resourceId => ActionMeta, for loading individual shortIds on request
  shortIdCache: Map<string, string>, //resourceId => shortId
  
  //Firebase
  favouriteResources: AnyResource[],
  favouriteResourcesMeta: ActionMeta,
  pendingSavedReadings: PendingReading[],
  pendingSavedReadingsMeta: SyncMeta,
  pendingSavedResources: PendingResource[],
  pendingSavedResourcesMeta: SyncMeta, 
  recentResources: AnyResource[],
  recentResourcesMeta: ActionMeta,
  recentSearches: string[],
  syncStatus: SyncStatus,
  searchResults: SearchResult,
  searchResultsMeta: SearchResultsMeta,
  user: MaybeUser,
  userIdMeta: ActionMeta,
}

const initialState: AppState = {
  //Session
  isConnected: true,
  
  //Local
  externalLoginDetails: {
    type: LoginDetailsType.EMPTY,
    status: ConnectionStatus.NO_CREDENTIALS,
  },
  externalLoginDetailsMeta: { loading: false },
  location: { type: LocationType.NO_LOCATION},
  locationMeta: { loading: false },
  language: defaultLanguage, //default to australian english, we should probably change this.
  translation: defaultTranslation,

  //Api
  resources: [],
  myResources: [],
  resourcesMeta: { loading: false, error: false, errorMessage: '' },
  resourceMeta: new Map<string, ActionMeta>(),
  resourcesCache: new Map<string, AnyResource>(), 
  externalSyncStatus: { 
    status: ExternalSyncStatusType.COMPLETE,
    pendingResourcesResults: new Map<string, SomeResult<any>>(),
    pendingReadingsResults: new Map<string, SomeResult<any>>(),
  },
  externalOrgs: [],
  externalOrgsMeta: { loading: false, error: false, errorMessage: '' },
  tsReadings: {},
  shortIdMeta: new Map<string, ActionMeta>(),
  shortIdCache: new Map<string, string>(),

  //Firebase
  user: {type: UserType.NO_USER}, 
  userIdMeta: { loading: false, error: false, errorMessage: '' },
  syncStatus: SyncStatus.none,
  favouriteResources: [],
  favouriteResourcesMeta: { loading: false, error: false, errorMessage: '' },
  recentResources: [],
  recentResourcesMeta: { loading: false, error: false, errorMessage: '' },
  recentSearches: [],
  pendingSavedReadings: [],
  pendingSavedReadingsMeta: { loading: false },
  pendingSavedResources: [],
  pendingSavedResourcesMeta: { loading: false },

  searchResults: { resources: [], hasNextPage: false},
  searchResultsMeta: { loading: false, error: false, errorMessage: '', searchQuery: '' },
};

export default function OWApp(state: AppState | undefined, action: AnyAction): AppState {
  if (!state) {
    return initialState;
  }

  //TODO: non exhaustive match ts
  //TODO: figure out the cases for figuring our sync status
  switch(action.type) {
    case ActionType.CONNECT_TO_EXTERNAL_SERVICE_REQUEST:
    case ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_REQUEST:
    case ActionType.GET_EXTERNAL_LOGIN_DETAILS_REQUEST: {
      const externalLoginDetailsMeta = { loading: true };

      return Object.assign({}, state, { externalLoginDetailsMeta })
    }
    case ActionType.CONNECT_TO_EXTERNAL_SERVICE_RESPONSE: 
    case ActionType.GET_EXTERNAL_LOGIN_DETAILS_RESPONSE: {
      const externalLoginDetailsMeta = { loading: false };

      if (action.result.type === ResultType.SUCCESS) {
        const externalLoginDetails = action.result.result;
        return Object.assign({}, state, { externalLoginDetailsMeta, externalLoginDetails });
      }

      return state;
    }
    case ActionType.DISCONNECT_FROM_EXTERNAL_SERVICE_RESPONSE: {
      const externalLoginDetailsMeta = { loading: false };

      //Don't check the failure status, this can't really fail.
      let externalLoginDetails: EmptyLoginDetails  = {
        type: LoginDetailsType.EMPTY,
        status: ConnectionStatus.NO_CREDENTIALS,
      }
      return Object.assign({}, state, { externalLoginDetailsMeta, externalLoginDetails });
    }
    case ActionType.ADD_FAVOURITE_REQUEST:
    case ActionType.REMOVE_FAVOURITE_REQUEST: {
      const favouriteResourcesMeta =  { loading: true, error: false, errorMessage: '' };
      return Object.assign({}, state, { favouriteResourcesMeta });
    }
    case ActionType.ADD_FAVOURITE_RESPONSE:
    case ActionType.REMOVE_FAVOURITE_RESPONSE: {
      const favouriteResourcesMeta = { loading: false, error: false, errorMessage: '' };

      //Add favourite has no payload - handled as a part of the user object
      return Object.assign({}, state, { favouriteResourcesMeta });
    }

    case ActionType.CHANGE_TRANSLATION_REQUEST: {
      const language = action.language;
      const translation = getTranslationForLanguage(translations, language);
      return Object.assign({}, state, { language, translation } );
    }

    case ActionType.GET_EXTERNAL_ORGS_REQUEST: {
      const externalOrgsMeta: ActionMeta = { loading: true, error: false, errorMessage: '' };

      return Object.assign({}, state, { externalOrgsMeta });
    }
    case ActionType.GET_EXTERNAL_ORGS_RESPONSE: {
      const externalOrgsMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };

      if (action.result.type === ResultType.ERROR) {
        const externalOrgsMeta: ActionMeta = { loading: false, error: true, errorMessage: 'Error loading organisations.' };

        return Object.assign({}, state, { externalOrgsMeta });
      }

      const externalOrgs = action.result.result;
      return Object.assign({}, state, { externalOrgs, externalOrgsMeta });
    }
    case ActionType.GET_LOCATION_REQUEST: {
      const locationMeta = { loading: true};
      return Object.assign({}, state, { locationMeta });
    }
    case ActionType.GET_LOCATION_RESPONSE: {
      const locationMeta = { loading: false };
      let location = state.location;
      if (action.result.type !== ResultType.ERROR) {
        location = action.result.result;
      }

      return Object.assign({}, state, { locationMeta, location });
    }
    case ActionType.GET_PENDING_READINGS_RESPONSE: {
      let pendingSavedReadings = state.pendingSavedReadings;
      if (action.result.type !== ResultType.ERROR) {
        pendingSavedReadings = action.result.result;
      }

      //TODO: add to the timeseries readings?

      return Object.assign({}, state, { pendingSavedReadings });
    }
    case ActionType.GET_PENDING_RESOURCES_RESPONSE: {
      let pendingSavedResources = state.pendingSavedResources;
      if (action.result.type !== ResultType.ERROR) {
        pendingSavedResources = action.result.result;
      }

      return Object.assign({}, state, { pendingSavedResources });
    }
    case ActionType.GET_READINGS_REQUEST: {
      //TODO: fix this hack for a deep clone
      const tsReadings = JSON.parse(JSON.stringify(state.tsReadings));
      const key = getTimeseriesReadingKey(action.resourceId, action.timeseriesName, action.range);
      let tsReading: TimeSeriesReading = { meta: { loading: true }, readings:[] };
      let existingReading: TimeSeriesReading | undefined  = tsReadings[key];
      if (existingReading) {
        tsReading = {
          meta: {loading: true},
          readings: existingReading.readings,
        }
      }

      tsReadings[key] = tsReading;
      return Object.assign({}, state, {tsReadings});
    }
    case ActionType.GET_READINGS_RESPONSE: {
      //TD fix this hack for a deep clone
      const tsReadings = JSON.parse(JSON.stringify(state.tsReadings));
      const key = getTimeseriesReadingKey(action.resourceId, action.timeseriesName, action.range);
      let tsReading: TimeSeriesReading = { meta: { loading: false }, readings: [] };
      //TD this could be done more efficently than looking through an array each time -
      //eg. building an index based on the resourceId and timeseriesName
      const pendingReadings: PendingReading[] = state.pendingSavedReadings
        .filter(r => r.resourceId === action.resourceId && r.timeseriesId === action.timeseriesName);
      
      if (action.result.type === ResultType.SUCCESS) {
        tsReading.readings = action.result.result;
      }

      tsReadings[key] = tsReading;
      return Object.assign({}, state, { tsReadings });
    }
    case ActionType.GET_RESOURCE_REQUEST: {
      //start loading
      const resourceMeta = state.resourceMeta;
      resourceMeta.set(action.resourceId, { loading: true, error: false, errorMessage: '' });
      
      return Object.assign({}, state, { resourceMeta });
    }
    case ActionType.GET_RESOURCE_RESPONSE: {
      //stop loading, add to resources list
      const resourceMeta = state.resourceMeta;
      let meta: ActionMeta = { loading: false, error: false, errorMessage: '' };
      if (action.result.type === ResultType.ERROR) {
        meta = { loading: false, error: true, errorMessage: action.result.message };
        resourceMeta.set(action.resourceId, meta);

        return Object.assign({}, state, { resourceMeta });
      }

      let resources: AnyResource[] = state.resources;
      resources.push(action.result.result);
      resourceMeta.set(action.resourceId, meta);
      //I think this was missing resources
      return Object.assign({}, state, { resourceMeta, resources });
    }
    case ActionType.GET_RESOURCES_REQUEST: {
      const resourcesMeta: ActionMeta = { loading: true, error: false, errorMessage: ''};

      return Object.assign({}, state, { resourcesMeta });
    }
    case ActionType.GET_RESOURCES_RESPONSE: {
      let resourcesMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };
      let resources: AnyResource[] = state.resources;
      let resourcesCache = state.resourcesCache;
      let pendingSavedResources = state.pendingSavedResources;

      if (action.result.type === ResultType.ERROR) {
        resourcesMeta = {loading: false, error: true, errorMessage: action.result.message}
        return Object.assign({}, state, { resourcesMeta, resources});
      }

      /*Remove things from the cache - this targets items with low ids...*/
      //TODO: ideally expire them properly, but this will work for now.
      const over = resourcesCache.size - RESOURCE_CACHE_MAX_SIZE;
      if (over > 0) {
        const range = Array(over).fill(1).map((x, y) => x + y);
        const keys = [...resourcesCache.keys()];
        range.forEach(idx => {
          const key = keys[idx];
          if (resourcesCache.has(key)) {
            resourcesCache.delete(key);
          }
        });
      }

      resources = [];
      const newResources = action.result.result;
      /* Save to cache */
      newResources.forEach(r => resourcesCache.set(r.id, r));
      /* Transform cache to list of resources*/
      [...resourcesCache.keys()].forEach(k => {
        const value = resourcesCache.get(k);
        if (value) {
          resources.push(value)
        }
      });

      return Object.assign({}, state, { resourcesMeta, resources, resourcesCache });
    }
    case ActionType.GET_SHORT_ID_REQUEST: {
      const shortIdMeta = state.shortIdMeta;
      shortIdMeta.set(action.resourceId, { loading: true, error: false, errorMessage: '' });

      return Object.assign({}, state, { shortIdMeta });
    }
    case ActionType.GET_SHORT_ID_RESPONSE: {
      let meta: ActionMeta = { loading: false, error: false, errorMessage: '' };
      const shortIdMeta = state.shortIdMeta;
      const shortIdCache = state.shortIdCache;

      if (action.result.type === ResultType.ERROR) {
        meta = { loading: false, error: true, errorMessage: action.result.message };
        shortIdMeta.set(action.resourceId, meta);

        return Object.assign({}, state, { shortIdMeta });
      }

      shortIdCache.set(action.resourceId, action.result.result);
      shortIdMeta.set(action.resourceId, meta);

      return Object.assign({}, state, { shortIdCache, shortIdMeta });
    }
    case ActionType.GET_USER_REQUEST: {
      const favouriteResourcesMeta: ActionMeta = {loading: true, error: false, errorMessage: ''};
      const recentResourcesMeta: ActionMeta = {loading: true, error: false, errorMessage: ''};

      return Object.assign({}, state, {
        favouriteResourcesMeta,
        recentResourcesMeta,
      });
    }
    case ActionType.GET_USER_RESPONSE: {
      const favouriteResourcesMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };
      const recentResourcesMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };

      let favouriteResources = state.favouriteResources;
      let recentResources = state.recentResources;
      let recentSearches = state.recentSearches;
      let language = state.language;
      let translation = state.translation;

      
      if (action.result.type !== ResultType.ERROR) {
        favouriteResources = action.result.result.favouriteResources;
        recentResources = action.result.result.recentResources;
        recentSearches = action.result.result.recentSearches;
        language = action.result.result.translation;
        translation = getTranslationForLanguage(translations, language);
      }
      
      //TODO: error handling?
      return Object.assign({}, state, {
        favouriteResources,
        recentResources,
        favouriteResourcesMeta,
        recentResourcesMeta,
        recentSearches,
        language,
        translation,
      });
    }
    case ActionType.GOT_SHORT_IDS: {
      const shortIdCache = state.shortIdCache;

      action.shortIds.forEach((shortId, idx) => {
        const longId = action.longIds[idx];
        shortIdCache.set(longId, shortId);
      })

      return Object.assign({}, state, { shortIdCache });
    }
    case ActionType.PERFORM_SEARCH_REQUEST: {
      const searchResultsMeta: SearchResultsMeta ={ loading: true, error: false, errorMessage: '', searchQuery: '' };
      let searchResults = state.searchResults;
      searchResultsMeta.searchQuery = action.searchQuery;

      //We are on the first page, clear out old results
      if (action.page === 1) {
        searchResults = {resources: [], hasNextPage: false};
      }

      return Object.assign({}, state, { searchResultsMeta, searchResults })
    }
    case ActionType.PERFORM_SEARCH_RESPONSE: {
      let lastSearchResultsMeta: SearchResultsMeta = state.searchResultsMeta;
      let searchResultsMeta: SearchResultsMeta = { loading: false, error: false, errorMessage: '', searchQuery: lastSearchResultsMeta.searchQuery};
      let searchResults = state.searchResults;
      
      const result = action.result;
      if (result.type === ResultType.ERROR) {
        searchResultsMeta = { loading: false, error: true, errorMessage: 'Could not load search. Please try again.', searchQuery: lastSearchResultsMeta.searchQuery };
        return Object.assign({}, state, { searchResultsMeta });
      }

      const resources: AnyResource[] = searchResults.resources.concat(result.result.resources);
      searchResults = { resources, hasNextPage: result.result.hasNextPage };
      
      return Object.assign({}, state, {searchResults, searchResultsMeta});
    }
    case ActionType.SILENT_LOGIN_REQUEST: {
      const userIdMeta = {loading: true, error: false, errorMessage: ''};
      
      return Object.assign({}, state, { userIdMeta });
    }
    case ActionType.SILENT_LOGIN_RESPONSE: {
      const userIdMeta = { loading: false, error: false, errorMessage: '' };

      const result = action.userIdResult;
      if (result.type === ResultType.ERROR) {
        userIdMeta.error = true;
        userIdMeta.errorMessage = result.message;

        return Object.assign({}, state, { userIdMeta });
      }

      return Object.assign({}, state, {
        user: {type: UserType.USER, userId: result.result.userId, token: result.result.token},
        userIdMeta,
      });
    }

    case ActionType.ADD_RECENT_REQUEST: {
      //Set the recent resource meta to loading: true
      const recentResourcesMeta = {loading: true};
      
      return Object.assign({}, state, { recentResourcesMeta })
    }

    case ActionType.ADD_RECENT_RESPONSE: {
      let recentResourcesMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };      
      return Object.assign({}, state, { recentResourcesMeta })
    }
    case ActionType.SAVE_READING_REQUEST: {
      const pendingSavedReadingsMeta =  { loading: true };

      return Object.assign({}, state, { pendingSavedReadingsMeta });
    }
    case ActionType.SAVE_READING_RESPONSE: {
      const pendingSavedReadingsMeta = { loading: false };

      return Object.assign({}, state, { pendingSavedReadingsMeta });
    }
    case ActionType.SAVE_RESOURCE_REQUEST: {
      const pendingSavedResourcesMeta =  { loading: true };

      return Object.assign({}, state, { pendingSavedResourcesMeta });
    }
    case ActionType.SAVE_RESOURCE_RESPONSE: {
      const pendingSavedResourcesMeta = { loading: false };

      return Object.assign({}, state, { pendingSavedResourcesMeta });
    }
    case ActionType.START_EXTERNAL_SYNC_REQUEST: {
      const externalSyncStatus: ExternalSyncStatusRunning = { status: ExternalSyncStatusType.RUNNING };

      //TODO: handle login error case here?
      return Object.assign({}, state, { externalSyncStatus })
    }

    case ActionType.START_EXTERNAL_SYNC_RESPONSE: {      
      //If this errored out, then something serious went wrong
      if (action.result.type === ResultType.ERROR) {
        const externalSyncStatus: ExternalSyncStatusComplete = { 
          status: ExternalSyncStatusType.COMPLETE,  
          pendingResourcesResults: new Map<string, SomeResult<any>>(),
          pendingReadingsResults: new Map<string, SomeResult<any>>(),
        };

        return Object.assign({}, state, { externalSyncStatus })
      }

      let resources: AnyResource[] = state.resources;
      const externalSyncStatus: ExternalSyncStatusComplete = action.result.result;
      
      //add the saved resources to the resource list
      for (let result of externalSyncStatus.pendingResourcesResults.values()) {
        if (result.type !== ResultType.SUCCESS) {
          continue;
        }

        resources.push(result.result);
      }

      return Object.assign({}, state, { externalSyncStatus, resources })
    }

    case ActionType.SET_EXTERNAL_ORGANISATION: {
      const currentExternalLoginDetails = state.externalLoginDetails;

      if (currentExternalLoginDetails.type === LoginDetailsType.FULL &&
        currentExternalLoginDetails.status === ConnectionStatus.SIGN_IN_SUCCESS) {
        
          const newExternalLoginDetails: AnyLoginDetails = {
            externalOrg: action.organisation,
            type: LoginDetailsType.FULL,
            status: ConnectionStatus.SIGN_IN_SUCCESS,
            username: currentExternalLoginDetails.username,
          }

          return Object.assign({}, state, { externalLoginDetails: newExternalLoginDetails });
      }

      console.log("Current external login details no good fool.");
      return state;
    }

    default: 
      return state;
  }
}