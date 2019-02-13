/**
 * FirebaseUserApi.ts
 * 
 * A platform specific API for interacting with the firebase users and 
 * authentication
 * 
 */

import firebase, { Firebase, RNFirebase } from 'react-native-firebase';

import {
  maybeLog
} from '../utils';

import { SomeResult, ResultType, makeSuccess, makeError } from '../typings/AppProviderTypes';
import { AnonymousUser, FullUser } from '../typings/api/FirebaseApi';

const auth = firebase.auth();

class FirebaseUserApi {

  /**
   * Sign in anonymously to firebase and get the user's Id token
   * 
   * Can't be moved into common
   */
  static async signIn(): Promise<SomeResult<AnonymousUser>> {
    let userId: string;

    return auth.signInAnonymouslyAndRetrieveData()
      .then(userCredential => {
        userId = userCredential.user.uid;
        return userCredential.user.getIdToken();
      })
      .then(token => makeSuccess<AnonymousUser>({ userId, token }))
      .catch(err => makeError<AnonymousUser>('Error logging in: ' + err.message))
  }

  /**
   * Get the JWT token of the user
   * 
   * Can't be moved into common
   */
  static async getIdToken(): Promise<SomeResult<string>> {
    return auth.getIdToken()
      .then((token: string) => makeSuccess(token))
      .catch((err: Error) => makeError(err.message))
  }


  /**
   * Send the code to the given user.
   * 
   * Can't be moved into common
   */
  static async sendVerifyCode(mobile: string): Promise<SomeResult<RNFirebase.ConfirmationResult>> {
    return auth.signInWithPhoneNumber(mobile)
      .then(confirmResult => makeSuccess(confirmResult))
      .catch(err => makeError<RNFirebase.ConfirmationResult>(err.message));
  }

  /**
   * Verify the code and get the access token.
   * 
   * Can't be moved into common
   */
  static async verifyCodeAndLogin(orgId: string, confirmResult: RNFirebase.ConfirmationResult, code: string, oldUserId: string): Promise<SomeResult<FullUser>> {
    let anonymousCredential: RNFirebase.UserCredential;
    let user: RNFirebase.User;
    let mobile: string;

    return confirmResult.confirm(code)
      .then(_user => {
        if (!_user) {
          return Promise.reject(new Error('No user found'));
        }
        user = _user;
        if (!user.phoneNumber) {
          return Promise.reject(new Error('User logged in, but no phone number found'));
        }

        //Save the user's phone number!
        mobile = user.phoneNumber;
        //TODO: call the common update user.
        return this.userDoc(orgId, user.uid).set({ mobile }, { merge: true });
      })
      //TODO: call the common merge users
      .then(() => this.mergeUsers(orgId, oldUserId, user.uid))
      .then(mergeResult => {
        if (mergeResult.type === ResultType.ERROR) {
          maybeLog("Non fatal error merging users:", mergeResult.message)
        }

        return user.getIdToken();
      })
      .then(token => makeSuccess<FullUser>({ userId: user.uid, token, mobile }))
      .catch((err: Error) => {
        maybeLog("ERROR", err);
        return makeError<FullUser>(err.message)
      });
  }

  static async logout(orgId: string): Promise<SomeResult<any>> {
    return auth.signOut()
      .then(() => this.signIn())
      .catch((err: Error) => makeError<void>(err.message));
  }

  /**
   * Authenticaion Callback
   * 
   * Can't be moved into common
   */
  static onAuthStateChanged(listener: (user: RNFirebase.User) => void): () => void {
    return auth.onAuthStateChanged(listener);
  }

}

export default FirebaseUserApi;