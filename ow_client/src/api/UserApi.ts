import { SomeResult } from "../typings/AppProviderTypes";
import { OWUser } from "../typings/models/OurWater";
import { TranslationEnum } from "ow_translations/Types";

export default interface UserApi {

  /**
   * Get the user object
   */
  getUser(userId: string): Promise<SomeResult<OWUser>>;


  /**
   * Change the user's translation
   */
  changeTranslation(userId: string, translation: TranslationEnum): Promise<SomeResult<void>>;

}