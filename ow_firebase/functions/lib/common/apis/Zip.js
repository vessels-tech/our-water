"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geojson = require('shp-write/src/geojson');
const prj = require('shp-write/src/prj');
const write = require('shp-write/src/write');
const JSZip = require('jszip');
function zipGeoJson(geoJson, options) {
    var zip = new JSZip();
    [geojson.point(geoJson), geojson.line(geoJson), geojson.polygon(geoJson)]
        .forEach(function (l) {
        if (l.geometries.length && l.geometries[0].length) {
            write(
            // field definitions
            l.properties, 
            // geometry type
            l.type, 
            // geometries
            l.geometries, function (err, files) {
                var fileName = options && options.types[l.type.toLowerCase()] ? options.types[l.type.toLowerCase()] : l.type;
                zip.file(fileName + '.shp', files.shp.buffer, { binary: true });
                zip.file(fileName + '.shx', files.shx.buffer, { binary: true });
                zip.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
                zip.file(fileName + '.prj', prj);
            });
        }
    });
    //Add the .ini file
    const iniContents = `[general]
asset_name = GroundwaterStation
nested_asset = Filter

[columns]
code = ID_1
name = NAME
surface_level = HEIGHT

[defaults]
scale = 1

[nested]
first = 2_code
fields = [code]`;
    zip.file("myshapes.ini", iniContents);
    var generateOptions = {
        compression: 'STORE',
        type: 'nodebuffer',
    };
    return zip.generate(generateOptions);
}
exports.zipGeoJson = zipGeoJson;
;
//# sourceMappingURL=Zip.js.map