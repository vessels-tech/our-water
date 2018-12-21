import { Reading } from "../src/common/models/Reading";
import * as moment from 'moment';
import ResourceIdType from "../src/common/types/ResourceIdType";

export function readingHeading(): String {
  return `id,resourceId,value,datetime,lat,lng\n`;
  // return `id,resourceId,value,datetime,lat,lng,legacyMyWellPincode,legacyMyWellId,\n`;
}

export function readingToCSV(reading: Reading): String {
  //reading.datetime comes in as a Timestamp from Firebase, needs to be converted accordingly
  // @ts-ignore
  const isoDate = moment(reading.datetime._seconds*1000).toISOString();

  if (!reading.externalIds) {
    return `${reading.id},${reading.resourceId},${reading.value},${isoDate},${reading.coords.latitude},${reading.coords.longitude},unknown,unknown\n`;
  }

  const externalIds = ResourceIdType.deserialize(reading.externalIds);
  return `${reading.id},${reading.resourceId},${reading.value},${isoDate},${reading.coords.latitude},${reading.coords.longitude},${externalIds.getPostcode()},${externalIds.getResourceId()}\n`;
}