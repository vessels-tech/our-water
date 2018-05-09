"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatasourceType_1 = require("../../enums/DatasourceType");
const FileDatasourceTypes_1 = require("../../enums/FileDatasourceTypes");
const utils_1 = require("../../utils");
const Reading_1 = require("../Reading");
const moment = require("moment");
const ResourceIdType_1 = require("../../types/ResourceIdType");
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
    //TODO: move elsewhere
    convertRowsToModels(orgId, rows, dataType, options) {
        switch (dataType) {
            case FileDatasourceTypes_1.DataType.Reading:
                if (!options.usesLegacyMyWellIds) {
                    throw new Error('only legacy readings implemented for the Reading DataType');
                }
                return rows.map((row, idx) => {
                    if (options.includesHeadings && idx === 0) {
                        return null;
                    }
                    //TODO: support other formats
                    let [dateStr, pincode, legacyResourceId, valueStr] = row;
                    console.log("row is: ", row);
                    console.log(dateStr, pincode, legacyResourceId, valueStr);
                    if (utils_1.isNullOrEmpty(dateStr) ||
                        utils_1.isNullOrEmpty(pincode) ||
                        utils_1.isNullOrEmpty(legacyResourceId) ||
                        utils_1.isNullOrEmpty(valueStr)) {
                        console.log("Found row with missing data:", row);
                        return null;
                    }
                    const resourceType = utils_1.resourceTypeForLegacyResourceId(legacyResourceId);
                    const newReading = Reading_1.Reading.legacyReading(orgId, resourceType, moment(dateStr).toDate(), Number(valueStr), ResourceIdType_1.default.fromLegacyReadingId(null, pincode, legacyResourceId));
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
        //TODO: return this
        return utils_1.downloadAndParseCSV(this.fileUrl)
            .then(rows => this.convertRowsToModels(orgId, rows, this.dataType, this.options))
            .then(modelsAndNulls => {
            console.log('models and nulls', modelsAndNulls);
            const models = modelsAndNulls.filter(model => model !== null);
            const nulls = modelsAndNulls.filter(model => model === null);
            const result = {
                results: [`Validated ${models.length} readings.`],
                warnings: [`A total of ${nulls.length} readings were invalid, and filtered out.`],
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
    pullDataFromDataSource(orgId, fs) {
        //download the file to local
        //deserialize based on some settings
        //if no errors, 
        //  Save the rows in a batch job
        //  run a batch job which adds group and resource metadata to readings
        const result = {
            results: [],
            warnings: [],
            errors: []
        };
        return Promise.resolve(result);
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