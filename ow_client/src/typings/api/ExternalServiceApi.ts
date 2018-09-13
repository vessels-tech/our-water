export enum LoginDetailsType {
  EMPTY,
  FULL,
}


export interface EmptyLoginDetails {
  type: LoginDetailsType.EMPTY,
  status: ConnectionStatus.NO_CREDENTIALS,
}

export interface LoginDetails {
  type: LoginDetailsType.FULL,
  status: ConnectionStatus.SIGN_IN_ERROR | ConnectionStatus.SIGN_IN_SUCCESS,
  username: string,
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
  NO_CREDENTIALS,
  SIGN_IN_ERROR,   //we have credentials, but the login is invalid
  SIGN_IN_SUCCESS, //we have credentials, and the login is valid
}