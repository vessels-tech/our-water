import { EmptyLoginDetails, LoginDetails } from "../typings/api/ExternalServiceApi";
import { SomeResult } from "../typings/AppProviderTypes";

export default interface ExternalServiceApi {

  /**
   * Connect to an external service.
   * 
   */
  connectToService(username: string, password: string): Promise<LoginDetails | EmptyLoginDetails>;

  /**
   * Save the external service details locally.
   * 
   */
  saveExternalServiceLoginDetails(username: string, password: string): Promise<any>;

  /**
   * Get the external service login details, and attempt to log in.
   * If the login fails, ExternalLoginDetails.LoginStatus will be Error, but won't throw
   * 
   * If we can't get or decode the details, this will Throw
   */
  getExternalServiceLoginDetails(): Promise<LoginDetails | EmptyLoginDetails>;

  /**
   * Force us to remove the login details
   */
  forgetExternalServiceLoginDetails(): Promise<any>;

}