import { SomeResult } from "../typings/AppProviderTypes";
import { OWUser } from "../typings/models/OurWater";

export default interface UserApi {

  /**
   * Get the user object
   */
  getUser(userId: string): Promise<SomeResult<OWUser>>;
}