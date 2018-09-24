import { ActionType, AnyAction } from "../actions";
import { Resource } from "../typings/models/OurWater";


export type AppState = {
  favouriteResources: Map<string, Resource>,
  isConnected: boolean,
}

const initialState: AppState = {
  favouriteResources: new Map<string, Resource>(),
  isConnected: false,
};

export default function OWApp(state: AppState| undefined, action: AnyAction) {
  //Need this for the redux function
  if (!state) {
    return initialState;
  }

  //TODO: figure out how to do async stuff here as well
  //TODO: non exhaustive match ts
  switch(action.type) {
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

    case ActionType.TOGGLE_CONNECTION: {
      console.log("Toggling the connection in reducer!", action);

      return Object.assign({}, state, {isConnected: action.isConnected})
    }



    default: 
      return state;

  }
}