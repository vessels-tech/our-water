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
const Datasource_1 = require("./Datasource");
const DatasourceType_1 = require("../enums/DatasourceType");
class LegacyMyWellDatasource extends Datasource_1.ApiDatasource {
    constructor(baseUrl) {
        super(baseUrl);
        this.type = DatasourceType_1.DatasourceType.LegacyMyWellDatasource;
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
        return [];
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
        return [];
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
        return [];
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
        console.log("Implementation not required. MyWell Data source is readonly for now.");
        return true;
    }
}
exports.default = LegacyMyWellDatasource;
//# sourceMappingURL=LegacyMyWellDatasource.js.map