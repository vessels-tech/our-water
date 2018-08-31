export type ExternalLoginDetails = {
  username: string,
  status: LoginStatus
}

export enum LoginStatus {
  Success,
  Error,
}