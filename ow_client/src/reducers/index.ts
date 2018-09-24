import { ActionType, AnyAction } from "../actions";
import { Resource, Reading } from "../typings/models/OurWater";
import { ActionMeta, SyncMeta } from "../AppProvider";
import { SyncStatus } from "../typings/enums";
import { LoginDetails, EmptyLoginDetails, LoginDetailsType, ConnectionStatus } from "../typings/api/ExternalServiceApi";
import { ResultType } from "../typings/AppProviderTypes";


export type AppState = {
  //Session based
  isConnected: boolean,
  
  //Local
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  
  //Firebase
  userId: string,
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
  userId: '', 
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

export default function OWApp(state: AppState = initialState, action: AnyAction) {

  //TODO: non exhaustive match ts
  switch(action.type) {
    case ActionType.SILENT_LOGIN_REQUEST: {
      const userIdMeta = {loading: true, error: false, errorMessage: ''};
      Object.assign({}, state, { userIdMeta });
      break;
    }
    case ActionType.SILENT_LOGIN_RESPONSE: {
      const userIdMeta = { loading: false, error: false, errorMessage: '' };

      const result = action.userIdResult;
      if (result.type === ResultType.ERROR) {
        userIdMeta.error = true;
        userIdMeta.errorMessage = result.message;

        Object.assign({}, state, { userIdMeta });
        return;
      }

      Object.assign({}, state, {
        userId: result.result,
        userIdMeta,
      });

      return;
    }
    case ActionType.ADD_FAVOURITE: {

      const { favouriteResources } = state;
      favouriteResources.set(action.resource.id, action.resource);
      Object.assign({}, state, { favouriteResources });
      
      break;
    }
    case ActionType.REMOVE_FAVOURITE: {
      const { favouriteResources } = state;
      favouriteResources.delete(action.resourceId);
      Object.assign({}, state, { favouriteResources });
      
      break;
    }

    case ActionType.ADD_RECENT_REQUEST: {
      //Set the recent resource meta to loading: true

      const recentResourcesMeta = {loading: true};
      Object.assign({}, state, { recentResourcesMeta })
      break;
    }

    case ActionType.ADD_RECENT_RESPONSE: {
      let recentResourcesMeta: ActionMeta = { loading: false, error: false, errorMessage: '' };
      //TODO: how to handle errors nicely in here?
      const result = action.result;
      let resources: Resource[] = []; //TODO: should this default to the last one?
      if (result.type === ResultType.ERROR) {
        recentResourcesMeta = {
          loading: true,
          error: true,
          errorMessage: result.message,
        }
      } else {
        resources = result.result;
      }
      Object.assign({}, state, { recentResourcesMeta, resources })

      break;
    }

    case ActionType.TOGGLE_CONNECTION: {
      console.log("Toggling the connection in reducer!", action);

      return Object.assign({}, state, {isConnected: action.isConnected})
    }


    default: 
      return state;
  }
}