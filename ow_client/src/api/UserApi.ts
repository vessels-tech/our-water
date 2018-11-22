import { SomeResult } from "../typings/AppProviderTypes";
import { OWUser } from "../typings/models/OurWater";
import { TranslationEnum } from "ow_translations";
import { RNFirebase } from "react-native-firebase";

export default interface UserApi {

  /**
   * Get the user object
   */
  getUser(userId: string): Promise<SomeResult<OWUser>>;


  /**
   * Change the user's translation
   */
  changeTranslation(userId: string, translation: TranslationEnum): Promise<SomeResult<void>>;


  /**
   * Subscribe to a user object, and listen for any changes
   */
  subscribeToUser(userId: string, callback: (user: OWUser) => void): () => void;


  /**
   * subscribe to auth changes
   * 
   * Returns an unsubscribe object
   */
  onAuthStateChanged(listener: (user: RNFirebase.User) => void): () => void;


}