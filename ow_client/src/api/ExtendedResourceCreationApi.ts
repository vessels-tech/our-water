import { SomeResult } from "../typings/AppProviderTypes";

export enum ExtendedResourceCreationApiType {
  None = 'None',
  Has = 'Has',
}

export type MaybeExtendedResourceCreationApi = NoneExtendedResourceCreationApi | ExtendedResourceCreationApi;

export interface NoneExtendedResourceCreationApi {
  externalServiceApiType: ExtendedResourceCreationApiType.None;
};

/**
 * ExtendedResourceCreationApi is an extension on the BaseApi
 * 
 * It currently allows for lookups to ensure that an Id is available for a new resources
 */

export default interface ExtendedResourceCreationApi {

  /**
   * checkNewId
   *
   * Checks to see if a proposed ResourceId is available
   */
  checkNewId(id: string): Promise<SomeResult<boolean>>;

}