import { ExternalLoginDetails } from "../typings/api/ExternalServiceApi";

export default interface ExternalServiceApi {

  /**
   * Connect to an external service.
   * 
   */
  connectToService(username: string, password: string): Promise<any>;

  /**
   * Save the external service details to firebase, securely
   * 
   * Optional implementation
   */
  saveExternalServiceLoginDetails(): Promise<any>;

  //TODO: make this return the username, as well as the status
  //TODO: throw an error if we can't get the details back
  //TODO: what about if we have the details, but the login fails?
  getExternalServiceLoginDetails(): Promise<ExternalLoginDetails>;

}