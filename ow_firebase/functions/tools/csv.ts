import { Reading } from "../src/common/models/Reading";
import * as moment from 'moment';

export function readingHeading(): String {
  return `id,resourceId,value,datetime\n`;
}

export function readingToCSV(reading: Reading): String {
  //reading.datetime comes in as a Timestamp from Firebase, needs to be converted accordingly
  // @ts-ignore
  const isoDate = moment(reading.datetime._seconds*1000).toISOString();

  return `${reading.id},${reading.resourceId},${reading.value},${isoDate}\n`;
}