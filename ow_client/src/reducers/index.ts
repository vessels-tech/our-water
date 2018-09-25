import { ActionType, AnyAction } from "../actions";
import { Resource, Reading } from "../typings/models/OurWater";
import { ActionMeta, SyncMeta } from "../AppProvider";
import { SyncStatus } from "../typings/enums";
import { LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus } from "../typings/api/ExternalServiceApi";
import { ResultType } from "../typings/AppProviderTypes";
import { MaybeUser, UserType } from "../typings/UserTypes";


export type AppState = {
  //Session based
  isConnected: boolean,
  
  //Local
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  
  //Firebase
  user: MaybeUser,
  userIdMeta: ActionMeta,
  syncStatus: SyncStatus,
  favouriteResources: Map<string, Resource>,
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
  
  //Firebase
  user: {type: UserType.NO_USER}, 
  userIdMeta: { loading: false, error: false, errorMessage: '' },
  syncStatus: SyncStatus.none,
  favouriteResources: new Map<string, Resource>(),
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
    case ActionType.ADD_FAVOURITE: {

      const { favouriteResources } = state;
      favouriteResources.set(action.resource.id, action.resource);
      
      return Object.assign({}, state, { favouriteResources });
    }
    case ActionType.REMOVE_FAVOURITE: {
      const { favouriteResources } = state;
      favouriteResources.delete(action.resourceId);
      
      return Object.assign({}, state, { favouriteResources });
    }

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