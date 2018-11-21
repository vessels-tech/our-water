import { AnyResource } from "../typings/models/Resource";
import FBResource, { FBResourceBuilder, ResourceType } from "../model/FBResource";
import { string } from "react-native-joi";
import { PendingTimeseries } from "../typings/models/PendingTimeseries";
import { PendingResource } from "../typings/models/PendingResource";
import { OWGeoPoint, BasicCoords } from "../typings/models/OurWater";

// export function mapper<T,J>(from: T): J {

//   if (from)  

// }


/**
 * Map from the common resource object into one ready to be saved in firebase
 * 
 * //TODO: figure out how google did this nicely here:
 * https://github.com/firebase/firebase-js-sdk/blob/master/packages/firestore/src/remote/serializer.ts#L397
 */
export function fromCommonResourceToFBResoureBuilder(orgId: string, resource: AnyResource | PendingResource): FBResourceBuilder {
  let coords: BasicCoords;
  if (resource.pending) {
    coords = {
      latitude: resource.coords.latitude,
      longitude: resource.coords.longitude
    }
  } else {
    coords = {
      latitude: resource.coords._latitude,
      longitude: resource.coords._longitude,
    }
  }

  return {
    orgId,
    //TODO: figure this out
    externalIds: {},
    coords,

    //TODO: fix these fields
    resourceType: ResourceType.Well,
    owner: { name: 'test', createdByUserId: 'test user id'},
    groups: new Map<string, boolean>(),
    timeseries: {},
  };
}

export function fromFBResourceToCommonResource(fbResource: FBResource): AnyResource {
  //TODO: figure out how to make sure we map to a GGMN Resource or MyWell Resource based on the FBResource

  
}

