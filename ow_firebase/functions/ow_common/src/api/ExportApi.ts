import { Reading } from "../model";
import { isNullOrUndefined } from "util";
import { Maybe, safeGetNested, isDefined } from "../utils";
import { ReadingApi } from "./ReadingApi";


export enum ExportFormat {
  TSV='TSV',
  CSV='CSV',
}

/**
 * Saftely get a key from the resource
 */
function safeGet(key: string, reading: Reading): string {

  // TODO: handle nested values
  //@ts-ignore
  let value: any = reading[key];
  if (isNullOrUndefined(value)) {
    return "";
  }

  return `${value}`;
}

export class ExportApi {

  /**
   * exportReadingImages
   * 
   * Export a set of images attached to a reading as an array of base64 strings
   */
  public static exportReadingImages(readings: Reading[]): Array<{ id: string, base64: string }> {
    const readingImages: Array<{ id: string, base64: string }> = [];

    readings.forEach(r => {
      const image: Maybe<{ base64Image: string }> = safeGetNested(r, ['image']);
      if (isDefined(image)) {
        readingImages.push({
          //TODO: timezones may make this buggy, and make hashed ids maligned
          id: ReadingApi.hashReadingId(r.resourceId, r.timeseriesId, new Date(r.datetime)),
          base64: image.base64Image
        });
      }
    });

    return readingImages;
  }

  /**
   * readingsToExport
   * 
   * Format a set of readings for a given export format
   */
  public static readingsToExport(readings: Reading[], format: ExportFormat): string {
    return readings.reduce((acc, curr) => acc + this.formatReading(curr, format) + '\n','')
  }

  public static formatReading(reading: Reading, format: ExportFormat): string {
    let separator = ",";
    if (format === ExportFormat.TSV) {
      separator = '\t';
    }

    const eligibleKeys: Array<{id: string, accessor: (id: string) => string}> = [
      {id: 'id', accessor: (id: string) => safeGet(id, reading) }, 

      //Handle legacy timestamps from Firestore
      {id: 'datetime', accessor: (id: string) => {
        //@ts-ignore
        let dateRaw: any = reading[id];
        if (isNullOrUndefined(dateRaw)) {
          return "";
        }

        // @ts-ignore
        if (dateRaw.toDate) {
          // @ts-ignore
          const jsDate: Date = dateRaw.toDate();
          return jsDate.toISOString()
        }

        return dateRaw;
      }}, 
      {id: 'resourceId', accessor: (id: string) => safeGet(id, reading) }, 
      {id: 'resourceType', accessor: (id: string) => safeGet(id, reading) }, 
      {id: 'timeseriesId', accessor: (id: string) => safeGet(id, reading) }, 
      {id: 'value', accessor: (id: string) => safeGet(id, reading) }, 

      //Mywell fields:
      { id: 'image', accessor: (id: string) => safeGet(id, reading) }, 
      { id: 'location', accessor: (id: string) => safeGet(id, reading) }, 
    ];

    const formatted = eligibleKeys.reduce((acc, curr) => {
      return acc + curr.accessor(curr.id) + separator;
    }, '');

    return formatted;
  }



}