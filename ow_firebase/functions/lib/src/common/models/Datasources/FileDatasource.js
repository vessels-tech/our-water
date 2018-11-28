"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatasourceType_1 = require("../../enums/DatasourceType");
const FileDatasourceTypes_1 = require("../../enums/FileDatasourceTypes");
const utils_1 = require("../../utils");
const Reading_1 = require("../Reading");
const moment = require("moment");
const ResourceIdType_1 = require("../../types/ResourceIdType");
const FirebaseApi_1 = require("../../apis/FirebaseApi");
const parseDateForgivingly = (dateStr) => {
    let date;
    date = moment(dateStr, ['YYYY/MM/DD', 'DD/MM/YYYY']);
    if (!date.isValid()) {
        // if (!format) {
        //   return parseDateForgivingly(dateStr, 'DD/MM/YYYY');
        // }
        return null;
    }
    return date;
};
/**
 * Defines a datasource which parses information from a file
 * for now, we will implement readings only, but eventually
 * we may want to subclass this and specialize further or something
 *
 * When a user defines this class, they will put in a file location, as well
 * as a type of file - e.g. readings, resource or group. We will implement readings first
 * The user can also put in settings, such as file type (csv, xlsx), and separator type (comma, tab)
 * and whether or not is uses legacyMyWellIds or ourwater ids
 *
 * In order to check the format of the file, user can run the sync with a validateOnly option
 *
 */
class FileDatasource {
    constructor(fileUrl, dataType, fileFormat, options) {
        this.type = DatasourceType_1.DatasourceType.FileDatasource;
        this.fileUrl = fileUrl;
        this.dataType = dataType;
        this.fileFormat = fileFormat;
        this.options = options;
    }
    convertReadingsAndMap(orgId, rows, dataType, resources, options) {
        switch (dataType) {
            case FileDatasourceTypes_1.DataType.Reading:
                if (!options.usesLegacyMyWellIds) {
                    throw new Error('only legacy readings implemented for the Reading DataType');
                }
                return rows.map((row, idx) => {
                    if (options.includesHeadings && idx === 0) {
                        return null;
                    }
                    //TODO: support other row orders
                    let [dateStr, pincode, legacyResourceId, valueStr] = row;
                    if (utils_1.isNullOrEmpty(dateStr) ||
                        utils_1.isNullOrEmpty(pincode) ||
                        utils_1.isNullOrEmpty(legacyResourceId) ||
                        utils_1.isNullOrEmpty(valueStr)) {
                        // console.log("Found row with missing data:", row);
                        return null;
                    }
                    const date = parseDateForgivingly(dateStr);
                    if (!date) {
                        console.log("Row has invalid date:", row, dateStr);
                        return null;
                    }
                    const legacyId = `${pincode}.${legacyResourceId}`;
                    const resource = resources.get(legacyId);
                    if (!resource) {
                        console.log("No resource found for legacyId:", legacyId);
                        return null;
                    }
                    // let resourceId: string;
                    // let coords: OWGeoPoint;
                    const resourceType = utils_1.resourceTypeForLegacyResourceId(legacyResourceId);
                    const newReading = Reading_1.Reading.legacyReading(orgId, resource.id, resource.coords, resourceType, date.toDate(), Number(valueStr), ResourceIdType_1.default.fromLegacyReadingId(null, pincode, legacyResourceId));
                    return newReading;
                });
            case FileDatasourceTypes_1.DataType.Group:
            case FileDatasourceTypes_1.DataType.Resource:
            default:
                throw new Error('ConvertRowsToModels not yet implemented for these DataTypes');
        }
    }
    validate(orgId, fs) {
        //Download the file to local
        //parse and don't save
        let legacyResources;
        //TODO: return this
        return utils_1.getLegacyMyWellResources(orgId, fs)
            .then(_legacyResources => legacyResources = _legacyResources)
            .then(() => utils_1.downloadAndParseCSV(this.fileUrl))
            .then(rows => this.convertReadingsAndMap(orgId, rows, this.dataType, legacyResources, this.options))
            .then(modelsAndNulls => {
            const models = modelsAndNulls.filter(model => model !== null);
            const nulls = modelsAndNulls.filter(model => model === null);
            const result = {
                results: [`Validated ${models.length} readings.`],
                warnings: [`A total of ${nulls.length} readings were invalid or missing data, and filtered out.`],
                errors: []
            };
            return result;
        })
            .catch(err => {
            return {
                results: [],
                warnings: [],
                errors: [err]
            };
        });
    }
    /**
     *
     * download the file to local
     * deserialize based on some settings
     * if no errors,
     *   Save the rows in a batch job
     *   run a batch job which adds group and resource metadata to readings
     */
    pullDataFromDataSource(orgId, fs) {
        let result = {
            results: [],
            warnings: [],
            errors: []
        };
        let legacyResources;
        let batchSaveResults = [];
        return utils_1.getLegacyMyWellResources(orgId, fs)
            .then(_legacyResources => legacyResources = _legacyResources)
            .then(() => utils_1.downloadAndParseCSV(this.fileUrl))
            .then(rows => this.convertReadingsAndMap(orgId, rows, this.dataType, legacyResources, this.options))
            .then(modelsAndNulls => {
            const models = modelsAndNulls.filter(model => model !== null);
            const nulls = modelsAndNulls.filter(model => model === null);
            result.results = [`Validated ${models.length} readings.`];
            result.warnings = [`A total of ${nulls.length} readings were invalid or missing data, and filtered out.`];
            //batch save.
            const BATCH_SIZE = 250;
            const batches = utils_1.chunkArray(models, BATCH_SIZE);
            //Save one batch at a time
            return batches.reduce((arr, curr) => __awaiter(this, void 0, void 0, function* () {
                yield arr;
                return FirebaseApi_1.default.batchSave(fs, curr).then(results => batchSaveResults = batchSaveResults.concat(results));
            }), Promise.resolve(true));
        })
            .then(() => {
            const totalSaved = batchSaveResults.length;
            result.results.push(`Batch saved a total of of ${totalSaved} readings.`);
            return result;
        })
            .catch((err) => {
            console.log('pullDataFromDataSource error: ', err.message);
            return Promise.reject(err);
        });
    }
    pushDataToDataSource() {
        throw new Error("not implemented for this datasource");
    }
    serialize() {
        return {
            fileUrl: this.fileUrl,
            dataType: this.dataType,
            options: this.options.serialize(),
            type: this.type.toString(),
        };
    }
}
exports.FileDatasource = FileDatasource;
//# sourceMappingURL=FileDatasource.js.map