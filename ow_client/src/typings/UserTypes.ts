

export type MaybeUser = User | NoUser | MobileUser;

export enum UserStatus {
  Approved = 'Approved',
  Unapproved = 'Unapproved',
  Rejected = 'Rejected',
}

export type User = {
  type: UserType.USER,
  userId: string,
  token: string,
}

/* A user who has signed in with their phone number */
export type MobileUser = {
  type: UserType.MOBILE_USER,
  userId: string,
  token: string,
  mobile: string,
}

export type NoUser = {
  type: UserType.NO_USER,
}

export enum UserType {
  NO_USER = 'NO_USER',
  USER = 'USER',
  MOBILE_USER = 'MOBILE_USER',
}