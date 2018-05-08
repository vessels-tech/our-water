"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LegacyMyWellDatasource_1 = require("./LegacyMyWellDatasource");
const DatasourceType_1 = require("../../enums/DatasourceType");
const FileDatasource_1 = require("./FileDatasource");
exports.deserializeDatasource = (ser) => {
    switch (ser.type) {
        case DatasourceType_1.DatasourceType.LegacyMyWellDatasource:
            return new LegacyMyWellDatasource_1.default(ser.baseUrl);
        case DatasourceType_1.DatasourceType.FileDatasource:
            return new FileDatasource_1.FileDatasource(ser.fileUrl, ser.dataType, ser.fileFormat, ser.options);
        default:
            throw new Error(`Tried to deserialize datasource of type: ${ser.type}`);
    }
};
//# sourceMappingURL=Datasource.js.map