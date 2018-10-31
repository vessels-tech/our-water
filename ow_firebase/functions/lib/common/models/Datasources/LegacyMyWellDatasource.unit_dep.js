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
require("mocha");
const assert = require("assert");
const OWGeoPoint_1 = require("../../models/OWGeoPoint");
const moment = require("moment");
const MockFirebase = require("mock-cloud-firestore");
const utils_1 = require("../../utils");
const LegacyMyWellDatasource_1 = require("./LegacyMyWellDatasource");
const ResourceIdType_1 = require("../../types/ResourceIdType");
const Reading_1 = require("../Reading");
const ResourceType_1 = require("../../enums/ResourceType");
const Resource_1 = require("../Resource");
const orgId = process.env.ORG_ID;
const myWellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;
describe('pullFromDataSource', function () {
    describe('getGroupData', function () {
        it('creates a diamond from a given LatLng', () => {
            //Arrange
            const { lat, lng } = { lat: 34.54, lng: -115.4342 };
            const delta = 0.1;
            //Act
            const coords = utils_1.createDiamondFromLatLng(lat, lng, delta);
            //Assert
            const expected = [
                new OWGeoPoint_1.default(lat - delta, lng),
                new OWGeoPoint_1.default(lat, lng + delta),
                new OWGeoPoint_1.default(lat + delta, lng),
                new OWGeoPoint_1.default(lat, lng - delta),
            ];
            assert.deepEqual(coords, expected);
        });
        it('transformsLegacyVillagesToGroups', () => {
            //Arrange
            const { lat, lng } = { lat: 34.54, lng: -115.4342 };
            const delta = 0.1;
            const legacyVillages = [
                {
                    id: 12,
                    name: 'Hinta',
                    postcode: 5000,
                    coordinates: { lat, lng },
                    createdAt: moment().toISOString(),
                    updatedAt: moment().toISOString(),
                }
            ];
            //Act
            const transformedVillages = LegacyMyWellDatasource_1.default.transformLegacyVillagesToGroups(orgId, legacyVillages);
            //Assert
            const expected = [{
                    name: 'Hinta',
                    orgId,
                    type: 'village',
                    coords: utils_1.createDiamondFromLatLng(lat, lng, delta),
                    externalIds: ResourceIdType_1.default.fromLegacyVillageId(5000, 12),
                }];
            assert.deepEqual(transformedVillages, expected);
        });
    });
});
describe('pushDataToDataSource', function () {
    describe('push resources to LegacyMyWell', function () {
        this.timeout(50000);
        const fs = new MockFirebase({}).firestore(); //Careful! We're masking the original fs
        const datasource = new LegacyMyWellDatasource_1.default(myWellLegacyBaseUrl, []);
        /* Create 2 resources that haven't yet been synced to LegacyMyWell */
        before(() => {
            const externalIdsA = ResourceIdType_1.default.newOWResource(5000).serialize();
            const externalIdsB = ResourceIdType_1.default.newOWResource(5000).serialize();
            const resourcesRef = fs.collection('org').doc(orgId).collection('resource');
            const resourceAJson = { "resourceType": "well", "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(), "id": "00znWgaT83RoYXYXxmvk", "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "coords": { "_latitude": 23.9172222222222, "_longitude": 73.8244444444444 }, "lastValue": 22.6, "groups": { "rhBCmtN16cABh6xSPijR": true, "jpKBA75GiZAzpA0gkBi8": true }, "updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "owner": { "name": "Khokhariya Ramabhai Sojabhai", "createdByUserId": "default" }, "orgId": "test_12345", "externalIds": externalIdsA, };
            const resourceBJson = { "resourceType": "well", "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(), "id": "00znWgaT83RoYXYXxmvk", "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "coords": { "_latitude": 23.9172222222222, "_longitude": 73.8244444444444 }, "lastValue": 22.6, "groups": { "rhBCmtN16cABh6xSPijR": true, "jpKBA75GiZAzpA0gkBi8": true }, "updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "owner": { "name": "Khokhariya Ramabhai Sojabhai", "createdByUserId": "default" }, "orgId": "test_12345", "externalIds": externalIdsB };
            const resourceA = Resource_1.Resource.deserialize(resourceAJson);
            const resourceB = Resource_1.Resource.deserialize(resourceBJson);
            return Promise.all([
                resourcesRef.add(resourceA.serialize()),
                resourcesRef.add(resourceB.serialize()),
            ]);
        });
        it('converts a list of SyncRunResults to a list of ids and nulls', () => {
            //Arrange
            const resultList = [
                { results: [1], warnings: [], errors: [] },
                { results: [2], warnings: [], errors: [] },
                { results: [], warnings: [], errors: ['Error saving thingo'] },
            ];
            //Act
            const result = LegacyMyWellDatasource_1.default.convertSyncRunResultsToList(resultList);
            //Assert
            const expected = [1, 2, null];
            assert.deepEqual(result, expected);
        });
        it('updateExistingResources updates resources for a list of ids', () => __awaiter(this, void 0, void 0, function* () {
            //Arrange
            const oneYearAgo = moment().subtract(1, 'year').valueOf();
            const newResources = yield datasource.getNewResources(orgId, fs, oneYearAgo);
            const ids = [1111, 1112];
            //Act
            const result = yield datasource.updateExistingResources(newResources, ids, fs);
            //Assert
            const expected = {
                results: [1111, 1112],
                warnings: [],
                errors: [],
            };
            assert.deepEqual(result, expected);
        }));
        it('updateExistingResources handles null ids', () => __awaiter(this, void 0, void 0, function* () {
            //Arrange
            const oneYearAgo = moment().subtract(1, 'year').valueOf();
            const newResources = yield datasource.getNewResources(orgId, fs, oneYearAgo);
            const ids = [1111, null];
            //Act
            const result = yield datasource.updateExistingResources(newResources, ids, fs);
            //Assert
            assert.equal(result.results.length, 1);
            assert.equal(result.warnings.length, 1);
            assert.equal(result.errors.length, 0);
        }));
    });
    describe('transformReadingsToLegacyMyWell', function () {
        it('transforms a list of Readings to LegacyMyWellReadings', () => {
            //Arrange
            const mockDate = moment('2018-08-03T00:57:47.957Z');
            const readingA = new Reading_1.Reading(orgId, 'readingA', null, ResourceType_1.ResourceType.Well, {}, mockDate.toDate(), 100, ResourceIdType_1.default.fromLegacyReadingId(123, 5000, 1110));
            const readingB = new Reading_1.Reading(orgId, 'readingB', null, ResourceType_1.ResourceType.Well, {}, mockDate.toDate(), 100, ResourceIdType_1.default.fromLegacyReadingId(124, 5000, 1112));
            readingA.id = 'readingA';
            readingB.id = 'readingB';
            readingA.createdAt = mockDate.toDate();
            readingB.createdAt = mockDate.subtract(1, 'month').toDate();
            readingA.updatedAt = mockDate.toDate();
            readingB.updatedAt = mockDate.subtract(1, 'month').toDate();
            const readings = [readingA, readingB];
            //Act
            const transformed = LegacyMyWellDatasource_1.default.transformReadingsToLegacyMyWell(readings);
            //Assert
            const expected = [{
                    date: '2018-08-03T00:57:47.957Z',
                    value: 100,
                    villageId: 11,
                    postcode: 5000,
                    resourceId: 1110,
                    createdAt: '2018-08-03T00:57:47.957Z',
                    updatedAt: '2018-07-03T00:57:47.957Z'
                },
                {
                    date: '2018-08-03T00:57:47.957Z',
                    value: 100,
                    villageId: 11,
                    postcode: 5000,
                    resourceId: 1112,
                    createdAt: '2018-07-03T00:57:47.957Z',
                    updatedAt: '2018-06-03T00:57:47.957Z'
                }];
            assert.deepEqual(expected, transformed);
        });
    });
    describe('getNewResources', function () {
        this.timeout(50000);
        const fs = new MockFirebase({}).firestore(); //Careful! We're masking the original fs
        const datasource = new LegacyMyWellDatasource_1.default(myWellLegacyBaseUrl, []);
        before(() => {
            const externalIdsA = ResourceIdType_1.default.newOWResource(5000).serialize();
            // console.log('externalIdsA', externalIdsA);
            //This one isn't new, it should be filtered out
            const externalIdsB = ResourceIdType_1.default.fromLegacyMyWellId(5000, 1111).serialize();
            const resourcesRef = fs.collection('org').doc(orgId).collection('resource');
            const resourceAJson = {
                "resourceType": "well",
                "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(),
                "id": "00znWgaT83RoYXYXxmvk",
                "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(),
                "coords": {
                    "_latitude": 23.9172222222222,
                    "_longitude": 73.8244444444444
                },
                "lastValue": 22.6,
                "groups": {
                    "rhBCmtN16cABh6xSPijR": true,
                    "jpKBA75GiZAzpA0gkBi8": true
                },
                "updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(),
                "owner": {
                    "name": "Khokhariya Ramabhai Sojabhai",
                    "createdByUserId": "default"
                },
                "orgId": "test_12345",
                "externalIds": externalIdsA,
            };
            const resourceBJson = {
                "resourceType": "well",
                "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(),
                "id": "00znWgaT83RoYXYXxmvk",
                "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(),
                "coords": {
                    "_latitude": 23.9172222222222,
                    "_longitude": 73.8244444444444
                },
                "lastValue": 22.6,
                "groups": {
                    "rhBCmtN16cABh6xSPijR": true,
                    "jpKBA75GiZAzpA0gkBi8": true
                },
                "updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(),
                "owner": {
                    "name": "Khokhariya Ramabhai Sojabhai",
                    "createdByUserId": "default"
                },
                "orgId": "test_12345",
                "externalIds": externalIdsB,
            };
            const resourceA = Resource_1.Resource.deserialize(resourceAJson);
            const resourceB = Resource_1.Resource.deserialize(resourceBJson);
            return Promise.all([
                resourcesRef.add(resourceA.serialize()),
                resourcesRef.add(resourceB.serialize()),
            ]);
        });
        it('gets the latest resources from OW', () => {
            const oneYearAgo = moment().subtract(1, 'year').valueOf();
            return datasource.getNewResources(orgId, fs, oneYearAgo)
                .then(readings => {
                assert.equal(readings.length, 1);
            });
        });
    });
    describe('getNewReadings', function () {
        this.timeout(5000);
        const fs = new MockFirebase({}).firestore(); //Careful! We're masking the original fs
        const datasource = new LegacyMyWellDatasource_1.default(myWellLegacyBaseUrl, []);
        //TODO: tidy up, make helper functions...
        before(() => {
            const readingsRef = fs.collection('org').doc(orgId).collection('reading');
            const readingA = new Reading_1.Reading(orgId, 'readingA', null, ResourceType_1.ResourceType.Well, {}, moment().toDate(), 100, ResourceIdType_1.default.fromLegacyReadingId(123, 5000, 1110));
            const readingB = new Reading_1.Reading(orgId, 'readingB', null, ResourceType_1.ResourceType.Well, {}, moment().toDate(), 100, ResourceIdType_1.default.none());
            const readingC = new Reading_1.Reading(orgId, 'readingB', null, ResourceType_1.ResourceType.Well, {}, moment().toDate(), 100, ResourceIdType_1.default.fromLegacyReadingId(124, 5000, 1112));
            readingA.id = 'readingA';
            readingB.id = 'readingB';
            readingC.id = 'readingC';
            readingA.createdAt = moment().toDate();
            readingB.createdAt = moment().subtract(1, 'month').toDate();
            readingC.createdAt = moment().subtract(2, 'year').toDate();
            readingA.updatedAt = moment().toDate();
            readingB.updatedAt = moment().subtract(1, 'month').toDate();
            readingC.updatedAt = moment().subtract(2, 'year').toDate();
            return Promise.all([
                readingsRef.add(readingA.serialize()),
                readingsRef.add(readingB.serialize()),
                readingsRef.add(readingC.serialize()),
            ]);
        });
        it('gets the latest readings from OW', () => {
            const oneYearAgo = moment().subtract(1, 'year').valueOf();
            return datasource.getNewReadings(orgId, fs, oneYearAgo)
                .then(readings => {
                assert.equal(readings.length, 1);
            });
        });
    });
});
//# sourceMappingURL=LegacyMyWellDatasource.unit_dep.js.map