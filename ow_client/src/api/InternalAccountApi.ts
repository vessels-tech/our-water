import { SomeResult } from "../typings/AppProviderTypes";
import { RNFirebase } from 'react-native-firebase';
import { FullUser } from "../typings/api/FirebaseApi";

export type SaveUserDetailsType = {
  name: string | null,
  nickname: string | null,
  email: string | null,
}

export enum InternalAccountApiType {
  None = 'None',
  Has = 'Has',
}

export type MaybeInternalAccountApi = NoneInternalAccountApi | InternalAccountApi;

export interface NoneInternalAccountApi {
  internalAccountApiType: InternalAccountApiType.None;
};

export default interface InternalAccountApi {
  internalAccountApiType: InternalAccountApiType.Has;


  sendVerifyCode(mobile: string): Promise<SomeResult<RNFirebase.ConfirmationResult>>
  verifyCodeAndLogin(confirmResult: RNFirebase.ConfirmationResult, code: string, oldUserId: string): Promise<SomeResult<FullUser>>

  /**
   * SaveUserDetails
   * 
   * Add some extra user details
   */
  saveUserDetails(userId: string, userDetails: SaveUserDetailsType): Promise<SomeResult<void>>;

  /**
   * Log the user out
   * Will then perform a login to the anonymous account
   */
  logout(): Promise<SomeResult<any>>;


}