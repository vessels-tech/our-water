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
const request = require("request-promise-native");
const Group_1 = require("../Group");
const firestore_1 = require("@google-cloud/firestore");
const moment = require("moment");
const utils_1 = require("../../utils");
const GroupType_1 = require("../../enums/GroupType");
const Resource_1 = require("../Resource");
const ResourceIdType_1 = require("../../types/ResourceIdType");
const ResourceType_1 = require("../../enums/ResourceType");
const Reading_1 = require("../Reading");
const env_1 = require("../../env");
class LegacyMyWellDatasource {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.type = DatasourceType_1.DatasourceType.LegacyMyWellDatasource;
    }
    /**
     * Iterates through pincodes and villages from MyWell datasource
     *
     * As villages have only a single point, we create our own
     * imaginary bounding box for the new group
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
                const externalIds = ResourceIdType_1.default.fromLegacyVillageId(village.postcode, village.id);
                return new Group_1.Group(village.name, orgId, GroupType_1.GroupType.Village, coords, externalIds);
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
            return {
                results: savedGroups,
                warnings: [],
                errors,
            };
        });
        //TODO: get pincodes by inferring from above villages. Draw coords from centre of each village
    }
    /**
     * Create groups based on inferred pincode data
     *
     */
    getPincodeData(orgId, fs) {
        //Get all villages, and for each village within a pincode, create a bounding box based on the center
        const uriVillage = `${this.baseUrl}/api/villages`;
        const options = {
            method: 'GET',
            uri: uriVillage,
            json: true,
        };
        let pincodeGroups = null;
        const pincodeIds = {};
        return request(options)
            .then((villages) => {
            //group the villages by id
            villages.forEach(v => {
                let groupList = pincodeIds[v.postcode];
                if (!groupList) {
                    groupList = [];
                }
                groupList.push(v);
                pincodeIds[v.postcode] = groupList;
            });
            //Now go through each pincode group, and create a single group
            pincodeGroups = Object.keys(pincodeIds).map(pincode => {
                const legacyVillages = pincodeIds[pincode];
                //TODO: the only issue with this approach is that the coordinates aren't in order.
                const coords = legacyVillages.map(v => new firestore_1.GeoPoint(v.coordinates.lat, v.coordinates.lng));
                const externalIds = ResourceIdType_1.default.fromLegacyPincode(pincode);
                return new Group_1.Group(pincode, orgId, GroupType_1.GroupType.Pincode, coords, externalIds);
            });
            let errors = [];
            let savedGroups = [];
            pincodeGroups.forEach(group => {
                return group.create({ fs })
                    .then(savedGroup => savedGroups.push(savedGroup))
                    .catch(err => {
                    console.log("err", err);
                    errors.push(err);
                });
            });
            return {
                results: pincodeGroups,
                warnings: [],
                errors,
            };
        });
    }
    /**
     * get all resources from MyWell
     *
     * This doesn't require pagination, so we won't bother implementing it yet.
     * convert legacy MyWell resources into OW resources
     * return
     */
    getResourcesData(orgId, fs) {
        const uriResources = `${this.baseUrl}/api/resources?filter=%7B%22where%22%3A%7B%22resourceId%22%3A1110%7D%7D`;
        // const uriResources = `${this.baseUrl}/api/resources`;
        const options = {
            method: 'GET',
            uri: uriResources,
            json: true,
        };
        let resources = [];
        let legacyGroups = null;
        return utils_1.getLegacyMyWellGroups(orgId, fs)
            .then(_legacyGroups => legacyGroups = _legacyGroups)
            .then(() => request(options))
            .then((legacyRes) => {
            legacyRes.forEach(r => {
                const externalIds = ResourceIdType_1.default.fromLegacyMyWellId(r.postcode, r.id);
                const coords = new firestore_1.GeoPoint(r.geo.lat, r.geo.lng);
                const resourceType = ResourceType_1.resourceTypeFromString(r.type);
                const owner = { name: r.owner, createdByUserId: 'default' };
                const groups = utils_1.findGroupMembershipsForResource(r, legacyGroups);
                const newResource = new Resource_1.Resource(orgId, externalIds, coords, resourceType, owner, groups);
                newResource.lastReadingDatetime = moment(r.last_date).toDate();
                newResource.lastValue = r.last_value;
                resources.push(newResource);
            });
            let errors = [];
            let savedResources = [];
            resources.forEach(res => {
                return res.create({ fs })
                    .then((savedRes) => savedResources.push(savedRes))
                    .catch(err => errors.push(err));
            });
            return {
                results: savedResources,
                warnings: [],
                errors,
            };
        });
    }
    /**
     * Get all readings from MyWell
     *
     * This also doesn't require pagination, but is expensive.
     * Perhaps we should test with just a small number of readings for now
     *
     */
    getReadingsData(orgId, fs) {
        const uriReadings = `${this.baseUrl}/api/readings?filter=%7B%22where%22%3A%7B%22resourceId%22%3A1110%7D%7D&access_token=${env_1.mywellLegacyAccessToken}`; //TODO: add filter for testing purposes
        // const uriReadings = `${this.baseUrl}/api/resources`;
        const options = {
            method: 'GET',
            uri: uriReadings,
            json: true,
        };
        let readings = [];
        let legacyResources = null;
        let legacyGroups = null;
        //TODO: load a map of all saved resources, where key is the legacyId (pincode.resourceId)
        //This will enable us to easily map
        //We also need to have the groups first
        return Promise.all([
            utils_1.getLegacyMyWellResources(orgId, fs),
            utils_1.getLegacyMyWellGroups(orgId, fs)
        ])
            .then(([_legacyResources, _legacyGroups]) => {
            legacyResources = _legacyResources;
            legacyGroups = _legacyGroups;
        })
            .then(() => request(options))
            .then((legacyReadings) => {
            legacyReadings.forEach(r => {
                if (typeof r.value === undefined) {
                    console.log("warning: found reading with no value", r);
                    return;
                }
                //get metadata that didn't exist on original reading
                const resource = utils_1.findResourceMembershipsForResource(r, legacyResources);
                const externalIds = ResourceIdType_1.default.fromLegacyReadingId(r.id, r.postcode, r.resourceId);
                const groups = utils_1.findGroupMembershipsForReading(r, legacyGroups);
                const newReading = new Reading_1.Reading(orgId, resource.id, resource.coords, resource.resourceType, groups, moment(r.createdAt).toDate(), r.value, externalIds);
                newReading.isLegacy = true; //set the isLegacy flag to true to skip updating the resource every time
                readings.push(newReading);
            });
            let errors = [];
            let savedReadings = [];
            readings.forEach(res => {
                return res.create({ fs })
                    .then((savedRes) => savedReadings.push(savedRes))
                    .catch(err => errors.push(err));
            });
            return {
                results: savedReadings,
                warnings: [],
                errors,
            };
        })
            //Catch fatal errors here
            .catch(err => {
            console.log("getReadingsData error, ", err.message);
            return {
                results: [],
                warnings: [],
                errors: [err.message]
            };
        });
    }
    validate(orgId, fs) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: restructure to return errors, warnings and results
            throw new Error("validate not implemented for this data source");
        });
    }
    pullDataFromDataSource(orgId, fs) {
        return __awaiter(this, void 0, void 0, function* () {
            const villageGroupResult = yield this.getGroupData(orgId, fs);
            const pincodeGroups = yield this.getPincodeData(orgId, fs);
            const resources = yield this.getResourcesData(orgId, fs);
            const readings = yield this.getReadingsData(orgId, fs);
            return utils_1.concatSaveResults([
                villageGroupResult,
                pincodeGroups,
                resources,
                readings,
            ]);
        });
    }
    pushDataToDataSource() {
        console.log("Implementation not required. MyWell Data source is readonly for now.");
        const result = {
            results: [],
            warnings: [],
            errors: []
        };
        return Promise.resolve(result);
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