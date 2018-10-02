import { EmptyLoginDetails, LoginDetails, AnyLoginDetails } from "../typings/api/ExternalServiceApi";
import { SomeResult } from "../typings/AppProviderTypes";
import { GGMNOrganisation, KeychainLoginDetails } from "../typings/models/GGMN";

export default interface ExternalServiceApi {

  /**
   * Connect to an external service.
   * 
   * Can provide a preferred external Organisation if needed
   */
  connectToService(username: string, password: string, externalOrg?: GGMNOrganisation): Promise<AnyLoginDetails>;

  /**
   * Save the external service details locally.
   * 
   */
  saveExternalServiceLoginDetails(details: KeychainLoginDetails, password: string): Promise<any>;

  /**
   * Get the external service login details, and attempt to log in.
   * If the login fails, ExternalLoginDetails.LoginStatus will be Error, but won't throw
   * 
   * If we can't get or decode the details, this will Throw
   */
  getExternalServiceLoginDetails(): Promise<AnyLoginDetails>;

  /**
   * Force us to remove the login details
   */
  forgetExternalServiceLoginDetails(): Promise<any>;


  /**
   * Get all of the external organisations for this external service
   */
  getExternalOrganisations(): Promise<SomeResult<GGMNOrganisation[]>>;


  /**
   * Select an organisation
   */
  selectExternalOrganisation(organisation: GGMNOrganisation): Promise<SomeResult<void>>;

}