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
import DeprecatedFirebaseApi from './DeprecatedFirebaseApi';
import { UserApi } from 'ow_common/lib/api/UserApi';

const auth = firebase.auth();
const fs = firebase.firestore();


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
    let currentUser = auth.currentUser;
    if (!currentUser) {
      return makeError<string>("There is no currentlylogged in user");
    }

    return currentUser.getIdToken()
      .then((token: string) => makeSuccess(token))
      .catch((err: Error) => makeError<string>(err.message))
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

    //@ts-ignore - common firestore
    const commonUserApi = new UserApi(fs, orgId);

    return confirmResult.confirm(code)
      .then(async _user => {
        if (!_user) {
          return Promise.reject(new Error('No user found'));
        }
        user = _user;
        if (!user.phoneNumber) {
          return Promise.reject(new Error('User logged in, but no phone number found'));
        }

        console.log(user);
        (async () => {
          try {
            console.log('trying really hard')
            const userRef = await this.userDoc(orgId, user.uid).get();
            const details: any = userRef.data();

            if (!details) {
              return;
            }

            if (!details.status || details.status.toLowerCase() === 'unapproved') {
              const doc = fs.collection('org').doc(orgId);
              await doc.set({metadata: { newSignUps: { [user.uid]: true}}}, {merge: true});
              console.log('Updated newUserSignups')
            }
            
          console.log('lambda')
          } catch (e) {
            console.log('lambda threw exception')
            console.log(e);
          }
        })()

        //Save the user's phone number!
        mobile = user.phoneNumber;
        //TODO: call the common update user.
        return this.userDoc(orgId, user.uid).set({ mobile }, { merge: true });
      })
      .then(() => commonUserApi.mergeUsers(oldUserId, user.uid))
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


  static userDoc(orgId: string, userId: string) {
    return fs.collection('org').doc(orgId).collection('user').doc(userId)
  }
}

export default FirebaseUserApi;
