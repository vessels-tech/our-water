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
const DatasourceType_1 = require("../enums/DatasourceType");
const request = require("request-promise-native");
const Group_1 = require("./Group");
const utils_1 = require("../utils");
const GroupType_1 = require("../enums/GroupType");
class LegacyMyWellDatasource {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.type = DatasourceType_1.DatasourceType.LegacyMyWellDatasource;
    }
    /**
     * Iterates through pincodes and villages from MyWell datasource
     *
     * As villages don't have
     *
     */
    getGroupData(orgId, fs) {
        // https://mywell-server.vessels.tech/api/villages
        const uriVillage = `${this.baseUrl}/api/villages`;
        const options = {
            method: 'GET',
            uri: uriVillage,
            json: true,
        };
        return request(options)
            .then((villages) => {
            //TODO: save using bulk method
            const newGroups = villages.map(village => {
                const coords = utils_1.createDiamondFromLatLng(village.coordinates.lat, village.coordinates.lat, 0.1);
                return new Group_1.Group(village.name, orgId, GroupType_1.GroupType.Village, coords);
            });
            const errors = [];
            const savedGroups = [];
            newGroups.forEach(group => {
                return group.create({ fs })
                    .then(savedGroup => {
                    savedGroups.push(savedGroup);
                })
                    .catch(err => {
                    console.log('error saving new group', err);
                    errors.push(err);
                });
            });
            return savedGroups;
        });
        //TODO: get pincodes by inferring from above villages. Draw coords from centre of each village
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
        //define new group relationships somehow (this will be tricky)
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
    pullDataFromDataSource(orgId, fs) {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = yield this.getGroupData(orgId, fs);
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
    serialize() {
        return {
            baseUrl: this.baseUrl,
            type: this.type.toString(),
        };
    }
}
exports.default = LegacyMyWellDatasource;
//# sourceMappingURL=LegacyMyWellDatasource.js.map