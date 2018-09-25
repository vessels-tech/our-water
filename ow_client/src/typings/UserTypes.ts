

export type MaybeUser = User | NoUser;

export type User = {
  type: UserType.USER,
  userId: string,
}

export type NoUser = {
  type: UserType.NO_USER,
}


export enum UserType {
  NO_USER = 'NO_USER',
  USER = 'USER'
}