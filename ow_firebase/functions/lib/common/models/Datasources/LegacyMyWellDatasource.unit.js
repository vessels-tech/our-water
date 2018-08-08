"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const OWGeoPoint_1 = require("../../models/OWGeoPoint");
const moment = require("moment");
const MockFirebase = require("mock-cloud-firestore");
const utils_1 = require("../../utils");
const LegacyMyWellDatasource_1 = require("./LegacyMyWellDatasource");
const ResourceIdType_1 = require("../../types/ResourceIdType");
const Reading_1 = require("../Reading");
const ResourceType_1 = require("../../enums/ResourceType");
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
                    id: 12345,
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
                    externalIds: {
                        legacyMyWellId: '5000.12345',
                    },
                }];
            assert.deepEqual(transformedVillages, expected);
        });
    });
});
describe('pushDataToDataSource', function () {
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
//# sourceMappingURL=LegacyMyWellDatasource.unit.js.map