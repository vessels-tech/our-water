"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LegacyMyWellDatasource_1 = require("./LegacyMyWellDatasource");
exports.deserializeDatasource = (ser) => {
    //TODO: this is kinda crappy
    //Deserialize based on type somehow
    return new LegacyMyWellDatasource_1.default(ser.baseUrl);
};
class ApiDatasource {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    pullDataFromDataSource() {
        return null;
    }
    pushDataToDataSource() {
        return null;
    }
    serialize() {
        return {
            type: this.type.toString(),
            baseUrl: this.baseUrl,
        };
    }
}
exports.ApiDatasource = ApiDatasource;
//# sourceMappingURL=Datasource.js.map