import { SomeResult } from "../typings/AppProviderTypes";

export enum ExtendedResourceApiType {
  None = 'None',
  Has = 'Has',
}

export type MaybeExtendedResourceApi = NoneExtendedResourceApi | ExtendedResourceApi;

export interface NoneExtendedResourceApi {
  extendedResourceApiType: ExtendedResourceApiType.None;
};

/**
 * ExtendedResourceApi is an extension on the BaseApi
 * 
 * It currently allows for lookups to ensure that an Id is available for a new resources
 */

export default interface ExtendedResourceApi {
  extendedResourceApiType: ExtendedResourceApiType.Has; 

  /**
   * checkNewId
   *
   * Checks to see if a proposed ResourceId is available
   */
  checkNewId(id: string): Promise<SomeResult<boolean>>;

}