"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatasourceType_1 = require("../../enums/DatasourceType");
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
    constructor(fileUrl, dataType, options) {
        this.type = DatasourceType_1.DatasourceType.FileDatasource;
        this.fileUrl = fileUrl;
        this.dataType = dataType;
    }
    pullDataFromDataSource(orgId, fs) {
        //download the file to local
        //deserialize based on some settings
        return null;
    }
    pushDataToDataSource() {
        return null;
    }
    serialize() {
        return {
            fileUrl: this.fileUrl,
            dataType: this.dataType,
            type: this.type.toString(),
        };
    }
}
exports.FileDatasource = FileDatasource;
//# sourceMappingURL=FileDatasource.js.map