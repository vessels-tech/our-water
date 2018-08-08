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
const Firestore_1 = require("../../apis/Firestore");
const LegacyMyWellDatasource_1 = require("./LegacyMyWellDatasource");
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
            const expected = {
                results: [],
                warnings: [],
                errors: []
            };
            assert.equal(2, result.results.length);
            assert.equal(0, result.warnings.length);
            assert.equal(0, result.errors.length);
        }));
    });
});
//# sourceMappingURL=LegacyMyWellDatasource.service.js.map