
import { Resource, Reading } from "../typings/models/OurWater";
import { ActionMeta, SyncMeta } from "../AppProvider";
import { SyncStatus } from "../typings/enums";
import { LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus } from "../typings/api/ExternalServiceApi";
import { ResultType } from "../typings/AppProviderTypes";
import { MaybeUser, UserType } from "../typings/UserTypes";
import { ActionType } from "../actions/ActionType";
import { AnyAction } from "../actions/AnyAction";
import { Location, NoLocation, LocationType } from "../typings/Location";


export type AppState = {
  //Session based
  isConnected: boolean,
  
  //Local
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  location: Location | NoLocation,
  locationMeta: SyncMeta,
  
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
  isConnected: false,
  
  //Local
  externalLoginDetails: {
    type: LoginDetailsType.EMPTY,
    status: ConnectionStatus.NO_CREDENTIALS,
  },
  externalLoginDetailsMeta: { loading: false },
  location: { type: LocationType.NO_LOCATION},
  locationMeta: { loading: false },

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
  switch(action.type) {
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
    case ActionType.GET_USER_REQUEST: {
      const favouriteResourcesMeta: ActionMeta = {loading: true, error: false, errorMessage: ''};
      const recentResourcesMeta: ActionMeta = {loading: true, error: false, errorMessage: ''};
      const pendingSavedReadingsMeta: SyncMeta = {loading: true};
      const pendingSavedResourcesMeta: SyncMeta = {loading: true};

      return Object.assign({}, state, {
        favouriteResourcesMeta,
        recentResourcesMeta,
        pendingSavedReadingsMeta,
        pendingSavedResourcesMeta,
      });
    }
    case ActionType.GET_USER_RESPONSE: {
      const favouriteResourcesMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };
      const recentResourcesMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };
      const pendingSavedReadingsMeta: SyncMeta = { loading: false };
      const pendingSavedResourcesMeta: SyncMeta = { loading: false };

      let favouriteResources = state.favouriteResources;
      let recentResources = state.recentResources;
      let pendingSavedReadings = state.pendingSavedReadings;
      let pendingSavedResources = state.pendingSavedResources;
      
      if (action.result.type !== ResultType.ERROR) {
        favouriteResources = action.result.result.favouriteResources;
        recentResources = action.result.result.recentResources;
        pendingSavedReadings = action.result.result.pendingSavedReadings;
        pendingSavedResources = action.result.result.pendingSavedResources;
      }
      
      //TODO: error handling?
      return Object.assign({}, state, {
        favouriteResources,
        recentResources,
        pendingSavedReadings,
        pendingSavedResources,
        favouriteResourcesMeta,
        recentResourcesMeta,
        pendingSavedReadingsMeta,
        pendingSavedResourcesMeta,
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
      let recentResources: Resource[] = []; //TODO: should this default to the last one?
      if (result.type === ResultType.ERROR) {
        recentResourcesMeta = {
          loading: true,
          error: true,
          errorMessage: result.message,
        }
      } else {
        recentResources = result.result;
      }

      console.log("AddRecentResponse, resources", recentResources);
      
      return Object.assign({}, state, { recentResourcesMeta, recentResources })
    }

    case ActionType.TOGGLE_CONNECTION: {
      console.log("Toggling the connection in reducer!", action);

      return Object.assign({}, state, {isConnected: action.isConnected});
    }


    default: 
      return state;
  }
}