import { Resource } from "../typings/models/OurWater";

export enum ActionType {
  ADD_FAVOURITE = 'ADD_FAVOURITE',
  REMOVE_FAVOURITE = 'REMOVE_FAVOURITE',
  TOGGLE_CONNECTION = 'TOGGLE_CONNECTION',
}

export type AnyAction = AddFavouriteAction |
  RemoveFavouriteAction |
  ToggleConnectionAction 
  ;


export type AddFavouriteAction = {
  type: ActionType.ADD_FAVOURITE,
  resource: Resource,
}

export type RemoveFavouriteAction = {
  type: ActionType.REMOVE_FAVOURITE,
  resourceId: string,
}

export type ToggleConnectionAction = {
  type: ActionType.TOGGLE_CONNECTION,
  isConnected: boolean,
}

/**
 * Action creators
 */
export function addFavourite(resource: Resource): AddFavouriteAction {
  return {
    type: ActionType.ADD_FAVOURITE,
    resource,
  } 
}

export function removeFavourite(resourceId: string): RemoveFavouriteAction {
  return {
    type: ActionType.REMOVE_FAVOURITE,
    resourceId,
  } 
}

export function toggleConnection(isConnected: boolean): ToggleConnectionAction {
  console.log("ToggleConnection creator called");
  return {
    type: ActionType.TOGGLE_CONNECTION,
    isConnected,
  }
}