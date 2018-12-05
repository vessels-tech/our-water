import { GGMNOrganisation } from '../models/GGMN'; 
import { SomeResult } from '../AppProviderTypes';
import { AnyResource } from '../models/Resource';
import { CacheType } from '../../reducers';

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
  COMPLETE = 'COMPLETE',
  NOT_RUNNING = 'NOT_RUNNING',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
}

export type AnyExternalSyncStatus = ExternalSyncStatusComplete | ExternalSyncStatusRunning;

export type ExternalSyncStatusComplete = {
  status: ExternalSyncStatusType.COMPLETE,
  pendingResourcesResults: CacheType<SomeResult<AnyResource>>,
  pendingReadingsResults: CacheType<SomeResult<any>>,
}

export type ExternalSyncStatusRunning = { 
  status: ExternalSyncStatusType.RUNNING,
}

export enum SyncError {
  StationNotCreated = 'StationNotCreated',
  GetTimeseriesIdTransport = 'GetTimeseriesIdTransport',
  GetTimeseriesIdNone = 'GetTimeseriesIdNone',
  GetTimeseriesIdTooMany = 'GetTimeseriesIdTooMany',
  GetTimeseriesIdNoTimeseries = 'GetTimeseriesIdNoTimeseries',
  SaveReadingNotLoggedIn = 'SaveReadingNotLoggedIn',
  GenericTransport = 'GenericTransport',
  SaveReadingUnknown = 'SaveReadingUnknown',
  DeletePendingReading = 'DeletePendingReading',
}