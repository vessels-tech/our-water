export type AnonymousUser = {
  userId: string,
  token: string, //jwt token
}

export type FullUser = {
  userId: string,
  token: string,
  mobile: string,
}