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
        return utils_1.writeFileAsync(filename, zipped, 'utf8')
            .then(() => AppProviderTypes_1.makeSuccess(filename))
            .catch(err => AppProviderTypes_1.makeError(err.message));
    }
    /**
     * pendingReadingstoCSV
     *
     * Converts pending readings into a csv format for creating timeseries in GGMN.
     */
    static pendingResourceToCSV(pendingResources, timeseriesNames) {
        const contents = GGMNApi._generateCSV(pendingResources, timeseriesNames);
        const filename = `/tmp/${pendingResources[0].id}.csv`;
        return utils_1.writeFileAsync(filename, contents, 'utf8')
            .then(() => AppProviderTypes_1.makeSuccess(filename))
            .catch(err => AppProviderTypes_1.makeError(err.message));
    }
    static _generateGeoJSON(pendingResources) {
        return {
            "type": "FeatureCollection",
            "features": pendingResources.map(pr => GGMNApi._pendingResourceToFeature(pr))
        };
    }
    static _generateCSV(pendingResources, timeseriesNames) {
        let builder = '';
        pendingResources.forEach(r => timeseriesNames.forEach(timeseriesName => builder += `1970-01-01T00:00:00Z,${timeseriesName},00.00,${r.id}\n`));
        return builder;
    }
    static _pendingResourceToFeature(pendingResource) {
        let name = pendingResource.id;
        //TD: this is a hack, we should specify a proper name
        if (pendingResource.owner.name) {
            name = pendingResource.owner.name;
        }
        return {
            "type": "Feature",
            "properties": {
                "ID_1": `${pendingResource.id}`,
                //TODO: should we enable users to add their own names?
                "NAME": `${name}`,
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