import { AnyResource } from "../typings/models/Resource";
import FBResource, { FBResourceBuilder, FBResourceType } from "../model/FBResource";
import { string } from "react-native-joi";
import { PendingTimeseries } from "../typings/models/PendingTimeseries";
import { PendingResource } from "../typings/models/PendingResource";
import { OWGeoPoint, BasicCoords, toBasicCoords } from "../typings/models/OurWater";
import { ResourceType } from "../enums";
import { OrgType } from "../typings/models/OrgType";
import { AnyReading } from "../typings/models/Reading";
import { PendingReading } from "../typings/models/PendingReading";
import FBReading, { CommonReadingBuilder, MyWellReadingBuilder, GGMNReadingBuilder } from "../model/FBReading";
import { FBTimeseries, FBTimeseriesMap } from "../model/FBTimeseries";
import { AnyTimeseries } from "../typings/models/Timeseries";

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

  return {
    orgId,
    type: resource.type,
    pending: false, 
    deleted: false, //TODO: change?
    coords,
    timeseries: fromCommonTimeseriesToFBTimeseries(resource.type, resource.timeseries),
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

export function fromCommonTimeseriesToFBTimeseries(type: OrgType, from: Array<AnyTimeseries | PendingTimeseries>): FBTimeseriesMap {
  let map: FBTimeseriesMap = {};

  //TODO: handle pending timeseries better than this
  from.forEach(t => map[t.name] = { type, id: t.name});
  return map;
}

export function fromCommonReadingToFBReadingBuilder(orgId: string, userId: string, reading: AnyReading | PendingReading): CommonReadingBuilder & MyWellReadingBuilder & GGMNReadingBuilder {

  const common: CommonReadingBuilder = {
    orgId,
    type: reading.type,
    pending: false,
    deleted: false,
    resourceId: reading.resourceId,
    timeseriesId: reading.timeseriesId,
    date: reading.date,
    value: reading.value,
  }

  let options: MyWellReadingBuilder | GGMNReadingBuilder;
  if (reading.type === OrgType.MYWELL) {
    options = {
      userId,
      image: reading.image,
      location: reading.location,
    }
  } else {
    options = {
      groundwaterStationId: reading.groundwaterStationId,
    };
  }

  return {
    ...common,
    ...options,
  };
}