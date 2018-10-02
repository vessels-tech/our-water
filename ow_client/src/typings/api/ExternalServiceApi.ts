import { GGMNOrganisation } from '../models/GGMN'; 

export enum LoginDetailsType {
  EMPTY = 'EMPTY',
  FULL = 'FULL',
}

export type AnyLoginDetails = EmptyLoginDetails | ErrorLoginDetails | LoginDetails;

export interface EmptyLoginDetails {
  type: LoginDetailsType.EMPTY,
  status: ConnectionStatus.NO_CREDENTIALS,
}

export interface ErrorLoginDetails {
  type: LoginDetailsType.FULL,
  status: ConnectionStatus.SIGN_IN_ERROR,
  username: string,
}

export interface LoginDetails {
  type: LoginDetailsType.FULL,
  status: ConnectionStatus.SIGN_IN_SUCCESS,
  username: string,
  externalOrg: GGMNOrganisation, //the organisation the user selected after logging in
}

export type LoginRequest = {
  username: string,
  password: string,
  [key: string]: string,
}

export type OptionalAuthHeaders = {
  username?: string,
  password?: string,
};


export enum ConnectionStatus {
  NO_CREDENTIALS = 'NO_CREDENTIALS',
  SIGN_IN_ERROR = 'SIGN_IN_ERROR',   //we have credentials, but the login is invalid
  SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS', //we have credentials, and the login is valid
}


export enum ExternalSyncStatusType {
  NOT_RUNNING = 'NOT_RUNNING',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
}

export interface ExternalSyncStatus {
  type: ExternalSyncStatusType
}