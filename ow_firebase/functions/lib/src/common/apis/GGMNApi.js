"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppProviderTypes_1 = require("../types/AppProviderTypes");
const utils_1 = require("../utils");
const Zip_1 = require("./Zip");
const moment = require("moment");
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
    static pendingResourceToCSV(pendingResources, pendingReadings, timeseriesNames) {
        let contents;
        try {
            contents = GGMNApi._generateCSV(pendingResources, pendingReadings, timeseriesNames);
        }
        catch (err) {
            return Promise.resolve(AppProviderTypes_1.makeError(err));
        }
        const filename = `/tmp/${moment().unix()}.csv`;
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
    static _generateCSV(pendingResources, pendingReadings, timeseriesNames) {
        //Make a set containing the resource ids, and remove duplicated
        const idSet = {}; // resourceId -> true
        pendingResources.forEach(r => idSet[r.id] = true);
        pendingReadings.forEach(r => idSet[r.resourceId] = true);
        let builder = '';
        Object.keys(idSet).forEach(k => timeseriesNames.forEach(timeseriesName => builder += `2017-01-01T01:11:01Z,${timeseriesName},00.00,${k}\n`));
        return builder;
    }
    static _pendingResourceToFeature(pendingResource) {
        let name = pendingResource.id;
        let height = 0;
        //TD: this is a hack, we should specify a proper name
        if (pendingResource.name) {
            name = pendingResource.name;
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
        };
    }
}
exports.default = GGMNApi;
//# sourceMappingURL=GGMNApi.js.map