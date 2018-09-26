
import { Resource, Reading, TimeseriesRange } from "../typings/models/OurWater";
import { ActionMeta, SyncMeta } from "../AppProvider";
import { SyncStatus } from "../typings/enums";
import { LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus, ExternalSyncStatus, ExternalSyncStatusType } from "../typings/api/ExternalServiceApi";
import { ResultType } from "../typings/AppProviderTypes";
import { MaybeUser, UserType } from "../typings/UserTypes";
import { ActionType } from "../actions/ActionType";
import { AnyAction } from "../actions/AnyAction";
import { Location, NoLocation, LocationType } from "../typings/Location";
import { isNullOrUndefined } from "util";
import { newTsRangeReadings, setLoading, addReadingsAndStopLoading } from "../utils";

const RESOURCE_CACHE_MAX_SIZE = 1000;

export type TimeSeriesReading = {
  meta: { loading: boolean },
  readings: Reading[],
}

export type TimeseriesRangeReadings = {
  ONE_YEAR: TimeSeriesReading,
  THREE_MONTHS: TimeSeriesReading,
  TWO_WEEKS: TimeSeriesReading,
  EXTENT: TimeSeriesReading,
}

export type AppState = {
  //Session based
  isConnected: boolean,
  
  //Local
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  location: Location | NoLocation,
  locationMeta: SyncMeta,

  //Api
  resources: Resource[],
  resourcesMeta: ActionMeta,
  //Store all past resources we have seen here
  resourcesCache: Map<string, Resource>, //A super simple cache implementation
  externalSyncStatus: ExternalSyncStatus,
  timeseriesReadings: Map<string, TimeseriesRangeReadings> //timeseriesId -> TimeseriesRangeReadings


  /* resourceId -> resource map, containing  */
  //TODO: think this through better
  // readingsMap: Map<string, Resource>
  
  //Firebase
  user: MaybeUser,
  userIdMeta: ActionMeta,
  syncStatus: SyncStatus,
  favouriteResources: Resource[],
  favouriteResourcesMeta: ActionMeta,
  recentResources: Resource[],
  recentResourcesMeta: ActionMeta,
  pendingSavedReadings: Reading[], //TODO: figure out how to load from collections
  pendingSavedReadingsMeta: SyncMeta,
  pendingSavedResources: Resource[],
  pendingSavedResourcesMeta: SyncMeta, 
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
  timeseriesReadings: new Map<string, TimeseriesRangeReadings>(),

  //Firebase
  user: {type: UserType.NO_USER}, 
  userIdMeta: { loading: false, error: false, errorMessage: '' },
  syncStatus: SyncStatus.none,
  favouriteResources: [],
  favouriteResourcesMeta: { loading: false, error: false, errorMessage: '' },
  recentResources: [],
  recentResourcesMeta: { loading: false, error: false, errorMessage: '' },
  pendingSavedReadings: [],
  pendingSavedReadingsMeta: { loading: false },
  pendingSavedResources: [],
  pendingSavedResourcesMeta: { loading: false },
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

      let externalLoginDetails = state.externalLoginDetails;
      if (action.result.type === ResultType.SUCCESS) {
        externalLoginDetails = action.result.result;
      }

      return Object.assign({}, state, { externalLoginDetailsMeta, externalLoginDetails });
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
      const timeseriesReadings = setLoading(state.timeseriesReadings, action.timeseriesId, action.range, true);
      return Object.assign({}, state, { timeseriesReadings });
    }
    case ActionType.GET_READINGS_RESPONSE: {
      let timeseriesReadings;
      if (action.result.type === ResultType.ERROR) {
        timeseriesReadings = setLoading(state.timeseriesReadings, action.timeseriesId, action.range, false);
        return Object.assign({}, state, { timeseriesReadings });
      }

      const readings = action.result.result;
      //TODO: add in pending readings here
      timeseriesReadings = addReadingsAndStopLoading(
        readings,
        state.timeseriesReadings,
        action.timeseriesId,
        action.range
      );

      return Object.assign({}, state, { timeseriesReadings });
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
        // console.log(`Removing ${over} items from cache`);
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
      //TODO: add this back
      // pendingSavedResources.forEach(r => resourcesCache.set(r.id, r));
      [...resourcesCache.keys()].forEach(k => {
        const value = resourcesCache.get(k);
        if (value) {
          resources.push(value)
        }
      });

      // console.log("resources count is:", resources.length);
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
      
      if (action.result.type !== ResultType.ERROR) {
        favouriteResources = action.result.result.favouriteResources;
        recentResources = action.result.result.recentResources;
      }
      
      //TODO: error handling?
      return Object.assign({}, state, {
        favouriteResources,
        recentResources,
        favouriteResourcesMeta,
        recentResourcesMeta,
      });
    }
    case ActionType.SILENT_LOGIN_REQUEST: {
      const userIdMeta = {loading: true, error: false, errorMessage: ''};
      
      return Object.assign({}, state, { userIdMeta });
    }
    case ActionType.SILENT_LOGIN_RESPONSE: {
      const userIdMeta = { loading: false, error: false, errorMessage: '' };

      const result = action.userIdResult;
      console.log("SILENT_LOGIN_RESPONSE", result);
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
    // case ActionType.ADD_FAVOURITE: {

    //   const { favouriteResources } = state;
    //   favouriteResources.set(action.resource.id, action.resource);
      
    //   return Object.assign({}, state, { favouriteResources });
    // }
    // case ActionType.REMOVE_FAVOURITE: {
    //   const { favouriteResources } = state;
    //   favouriteResources.delete(action.resourceId);
      
    //   return Object.assign({}, state, { favouriteResources });
    // }

    case ActionType.ADD_RECENT_REQUEST: {
      //Set the recent resource meta to loading: true

      const recentResourcesMeta = {loading: true};
      
      return Object.assign({}, state, { recentResourcesMeta })
    }

    case ActionType.ADD_RECENT_RESPONSE: {
      let recentResourcesMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };
      //TODO: how to handle errors nicely in here?
      const result = action.result;
      // let recentResources: Resource[] = []; //TODO: should this default to the last one?
      // if (result.type === ResultType.ERROR) {
      //   recentResourcesMeta = {
      //     loading: true,
      //     error: true,
      //     errorMessage: result.message,
      //   }
      // } else {
      //   recentResources = result.result;
      // }

      // console.log("AddRecentResponse, resources", recentResources);
      
      return Object.assign({}, state, { recentResourcesMeta })
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

    default: 
      return state;
  }
}