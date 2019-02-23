
/**
 * Step 1:
 * Add the new action types for the action request and response here.
 */
export enum ActionType {
  ADD_FAVOURITE_REQUEST = 'ADD_FAVOURITE_REQUEST',
  ADD_FAVOURITE_RESPONSE = 'ADD_FAVOURITE_RESPONSE',
  
  ADD_RECENT_REQUEST = 'ADD_RECENT_REQUEST',
  ADD_RECENT_RESPONSE = 'ADD_RECENT_RESPONSE',

  CHANGE_TRANSLATION_REQUEST = 'CHANGE_TRANSLATION_REQUEST',
  CHANGE_TRANSLATION_RESPONSE = 'CHANGE_TRANSLATION_RESPONSE',

  CONNECT_TO_EXTERNAL_SERVICE_REQUEST = 'CONNECT_TO_EXTERNAL_SERVICE_REQUEST',
  CONNECT_TO_EXTERNAL_SERVICE_RESPONSE = 'CONNECT_TO_EXTERNAL_SERVICE_RESPONSE',

  DISCONNECT_FROM_EXTERNAL_SERVICE_REQUEST = 'DISCONNECT_FROM_EXTERNAL_SERVICE_REQUEST',
  DISCONNECT_FROM_EXTERNAL_SERVICE_RESPONSE = 'DISCONNECT_FROM_EXTERNAL_SERVICE_RESPONSE',

  DELETE_PENDING_READING_REQUEST = 'DELETE_PENDING_READING_REQUEST',
  DELETE_PENDING_READING_RESPONSE = 'DELETE_PENDING_READING_RESPONSE',
  
  DELETE_PENDING_RESOURCE_REQUEST = 'DELETE_PENDING_RESOURCE_REQUEST',
  DELETE_PENDING_RESOURCE_RESPONSE = 'DELETE_PENDING_RESOURCE_RESPONSE',

  GET_EXTERNAL_LOGIN_DETAILS_REQUEST = 'GET_EXTERNAL_LOGIN_DETAILS_REQUEST',
  GET_EXTERNAL_LOGIN_DETAILS_RESPONSE = 'GET_EXTERNAL_LOGIN_DETAILS_RESPONSE',

  GET_EXTERNAL_ORGS_REQUEST = 'GET_EXTERNAL_ORGS_REQUEST',
  GET_EXTERNAL_ORGS_RESPONSE = 'GET_EXTERNAL_ORGS_RESPONSE',

  GET_LOCATION_REQUEST = 'GET_LOCATION_REQUEST',
  GET_LOCATION_RESPONSE = 'GET_LOCATION_RESPONSE',

  GET_PENDING_READINGS_REQUEST = 'GET_PENDING_READINGS_REQUEST',
  GET_PENDING_READINGS_RESPONSE = 'GET_PENDING_READINGS_RESPONSE',
  GET_PENDING_RESOURCES_REQUEST = 'GET_PENDING_RESOURCES_REQUEST',
  GET_PENDING_RESOURCES_RESPONSE = 'GET_PENDING_RESOURCES_RESPONSE',

  GET_READINGS_REQUEST = 'GET_READINGS_REQUEST',
  GET_READINGS_RESPONSE = 'GET_READINGS_RESPONSE',

  GET_RESOURCE_REQUEST = 'GET_RESOURCE_REQUEST',
  GET_RESOURCE_RESPONSE = 'GET_RESOURCE_RESPONSE',

  GET_RESOURCES_REQUEST = 'GET_RESOURCES_REQUEST',
  GET_RESOURCES_RESPONSE = 'GET_RESOURCES_RESPONSE',

  GET_RESOURCES_REQUEST_PAGINATED = 'GET_RESOURCES_REQUEST_PAGINATED',
  GET_RESOURCES_RESPONSE_PAGINATED = 'GET_RESOURCES_RESPONSE_PAGINATED',

  GET_SHORT_ID_REQUEST = 'GET_SHORT_ID_REQUEST',
  GET_SHORT_ID_RESPONSE = 'GET_SHORT_ID_RESPONSE',

  GET_USER_REQUEST = 'GET_USER_REQUEST',
  GET_USER_RESPONSE = 'GET_USER_RESPONSE',

  GOT_SHORT_IDS = 'GOT_SHORT_IDS',
  
  LOGIN_CALLBACK = 'LOGIN_CALLBACK',

  LOGOUT_REQUEST = 'LOGOUT_REQUEST',
  LOGOUT_RESPONSE = 'LOGOUT_RESPONSE',

  PASS_ON_USER_SUBSCRIPTION = 'PASS_ON_USER_SUBSCRIPTION',

  PERFORM_SEARCH_REQUEST = 'PERFORM_SEARCH_REQUEST',
  PERFORM_SEARCH_RESPONSE = 'PERFORM_SEARCH_RESPONSE',
  PERFORM_SEARCH_RESPONSE_V2 = 'PERFORM_SEARCH_RESPONSE_V2',

  REFRESH_READINGS = 'REFRESH_READINGS',

  REMOVE_FAVOURITE_REQUEST = 'REMOVE_FAVOURITE_REQUEST',
  REMOVE_FAVOURITE_RESPONSE = 'REMOVE_FAVOURITE_RESPONSE',
  
  SAVE_READING_REQUEST = 'SAVE_READING_REQUEST',
  SAVE_READING_RESPONSE = 'SAVE_READING_RESPONSE',

  SAVE_RESOURCE_REQUEST = 'SAVE_RESOURCE_REQUEST',
  SAVE_RESOURCE_RESPONSE = 'SAVE_RESOURCE_RESPONSE',

  SEND_VERIFY_CODE_REQUEST = 'SEND_VERIFY_CODE_REQUEST',
  SEND_VERIFY_CODE_RESPONSE = 'SEND_VERIFY_CODE_RESPONSE',

  SAVE_USER_DETAILS_REQUEST = 'SAVE_USER_DETAILS_REQUEST',
  SAVE_USER_DETAILS_RESPONSE = 'SAVE_USER_DETAILS_RESPONSE',

  SEND_RESOURCE_EMAIL_REQUEST = 'SEND_RESOURCE_EMAIL_REQUEST',
  SEND_RESOURCE_EMAIL_RESPONSE = 'SEND_RESOURCE_EMAIL_RESPONSE',

  SILENT_LOGIN_REQUEST = 'SILENT_LOGIN_REQUEST',
  SILENT_LOGIN_RESPONSE = 'SILENT_LOGIN_RESPONSE',
  
  SET_EXTERNAL_ORGANISATION = 'SET_EXTERNAL_ORGANISATION',
  
  START_EXTERNAL_SYNC_REQUEST = 'START_EXTERNAL_SYNC_REQUEST',
  START_EXTERNAL_SYNC_RESPONSE = 'START_EXTERNAL_SYNC_RESPONSE',

  START_INTERNAL_SYNC_REQUEST = 'START_INTERNAL_SYNC_REQUEST',
  START_INTERNAL_SYNC_RESPONSE = 'START_INTERNAL_SYNC_RESPONSE',

  TOGGLE_CONNECTION = 'TOGGLE_CONNECTION',

  UPDATED_TRANSLATION = 'UPDATED_TRANSLATION',

  VERIFY_CODE_AND_LOGIN_REQUEST = 'VERIFY_CODE_AND_LOGIN_REQUEST',
  VERIFY_CODE_AND_LOGIN_RESPONSE = 'VERIFY_CODE_AND_LOGIN_RESPONSE',
}