"use strict";
/**
 * LegacyMyWellDatasource
 * Service Tests (small integration tests)
 *
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const moment = require("moment");
const chai = require("chai");
const Firestore_1 = require("../../apis/Firestore");
const LegacyMyWellDatasource_1 = require("./LegacyMyWellDatasource");
const ResourceIdType_1 = require("../../types/ResourceIdType");
const Resource_1 = require("../Resource");
const orgId = process.env.ORG_ID;
const myWellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;
describe('pullFromDataSource', function () {
    describe('getGroupData', function () {
        it.skip('saves new Group Data', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(5000);
                //Arrange
                const { lat, lng } = { lat: 34.54, lng: -115.4342 };
                const delta = 0.1;
                const legacyVillages = [
                    {
                        id: 12345,
                        name: 'Hinta',
                        postcode: 5000,
                        coordinates: { lat, lng },
                        createdAt: moment().toISOString(),
                        updatedAt: moment().toISOString(),
                    }
                ];
                const groups = LegacyMyWellDatasource_1.default.transformLegacyVillagesToGroups(orgId, legacyVillages);
                //Act
                const datasource = new LegacyMyWellDatasource_1.default(myWellLegacyBaseUrl, []);
                const result = yield datasource.saveGroups(orgId, Firestore_1.default, groups);
                //Assert
                assert.equal(1, result.results.length);
                assert.equal(0, result.warnings.length);
                assert.equal(0, result.errors.length);
            });
        });
    });
});
describe('pushDataToDataSource', function () {
    describe('saveResourcesToLegacyMyWell', function () {
        this.timeout(15000);
        const datasource = new LegacyMyWellDatasource_1.default(myWellLegacyBaseUrl, []);
        let newResources;
        let legacyResources;
        /* Create 2 resources that haven't yet been synced to LegacyMyWell */
        before(() => {
            const externalIdsA = ResourceIdType_1.default.newOWResource(223456789).serialize();
            const externalIdsB = ResourceIdType_1.default.newOWResource(223456789).serialize();
            const resourcesRef = Firestore_1.default.collection('org').doc(orgId).collection('resource');
            const resourceAJson = { "resourceType": "well", "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(), "id": "00znWgaT83RoYXYXxmvk", "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "coords": { "_latitude": 23.9172222222222, "_longitude": 73.8244444444444 }, "lastValue": 22.6, "groups": { "rhBCmtN16cABh6xSPijR": true, "jpKBA75GiZAzpA0gkBi8": true }, "updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "owner": { "name": "Khokhariya Ramabhai Sojabhai", "createdByUserId": "default" }, "orgId": "test_12345", "externalIds": externalIdsA, };
            const resourceBJson = { "resourceType": "well", "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(), "id": "00znWgaT83RoYXYXxmvk", "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "coords": { "_latitude": 23.9172222222222, "_longitude": 73.8244444444444 }, "lastValue": 22.6, "groups": { "rhBCmtN16cABh6xSPijR": true, "jpKBA75GiZAzpA0gkBi8": true }, "updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "owner": { "name": "Khokhariya Ramabhai Sojabhai", "createdByUserId": "default" }, "orgId": "test_12345", "externalIds": externalIdsB };
            const resourceA = Resource_1.Resource.deserialize(resourceAJson);
            const resourceB = Resource_1.Resource.deserialize(resourceBJson);
            return Promise.all([
                resourcesRef.add(resourceA.serialize()),
                resourcesRef.add(resourceB.serialize()),
            ]).then(() => {
                const oneYearAgo = moment().subtract(1, 'year').valueOf();
                return datasource.getNewResources(orgId, Firestore_1.default, oneYearAgo);
            }).then(_newResources => {
                newResources = _newResources;
                legacyResources = LegacyMyWellDatasource_1.default.transformResourcesToLegacyMyWell(newResources);
            });
        });
        //TODO: we need a different set of legacyResources that have the external resourceId
        it.skip('saves resources to LegacyMyWell', () => __awaiter(this, void 0, void 0, function* () {
            //Arrange
            //Act
            const result = yield datasource.saveResourcesToLegacyMyWell(legacyResources);
            console.log('result is', result);
            //Assert
            assert.equal(2, result.results.length);
            assert.equal(0, result.warnings.length);
            assert.equal(0, result.errors.length);
        }));
        it('saves new resources to LegacyMyWell and returns a list of ids', () => __awaiter(this, void 0, void 0, function* () {
            //Arrange
            //Act
            const result = yield datasource.saveNewResourcesToLegacyMyWell(newResources);
            //Assert
            chai.expect(result).to.be.an('array').that.does.not.include(null);
        }));
    });
    describe('saveReadingsToLegacyMyWell', function () {
        this.timeout(15000);
        const datasource = new LegacyMyWellDatasource_1.default(myWellLegacyBaseUrl, []);
        it('formats an error correctly', () => __awaiter(this, void 0, void 0, function* () {
            //Arrange
            const legacyReadings = [{
                    date: '2018-08-03T00:57:47.957Z',
                    value: 100,
                    villageId: 11,
                    postcode: 1234567,
                    resourceId: 1111,
                    createdAt: '2018-08-03T00:57:47.957Z',
                    updatedAt: '2018-07-03T00:57:47.957Z'
                }];
            //Act
            const result = yield datasource.saveReadingsToLegacyMyWell(legacyReadings);
            //Assert
            assert.equal(0, result.results.length);
            assert.equal(0, result.warnings.length);
            assert.equal(1, result.errors.length);
        }));
        it('saves a list of readings to LegacyMyWell', () => __awaiter(this, void 0, void 0, function* () {
            //Arrange
            const legacyReadings = [{
                    date: '2018-08-03T00:57:47.957Z',
                    value: 100,
                    villageId: 11,
                    postcode: 313603,
                    resourceId: 1111,
                    createdAt: '2018-08-03T00:57:47.957Z',
                    updatedAt: '2018-07-03T00:57:47.957Z'
                },
                {
                    date: '2018-08-03T00:57:47.957Z',
                    value: 100,
                    villageId: 11,
                    postcode: 313603,
                    resourceId: 1112,
                    createdAt: '2018-07-03T00:57:47.957Z',
                    updatedAt: '2018-06-03T00:57:47.957Z'
                }];
            //Act
            const result = yield datasource.saveReadingsToLegacyMyWell(legacyReadings);
            //Assert
            assert.equal(2, result.results.length);
            assert.equal(0, result.warnings.length);
            assert.equal(0, result.errors.length);
        }));
    });
});
//# sourceMappingURL=LegacyMyWellDatasource.service.js.map