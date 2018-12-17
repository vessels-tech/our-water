import { SomeResult, makeSuccess, makeError } from '../types/AppProviderTypes';
import { writeFileAsync } from '../utils';
import { zipGeoJson } from './Zip';
import * as moment from 'moment'
import { PendingResource, PendingReading } from 'ow_types';

export default class GGMNApi {

  /**
   * pendingResourceToZip
   * 
   * Converts a pending resource into a .zip containing a 
   * shapefile + .ini file.
   * 
   * @returns Promise<SomeResult<string>> the path of the zip file
   */
  public static pendingResourcesToZip(pendingResources: PendingResource[]): Promise<SomeResult<string>> {

    /*Convert PendingResource to GeoJSON*/
    const json = GGMNApi._generateGeoJSON(pendingResources);
    const options = {
      types: {
        point: 'mypoints',
        polygon: 'mypolygons',
        line: 'mylines'
      }
    };

    /*Convert GeoJSON to .zip */
    const zipped = zipGeoJson(json, options);
    const filename = `/tmp/${pendingResources[0].id}.zip`;

    /*Save to disk */
    return writeFileAsync(filename, zipped, 'utf8')
    .then(() => makeSuccess(filename))
    .catch(err => makeError<string>(err.message));
  }


  /**
   * pendingReadingstoCSV
   * 
   * Converts pending readings into a csv format for creating timeseries in GGMN.
   */
  public static pendingResourceToCSV(pendingResources: PendingResource[], pendingReadings: PendingReading[], timeseriesNames: string[]): 
    Promise<SomeResult<string>> {
    let contents;
    try {
      contents = GGMNApi._generateCSV(pendingResources, pendingReadings, timeseriesNames);
    } catch (err) {
      return Promise.resolve(makeError<string>(err));
    }
    const filename = `/tmp/${moment().unix()}.csv`;

    return writeFileAsync(filename, contents, 'utf8')
      .then(() => makeSuccess(filename))
      .catch(err => makeError<string>(err.message));
  }

  public static _generateGeoJSON(pendingResources: PendingResource[]): any {
    return {
      "type": "FeatureCollection",
      "features": pendingResources.map(pr => GGMNApi._pendingResourceToFeature(pr))
    }
  }

  public static _generateCSV(pendingResources: PendingResource[], pendingReadings: PendingReading[], timeseriesNames: string[]): any {
    //Make a set containing the resource ids, and remove duplicated
    const idSet = {}; // resourceId -> true
    pendingResources.forEach(r => idSet[r.id] = true);
    pendingReadings.forEach(r => idSet[r.resourceId] = true);

    let builder = '';
    Object.keys(idSet).forEach(k => 
      timeseriesNames.forEach(timeseriesName => 
        builder += `1970-01-01T00:00:00Z,${timeseriesName},00.00,${k}\n`
      )
    );

    return builder;
  }

  public static _pendingResourceToFeature(pendingResource: PendingResource): any {
    let name = pendingResource.id;
    let height = 0;
    //TD: this is a hack, we should specify a proper name
    if (pendingResource.owner.name) {
      name = pendingResource.owner.name;
    }

    if (pendingResource.waterColumnHeight) {
      height = pendingResource.waterColumnHeight;
    }

    return {
      "type": "Feature",
      "properties": {
        "ID_1": `${pendingResource.id}`,
        //TODO: should we enable users to add their own names?
        "NAME": `${name}`,
        "HEIGHT": height,
        "LAT": pendingResource.coords.latitude,
        "LON": pendingResource.coords.longitude,
        "2_code": `${pendingResource.id}`
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          pendingResource.coords.longitude,
          pendingResource.coords.latitude,
        ]
      }
    }
  }
}