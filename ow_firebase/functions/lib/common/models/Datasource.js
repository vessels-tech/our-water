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
var DatasourceType;
(function (DatasourceType) {
    DatasourceType["ApiDatasource"] = "ApiDatasource";
    DatasourceType["LegacyMyWellDatasource"] = "LegacyMyWellDatasource";
})(DatasourceType || (DatasourceType = {}));
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
class LegacyMyWellDatasource extends ApiDatasource {
    constructor(baseUrl) {
        super(baseUrl);
        this.type = DatasourceType.LegacyMyWellDatasource;
    }
    /**
     * Iterates through pincodes and villages from MyWell datasource
     *
     * As villages don't have
     *
     */
    getGroupData() {
        const uriVillage = `${this.baseUrl}/villages`;
        //Get villages using simple get request
        //convert villages into groups
        //return groups
        //TODO: I'm not sure how we will get pincodes. Perhaps they need to be manual for now
    }
    /**
     * get all resources from MyWell
     *
     * This doesn't require pagination, so we won't bother implementing it yet.
     * convert legacy MyWell resources into OW resources
     * return
     */
    getResourcesData() {
        const uriResources = `${this.baseUrl}/resources`;
        //GET resources
        //convert legacy MyWell resources into OW resources
        //return
    }
    /**
     * Get all readings from MyWell
     *
     * This also doesn't require pagination
     *
     */
    getReadingsData() {
        //GET readings
        //convert legacy MyWell Readings to OW readings
        //return
    }
    pullDataFromDataSource() {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = yield this.getGroupData();
            const resources = yield this.getResourcesData();
            const readings = yield this.getReadingsData();
            return {
                groups,
                resources,
                readings
            };
        });
    }
    pushDataToDataSource() {
        console.error("Implementation not required. MyWell Data source is readonly for now.");
    }
}
exports.LegacyMyWellDatasource = LegacyMyWellDatasource;
//# sourceMappingURL=Datasource.js.map