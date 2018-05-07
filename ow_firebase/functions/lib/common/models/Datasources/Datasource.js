"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LegacyMyWellDatasource_1 = require("./LegacyMyWellDatasource");
exports.deserializeDatasource = (ser) => {
    //TODO: this is kinda crappy
    //Deserialize based on type somehow
    return new LegacyMyWellDatasource_1.default(ser.baseUrl);
};
//# sourceMappingURL=Datasource.js.map