import { PendingResource } from 'ow_types/PendingResource';
import { SomeResult, makeSuccess, makeError } from '../types/AppProviderTypes';
import { writeFileAsync } from '../utils';

const zip = require('./ShapeWrite/zip')

export default class GGMNApi {

  /**
   * pendingResourceToZip
   * 
   * Converts a pending resource into a .zip containing a 
   * shapefile + .ini file.
   * 
   * @returns Promise<SomeResult<string>> the path of the zip file
   */
  public static pendingResourceToZip(pendingResources: PendingResource[]): Promise<SomeResult<string>> {

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
    const zipped = zip(json, options);
    const filename = `/tmp/${pendingResources[0].id}.zip`;

    /*Save to disk */
    return writeFileAsync(filename, zipped)
    .then(() => makeSuccess(filename))
    .catch(err => makeError<string>(err.message));
  }

  public static _generateGeoJSON(pendingResources: PendingResource[]): any {
    return {
      "type": "FeatureCollection",
      "features": pendingResources.map(pr => GGMNApi._pendingResourceToFeature(pr))
    }
  }

  public static _pendingResourceToFeature(pendingResource: PendingResource): any {
    return {
      "type": "Feature",
      "properties": {
        "ID_1": `${pendingResource.id}`,
        //TODO: should we enable users to add their own names?
        "NAME": `${pendingResource.id}`,
        "HEIGHT": 0,
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