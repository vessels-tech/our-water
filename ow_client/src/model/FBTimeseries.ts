import { AnyTimeseries, GGMNTimeseries, MyWellTimeseries } from "../typings/models/Timeseries";
import { OrgType } from "../typings/models/OrgType";

/**
 * FBTimeseries isn't a full class implementation, just a bunch of types
 */


/*a time series in the Firebase Domain */
export type FBTimeseriesMap = {
  [index: string]: FBTimeseries,
}

export type FBTimeseries = {
  type: OrgType,
  id: string, //Id must be unique for a resource
  /*TODO: add other fields here */
}

/**
 * Map from a FBTimeseries to AnyTimeseries
 */
export function toAnyTimeseriesList(fbTimeseriesMap: FBTimeseriesMap): AnyTimeseries[] {
  return Object.keys(fbTimeseriesMap).map(k => toAnyTimeseries(fbTimeseriesMap[k]));
}

//TODO: figure out how to get readings in here!
export function toAnyTimeseries(fbTimeseries: FBTimeseries): AnyTimeseries {
  switch(fbTimeseries.type) {
    case OrgType.GGMN: {
      const ts: GGMNTimeseries = {
        type: OrgType.GGMN,

        /* Common values*/
        id: fbTimeseries.id,
        name: fbTimeseries.id,
        readings: [],
        parameter: 'parameter',
        /* Platform Specific */
        firstReadingDateString: 'none'
      }
      return ts;
    }
    case OrgType.MYWELL: {
      const ts: MyWellTimeseries = {
        type: OrgType.MYWELL,

        /* Common values*/
        id: fbTimeseries.id,
        name: fbTimeseries.id,
        readings: [],
        parameter: 'parameter',
      }
      return ts;
    }
    default:
      throw new Error(`Couldn't map timeseries for orgType: ${fbTimeseries.type}`);
  }
}