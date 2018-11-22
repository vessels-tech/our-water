import { SomeResult } from "../typings/AppProviderTypes";
import { RNFirebase } from 'react-native-firebase';
import { FullUser } from "../typings/api/FirebaseApi";


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
  verifyCodeAndLogin(confirmResult: RNFirebase.ConfirmationResult, code: string): Promise<SomeResult<FullUser>>


}