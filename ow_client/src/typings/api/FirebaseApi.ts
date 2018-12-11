
/**
 * This represents the User we get back from the Firebase Api, 
 * not the user object we store in firestore.
 */


export type AnonymousUser = {
  userId: string,
  token: string, //jwt token
}

export type FullUser = {
  userId: string,
  token: string,
  mobile: string,
}