import { AnyResource } from "../typings/models/Resource";
import FBResource, { FBResourceBuilder, FBResourceType } from "../model/FBResource";
import { string } from "react-native-joi";
import { PendingTimeseries } from "../typings/models/PendingTimeseries";
import { PendingResource } from "../typings/models/PendingResource";
import { OWGeoPoint, BasicCoords, toBasicCoords } from "../typings/models/OurWater";
import { ResourceType } from "../enums";
import { OrgType } from "../typings/models/OrgType";

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

  let options = {};
  if (resource.type === OrgType.MYWELL) {
    options = {
      legacyId: '',
      owner: {name: resource.owner.name, createdByUserId: 'test1'},
      resourceType: fromCommonResourceTypeToFBResourceType(resource.resourceType),
      lastValue: resource.lastValue,
      lastReadingDatetime: resource.lastReadingDatetime,
    }
  }

  if (resource.type === OrgType.GGMN) {
    options = {
      description: resource.description,
      title: resource.title
    }
  }

  console.log("mapper options are:", options);

  return {
    orgId,
    type: resource.type,
    pending: false, 
    deleted: false, //TODO: change?
    coords,
    timeseries: {}, //TODO: figure out
    ...options
  };
}

export function fromCommonResourceTypeToFBResourceType(from: ResourceType): FBResourceType {
  switch(from) {
    case ResourceType.checkdam: return FBResourceType.Checkdam;
    case ResourceType.raingauge: return FBResourceType.Raingauge;
    case ResourceType.well: return FBResourceType.Well;
    case ResourceType.quality: return FBResourceType.Quality;
    case ResourceType.custom: return FBResourceType.Custom;
    default:
      throw new Error('Unknown resource type: ' + from);
  }
}
