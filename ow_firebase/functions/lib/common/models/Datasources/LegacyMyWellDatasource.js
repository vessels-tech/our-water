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
const moment = require("moment");
const utils_1 = require("../../utils");
const GroupType_1 = require("../../enums/GroupType");
const Resource_1 = require("../Resource");
const ResourceIdType_1 = require("../../types/ResourceIdType");
const ResourceType_1 = require("../../enums/ResourceType");
const Reading_1 = require("../Reading");
const env_1 = require("../../env");
const FileDatasourceTypes_1 = require("../../enums/FileDatasourceTypes");
const DefaultSyncRunResult_1 = require("../DefaultSyncRunResult");
const ow_types_1 = require("ow_types");
const FirebaseApi_1 = require("../../apis/FirebaseApi");
class LegacyMyWellDatasource {
    constructor(baseUrl, selectedDatatypes) {
        this.baseUrl = baseUrl;
        this.type = DatasourceType_1.DatasourceType.LegacyMyWellDatasource;
        this.selectedDatatypes = selectedDatatypes;
    }
    static transformLegacyVillagesToGroups(orgId, villages) {
        return villages.map(village => {
            const coords = utils_1.createDiamondFromLatLng(village.coordinates.lat, village.coordinates.lng, 0.1);
            const externalIds = ResourceIdType_1.default.fromLegacyVillageId(village.postcode, village.id);
            return new Group_1.Group(village.name, orgId, GroupType_1.GroupType.Village, coords, externalIds);
        });
    }
    /**
     * Iterates through pincodes and villages from MyWell datasource
     *
     * As villages have only a single point, we create our own
     * imaginary bounding box for the new group
     *
     */
    getGroupData() {
        // https://mywell-server.vessels.tech/api/villages
        //TODO proper Legacy Api Client
        const uriVillage = `${this.baseUrl}/api/villages`;
        const options = {
            method: 'GET',
            uri: uriVillage,
            json: true,
        };
        return request(options)
            .then((response) => {
            return response;
        });
    }
    saveGroups(orgId, firestore, groups) {
        const errors = [];
        const savedGroups = [];
        return Promise.all(groups.map(group => {
            return group.create({ firestore })
                .then(savedGroup => savedGroups.push(savedGroup))
                .catch(err => errors.push(err));
        })).then(() => {
            return {
                results: savedGroups,
                warnings: [],
                errors,
            };
        });
    }
    getGroupAndSave(orgId, firestore) {
        return __awaiter(this, void 0, void 0, function* () {
            const legacyVillages = yield this.getGroupData();
            const newGroups = LegacyMyWellDatasource.transformLegacyVillagesToGroups(orgId, legacyVillages);
            return yield this.saveGroups(orgId, firestore, newGroups);
        });
    }
    /**
     * Create groups based on inferred pincode data
     *
     */
    getPincodeData(orgId, firestore) {
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
                const coords = legacyVillages.map(v => new ow_types_1.OWGeoPoint(v.coordinates.lat, v.coordinates.lng));
                const externalIds = ResourceIdType_1.default.fromLegacyPincode(pincode);
                return new Group_1.Group(pincode, orgId, GroupType_1.GroupType.Pincode, coords, externalIds);
            });
            let errors = [];
            let savedGroups = [];
            pincodeGroups.forEach(group => {
                return group.create({ firestore })
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
    getResourcesData(orgId, firestore) {
        // const uriResources = `${this.baseUrl}/api/resources?filter=%7B%22where%22%3A%7B%22resourceId%22%3A1110%7D%7D`;
        const uriResources = `${this.baseUrl}/api/resources`;
        console.log("Getting resources data url", uriResources);
        const options = {
            method: 'GET',
            uri: uriResources,
            json: true,
        };
        let resources = [];
        let legacyGroups = null;
        return utils_1.getLegacyMyWellGroups(orgId, firestore)
            .then(_legacyGroups => legacyGroups = _legacyGroups)
            .then(() => request(options))
            .then((legacyRes) => {
            legacyRes.forEach(r => {
                const externalIds = ResourceIdType_1.default.fromLegacyMyWellId(r.postcode, r.id);
                const coords = new ow_types_1.OWGeoPoint(r.geo.lat, r.geo.lng);
                const resourceType = ResourceType_1.resourceTypeFromString(r.type);
                const owner = { name: r.owner, createdByUserId: 'default' };
                const groups = utils_1.findGroupMembershipsForResource(r, legacyGroups);
                //A basic timeseries map
                const timeseries = { default: { id: 'default' } };
                const newResource = new Resource_1.Resource(orgId, externalIds, coords, resourceType, owner, groups, timeseries);
                newResource.lastReadingDatetime = moment(r.last_date).toDate();
                newResource.lastValue = r.last_value;
                resources.push(newResource);
            });
            const errors = [];
            const savedResources = [];
            resources.forEach(res => {
                return res.create({ firestore })
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
    getReadingsData(orgId, firestore) {
        const uriReadings = `${this.baseUrl}/api/readings?access_token=${env_1.mywellLegacyAccessToken}`; //TODO: add filter for testing purposes
        const options = {
            method: 'GET',
            uri: uriReadings,
            json: true,
        };
        let readings = [];
        let legacyResources = null;
        let legacyGroups = null;
        let batchSaveResults = [];
        const errors = [];
        const warnings = [];
        return Promise.all([
            utils_1.getLegacyMyWellResources(orgId, firestore),
            utils_1.getLegacyMyWellGroups(orgId, firestore)
        ])
            .then(([_legacyResources, _legacyGroups]) => {
            legacyResources = _legacyResources;
            legacyGroups = _legacyGroups;
        })
            .then(() => request(options))
            .then((legacyReadings) => {
            console.log(`found ${legacyReadings.length} legacyReadings`);
            console.log("example reading is", legacyReadings[0]);
            legacyReadings.forEach(r => {
                if (typeof r.value === undefined) {
                    console.log("warning: found reading with no value", r);
                    return;
                }
                //get metadata that didn't exist on original reading
                let resource;
                try {
                    resource = utils_1.findResourceMembershipsForResource(r, legacyResources);
                }
                catch (err) {
                    warnings.push({ type: 'NoResourceMembership', message: err.message });
                    return;
                }
                const externalIds = ResourceIdType_1.default.fromLegacyReadingId(r.id, r.postcode, r.resourceId);
                const groups = utils_1.findGroupMembershipsForReading(r, legacyGroups);
                const createdAtMoment = moment(r.date);
                if (!createdAtMoment.isValid()) {
                    // console.log(`WARNING: Invalid date for created at: ${r.date}`);
                    warnings.push({ type: 'MalformedDate', message: `Invalid date for created at: ${r.date}` });
                    return;
                }
                //Only add readings from 2016 onwards
                if (createdAtMoment.isBefore(moment("2017-01-01"))) {
                    return null;
                }
                const newReading = new Reading_1.Reading(orgId, resource.id, resource.coords, resource.resourceType, groups, createdAtMoment.toDate(), r.value, externalIds);
                newReading.isLegacy = true; //set the isLegacy flag to true to skip updating the resource every time
                readings.push(newReading);
            });
            //batch save.
            const BATCH_SIZE = 500;
            const batches = utils_1.chunkArray(readings, BATCH_SIZE);
            //Save one batch at a time
            return batches.reduce((arr, curr, idx) => __awaiter(this, void 0, void 0, function* () {
                yield arr;
                return FirebaseApi_1.default.batchSave(firestore, curr)
                    .then(results => {
                    console.log(`SAVED BATCH ${idx} of ${batches.length}`);
                    batchSaveResults = batchSaveResults.concat(results);
                });
            }), Promise.resolve(true));
        })
            .then(() => {
            return {
                results: readings,
                warnings,
                errors,
            };
        })
            .catch(err => {
            console.log("getReadingsData error, ", err.message);
            return {
                results: [],
                warnings: [],
                errors: [err.message]
            };
        });
    }
    validate(orgId, firestore) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: restructure to return errors, warnings and results
            //TODO: get the api key and check that its valid
            throw new Error("validate not implemented for this data source");
        });
    }
    pullDataFromDataSource(orgId, firestore, options) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: fix this to only pull specified data
            console.log("pull from data source", this.selectedDatatypes);
            let villageGroupResult = new DefaultSyncRunResult_1.DefaultSyncRunResult();
            let pincodeGroups = new DefaultSyncRunResult_1.DefaultSyncRunResult();
            let resources = new DefaultSyncRunResult_1.DefaultSyncRunResult();
            let readings = new DefaultSyncRunResult_1.DefaultSyncRunResult();
            if (this.selectedDatatypes.indexOf(FileDatasourceTypes_1.DataType.Resource) > -1) {
                resources = yield this.getResourcesData(orgId, firestore);
            }
            if (this.selectedDatatypes.indexOf(FileDatasourceTypes_1.DataType.Reading) > -1) {
                readings = yield this.getReadingsData(orgId, firestore);
            }
            if (this.selectedDatatypes.indexOf(FileDatasourceTypes_1.DataType.Group) > -1) {
                villageGroupResult = yield this.getGroupAndSave(orgId, firestore);
                pincodeGroups = yield this.getPincodeData(orgId, firestore);
            }
            console.log("saving results");
            return utils_1.concatSaveResults([
                villageGroupResult,
                pincodeGroups,
                resources,
                readings,
            ]);
        });
    }
    /**
     * Get readings from OurWater that are eligible to be saved into LegacyMyWell
     *
     * Filters based on the following properties:
     * - createdAt: when the reading was created (not the datetime of the reading), and
     * - externalIds.hasLegacyMyWellResourceId: a boolean flag indicating that the reading
     *     has a relationship to an external data source
     */
    getNewReadings(orgId, firestore, filterAfterDate) {
        return firestore.collection('org').doc(orgId).collection('reading')
            .where('externalIds.hasLegacyMyWellResourceId', '==', true)
            .where('createdAt', '>=', filterAfterDate)
            .limit(50)
            .get()
            .then((sn) => {
            const readings = [];
            sn.forEach(doc => readings.push(Reading_1.Reading.deserialize(doc)));
            return readings;
        });
    }
    /**
     * Get resources from OurWater that are eligble to be saved into LegacyMyWell
     *
     * A NEW resource is one that:
     * - has a pincode
     * - does not have a MyWellId, a villageId or resourceId
     *
     */
    getNewResources(orgId, firestore, filterAfterDate) {
        return firestore.collection('org').doc(orgId).collection('resource')
            .where('externalIds.hasLegacyMyWellPincode', '==', true)
            .where('externalIds.hasLegacyMyWellId', '==', false)
            .where('createdAt', '>=', filterAfterDate)
            .limit(50)
            .get()
            .then(sn => utils_1.snapshotToResourceList(sn));
    }
    /* TODO: implement and use in addition to getNewResources.
    We're not too worried about updating resources at this stage
  
    public getUpdatedResources(orgId: string, firestore, filterAfterDate: number): Promise<Array<Resource>> {
      return firestore.collection('org').doc(orgId).collection('resource')
      //TODO: should we also check for isLegacy?
        .where('externalIds.hasLegacyMyWellId', '==', true)
        .where('createdAt', '>=', filterAfterDate)
        .limit(50).get()
        .then(sn => {
          const resources: Array<Resource> = [];
          sn.forEach(doc => resources.push(Resource.fromDoc(doc)));
          return resources;
        });
    }
    */
    static transformReadingsToLegacyMyWell(readings) {
        return readings.map(reading => {
            return {
                date: moment(reading.datetime).toISOString(),
                value: reading.value,
                villageId: reading.externalIds.getVillageId(),
                postcode: reading.externalIds.getPostcode(),
                resourceId: reading.externalIds.getResourceId(),
                createdAt: moment(reading.createdAt).toISOString(),
                updatedAt: moment(reading.updatedAt).toISOString(),
            };
        });
    }
    static transformResourcesToLegacyMyWell(resources) {
        return resources.map(resource => {
            return {
                postcode: resource.externalIds.getPostcode(),
                geo: {
                    lat: resource.coords.latitude,
                    lng: resource.coords.longitude,
                },
                last_value: resource.lastValue,
                //TODO: this may cause problems...
                last_date: moment(resource.lastReadingDatetime).toISOString(),
                owner: resource.owner.name,
                type: resource.resourceType,
                createdAt: moment(resource.createdAt).toISOString(),
                updatedAt: moment(resource.updatedAt).toISOString(),
                villageId: resource.externalIds.getVillageId(),
            };
        });
    }
    saveReadingsToLegacyMyWell(readings) {
        //TODO: Eventually make this a proper, mockable web client
        const uriReadings = `${this.baseUrl}/api/readings?access_token=${env_1.mywellLegacyAccessToken}`; //TODO: add filter for testing purposes
        const options = {
            method: 'POST',
            uri: uriReadings,
            json: true,
            body: readings
        };
        return request(options)
            .then((res) => {
            const results = res.map(resource => resource.id);
            return {
                results,
                warnings: [],
                errors: [],
            };
        })
            .catch(err => utils_1.resultWithError(err.message));
    }
    /**
     * Convert a list of SyncRunResults containing only one item each into a list of
     * nulls and ids
     */
    static convertSyncRunResultsToList(results) {
        return results.map(result => result.results[0] ? result.results[0] : null);
    }
    /**
     * Save New resources to LegacyMyWell.
     *
     * Saves them one at a time, and when the resources are saved, gets the resourceId and updates the
     * External IDs on the OW side.
     *
     */
    saveNewResourcesToLegacyMyWell(resources) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: enforce a resonable limit here?
            const legacyResources = yield LegacyMyWellDatasource.transformResourcesToLegacyMyWell(resources);
            return Promise.all(legacyResources.map(resource => {
                //If this dies, it will return a SyncRunResult with one error, and end up as a null below
                return this.saveResourcesToLegacyMyWell([resource]);
            }))
                .then((results) => LegacyMyWellDatasource.convertSyncRunResultsToList(results));
        });
    }
    /**
     * Given a list of ids or nulls, and a list of OW Resources, update the OW Resources to have
     * the correct external ids
     *
     * //TODO: we assume that they will be in the same order. TODO: check this assumption!
     */
    updateExistingResources(resources, ids, firestore) {
        return __awaiter(this, void 0, void 0, function* () {
            //Iterate through the newIds, and update OW resources to match
            return ids.reduce((acc, curr, idx) => __awaiter(this, void 0, void 0, function* () {
                const result = yield acc;
                const owResource = resources[idx];
                if (curr === null) {
                    result.warnings.push(`Failed to save resource with id:${owResource.id}.`);
                    return Promise.resolve(result);
                }
                const pincode = owResource.externalIds.getPostcode();
                owResource.externalIds = ResourceIdType_1.default.fromLegacyMyWellId(pincode, curr);
                return owResource.save({ firestore })
                    .then(() => result.results.push(curr))
                    .catch((err) => result.errors.push(err.message))
                    .then(() => result);
            }), Promise.resolve(new DefaultSyncRunResult_1.DefaultSyncRunResult()));
        });
    }
    /**
     * Save a number of resources in bulk.
     *
     * Use for updating a number of resources at a time. Don't use for creating new resources that don't have Ids yet.
     */
    saveResourcesToLegacyMyWell(resources) {
        //TODO: Eventually make this a proper, mockable web client
        const uriReadings = `${this.baseUrl}/api/resources?access_token=${env_1.mywellLegacyAccessToken}`; //TODO: add filter for testing purposes
        const options = {
            method: 'POST',
            uri: uriReadings,
            json: true,
            body: resources
        };
        return request(options)
            .then((res) => {
            const results = res.map(resource => resource.id);
            return {
                results,
                warnings: [],
                errors: [],
            };
        })
            .catch(err => {
            console.log("ERROR saveResourcesToLegacyMyWell", err.message);
            return utils_1.resultWithError(err.message);
        });
    }
    pushDataToDataSource(orgId, firestore, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let villageGroupResult = new DefaultSyncRunResult_1.DefaultSyncRunResult();
            let pincodeGroupResult = new DefaultSyncRunResult_1.DefaultSyncRunResult();
            let resourceResult = new DefaultSyncRunResult_1.DefaultSyncRunResult();
            let readingResult = new DefaultSyncRunResult_1.DefaultSyncRunResult();
            this.selectedDatatypes.forEach((datatypeStr) => __awaiter(this, void 0, void 0, function* () {
                // await this.selectedDatatypes.forEach(async datatypeStr => {
                switch (datatypeStr) {
                    case FileDatasourceTypes_1.DataType.Reading:
                        const readings = yield this.getNewReadings(orgId, firestore, options.filterAfterDate);
                        console.log(`pushDataToDataSource, found ${readings.length} new/updated readings`);
                        const legacyReadings = yield LegacyMyWellDatasource.transformReadingsToLegacyMyWell(readings);
                        readingResult = yield this.saveReadingsToLegacyMyWell(legacyReadings);
                        break;
                    case FileDatasourceTypes_1.DataType.Resource:
                        const newResources = yield this.getNewResources(orgId, firestore, options.filterAfterDate);
                        console.log(`pushDataToDataSource, found ${newResources.length} new resources`);
                        const ids = yield this.saveNewResourcesToLegacyMyWell(newResources);
                        resourceResult = yield this.updateExistingResources(newResources, ids, firestore);
                        break;
                    // case DataType.Group:
                    //   //TODO: Implement for both pincodes and villages? For now only pincodes
                    //   const groups: Array<Group> = await this.getPincodeGroups(orgId, firestore, options.filterAfterDate);
                    //   console.log(`pushDataToDataSource, found ${groups.length} new/updated pincode groups`);
                    //   const legacyPincodes: Array<LegacyPincode>
                    // break;
                    default:
                        throw new Error(`pullDataFromDataSource not implemented for DataType: ${datatypeStr}`);
                }
                return true;
            }));
            return utils_1.concatSaveResults([
                villageGroupResult,
                pincodeGroupResult,
                resourceResult,
                readingResult
            ]);
        });
    }
    serialize() {
        return {
            baseUrl: this.baseUrl,
            type: this.type.toString(),
            selectedDatatypes: this.selectedDatatypes
        };
    }
}
exports.default = LegacyMyWellDatasource;
//# sourceMappingURL=LegacyMyWellDatasource.js.map