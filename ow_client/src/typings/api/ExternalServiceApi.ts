export type ExternalLoginDetails = {
  username: string,
  status: LoginStatus
}

export enum LoginStatus {
  Success,
  Error,
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