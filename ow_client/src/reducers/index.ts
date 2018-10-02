
import { Resource, Reading, TimeseriesReadings, TimeSeriesReading, PendingResource, PendingReading } from "../typings/models/OurWater";
import { SyncStatus } from "../typings/enums";
import { LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus, ExternalSyncStatus, ExternalSyncStatusType, AnyLoginDetails } from "../typings/api/ExternalServiceApi";
import { ResultType } from "../typings/AppProviderTypes";
import { MaybeUser, UserType } from "../typings/UserTypes";
import { ActionType } from "../actions/ActionType";
import { AnyAction } from "../actions/AnyAction";
import { Location, NoLocation, LocationType } from "../typings/Location";
import { getTimeseriesReadingKey } from "../utils";
import { ActionMeta, SyncMeta } from "../typings/Reducer";
import { GGMNSearchEntity, GGMNOrganisation } from "../typings/models/GGMN";

const RESOURCE_CACHE_MAX_SIZE = 500;

export type AppState = {
  //Session based
  isConnected: boolean,
  
  //Local
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  location: Location | NoLocation,
  locationMeta: SyncMeta,

  //Api
  resources: Resource[],
  resourcesMeta: ActionMeta,
  resourcesCache: Map<string, Resource>, //A super simple cache implementation
  externalSyncStatus: ExternalSyncStatus,
  externalOrgs: GGMNOrganisation[], //A list of external org ids the user can select from
  externalOrgsMeta: ActionMeta,
  tsReadings: TimeseriesReadings, //simple map: key: `timeseriesId+range` => TimeseriesReading
  
  //Firebase
  favouriteResources: Resource[],
  favouriteResourcesMeta: ActionMeta,
  pendingSavedReadings: PendingReading[],
  pendingSavedReadingsMeta: SyncMeta,
  pendingSavedResources: PendingResource[],
  pendingSavedResourcesMeta: SyncMeta, 
  recentResources: Resource[],
  recentResourcesMeta: ActionMeta,
  recentSearches: string[],
  syncStatus: SyncStatus,
  searchResults: GGMNSearchEntity[],
  searchResultsMeta: ActionMeta,
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

  //Api
  resources: [],
  resourcesMeta: { loading: false, error: false, errorMessage: '' },
  resourcesCache: new Map<string, Resource>(), 
  externalSyncStatus: {type: ExternalSyncStatusType.NOT_RUNNING},
  externalOrgs: [],
  externalOrgsMeta: { loading: false, error: false, errorMessage: '' },
  tsReadings: {},

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

  searchResults: [],
  searchResultsMeta: { loading: false, error: false, errorMessage: '' },
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
      const key = getTimeseriesReadingKey(action.timeseriesId, action.range);
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
      //TODO: fix this hack for a deep clone
      const tsReadings = JSON.parse(JSON.stringify(state.tsReadings));
      const key = getTimeseriesReadingKey(action.timeseriesId, action.range);
      let tsReading: TimeSeriesReading = { meta: { loading: false }, readings: [] };
      
      if (action.result.type === ResultType.SUCCESS) {
        tsReading.readings = action.result.result;
      }

      //TODO: merge in pending readings here.

      tsReadings[key] = tsReading;
      return Object.assign({}, state, { tsReadings });
    }
    case ActionType.GET_RESOURCES_REQUEST: {
      const resourcesMeta: ActionMeta = { loading: true, error: false, errorMessage: ''};

      return Object.assign({}, state, { resourcesMeta });
    }
    case ActionType.GET_RESOURCES_RESPONSE: {
      let resourcesMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };
      let resources: Resource[] = state.resources;
      let resourcesCache = state.resourcesCache;
      let pendingSavedResources = state.pendingSavedResources;

      if (action.result.type === ResultType.ERROR) {
        resourcesMeta = {loading: false, error: true, errorMessage: action.result.message}
        return Object.assign({}, state, { resourcesMeta, resources});
      }

      //Remove things from the cache - this targets items with low ids...
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
      newResources.forEach(r => resourcesCache.set(r.id, r));
      [...resourcesCache.keys()].forEach(k => {
        const value = resourcesCache.get(k);
        if (value) {
          resources.push(value)
        }
      });

      return Object.assign({}, state, { resourcesMeta, resources, resourcesCache });
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
      
      if (action.result.type !== ResultType.ERROR) {
        favouriteResources = action.result.result.favouriteResources;
        recentResources = action.result.result.recentResources;
        recentSearches = action.result.result.recentSearches;
      }
      
      //TODO: error handling?
      return Object.assign({}, state, {
        favouriteResources,
        recentResources,
        favouriteResourcesMeta,
        recentResourcesMeta,
        recentSearches,
      });
    }
    case ActionType.PERFORM_SEARCH_REQUEST: {
      const searchResultsMeta: ActionMeta ={ loading: true, error: false, errorMessage: '' };
      let searchResults = state.searchResults;

      //We are on the first page, clear out old results
      if (action.page === 1) {
        searchResults = [];
      }

      return Object.assign({}, state, { searchResultsMeta, searchResults })
    }
    case ActionType.PERFORM_SEARCH_RESPONSE: {
      let searchResultsMeta: ActionMeta = { loading: false, error: false, errorMessage: ''};
      let searchResults = state.searchResults;
      
      const result = action.result;
      if (result.type === ResultType.ERROR) {
        searchResultsMeta = { loading: false, error: true, errorMessage: 'Could not load search. Please try again.' };
        return Object.assign({}, state, { searchResultsMeta });
      }
      searchResults = searchResults.concat(result.result);
      
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
        user: {type: UserType.USER, userId: result.result},
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
      const externalSyncStatus: ExternalSyncStatus = { type: ExternalSyncStatusType.RUNNING };

      //TODO: handle login error case here?
      return Object.assign({}, state, { externalSyncStatus })
    }

    case ActionType.START_EXTERNAL_SYNC_RESPONSE: {
      const externalSyncStatus: ExternalSyncStatus = { type: ExternalSyncStatusType.NOT_RUNNING };

      //TODO: handle login error case here?
      return Object.assign({}, state, { externalSyncStatus })
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