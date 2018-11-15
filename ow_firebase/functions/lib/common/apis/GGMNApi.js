"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppProviderTypes_1 = require("../types/AppProviderTypes");
const utils_1 = require("../utils");
const Zip_1 = require("./Zip");
class GGMNApi {
    /**
     * pendingResourceToZip
     *
     * Converts a pending resource into a .zip containing a
     * shapefile + .ini file.
     *
     * @returns Promise<SomeResult<string>> the path of the zip file
     */
    static pendingResourcesToZip(pendingResources) {
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
        const zipped = Zip_1.zipGeoJson(json, options);
        const filename = `/tmp/${pendingResources[0].id}.zip`;
        /*Save to disk */
        return utils_1.writeFileAsync(filename, zipped)
            .then(() => AppProviderTypes_1.makeSuccess(filename))
            .catch(err => AppProviderTypes_1.makeError(err.message));
    }
    static _generateGeoJSON(pendingResources) {
        return {
            "type": "FeatureCollection",
            "features": pendingResources.map(pr => GGMNApi._pendingResourceToFeature(pr))
        };
    }
    static _pendingResourceToFeature(pendingResource) {
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
        };
    }
}
exports.default = GGMNApi;
//# sourceMappingURL=GGMNApi.js.map