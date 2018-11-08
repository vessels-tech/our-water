import { EmptyLoginDetails, LoginDetails, AnyLoginDetails, ExternalSyncStatus } from "../typings/api/ExternalServiceApi";
import { SomeResult } from "../typings/AppProviderTypes";
import { GGMNOrganisation, KeychainLoginDetails } from "../typings/models/GGMN";
import { PendingResource } from "../typings/models/PendingResource";
import { PendingReading } from "../typings/models/OurWater";

export enum ExternalServiceApiType {
  None='None',
  Has='Has',
}

export type MaybeExternalServiceApi = NoneExternalServiceApi | ExternalServiceApi;

export interface NoneExternalServiceApi {
  externalServiceApiType: ExternalServiceApiType.None;
};

export default interface ExternalServiceApi {
  externalServiceApiType: ExternalServiceApiType.Has;

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


  /**
   * GetEmail
   * 
   * Get user email address from GGMN username
   * 
   * User must be logged in.
   * GGMN only
   */
  getEmail(username: string): Promise<SomeResult<string>>;

  /**
   * Send Resource Email
   * GGMN only
   */
  sendResourceEmail(email: string, pendingResources: PendingResource[]): Promise<SomeResult<void>>;


  /**
   * StartExternalSync
   * 
   * Sync the locally saved resources and readings with the external service
   * User must be logged in
   */
  runExternalSync(userId: string, pendingResources: PendingResource[], pendingReadings: PendingReading[]): Promise<SomeResult<ExternalSyncStatus>>;
}