import { AnyTimeseries, GGMNTimeseries, MyWellTimeseries } from "../typings/models/Timeseries";
import { OrgType } from "../typings/models/OrgType";
import { maybeLog } from "../utils";

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
  console.log("toAnyTimeseries, inbound:", fbTimeseries);
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
        //TD: WTF???
        //Must've been drunk when writing this originally
        //Once again, this calls for a types overhaul
        id: fbTimeseries.name,
        name: fbTimeseries.name,
        readings: [],
        parameter: fbTimeseries.parameter,
      }
      return ts;
    }
    default:
      maybeLog("WARNING: Found old timeseries type. This a lurking bug.");
      //TD: this is lazy implicit handling
      //Handle the old timeseries type
      const ts: MyWellTimeseries = {
        type: OrgType.MYWELL,
        id: 'default',
        name: 'default',
        readings: [],
        parameter: 'default',
      };
      return ts;
      // throw new Error(`Couldn't map timeseries for orgType: ${fbTimeseries.type}`);
  }
}