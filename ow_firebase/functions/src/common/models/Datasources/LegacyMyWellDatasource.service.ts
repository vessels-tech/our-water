/**
 * LegacyMyWellDatasource
 * Service Tests (small integration tests) 
 * 
 */

import * as assert from 'assert';
import * as moment from 'moment';

import fs from '../../apis/Firestore';
import LegacyMyWellDatasource from './LegacyMyWellDatasource';
import LegacyVillage from '../../types/LegacyVillage';

const orgId = process.env.ORG_ID;
const myWellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;

describe('pullFromDataSource', function () {

  describe('getGroupData', function () {
    it.skip('saves new Group Data', async function () {
      this.timeout(5000);

      //Arrange
      const { lat, lng } = { lat: 34.54, lng: -115.4342 };
      const delta = 0.1;
      const legacyVillages: Array<LegacyVillage> = [
        {
          id: 12345,
          name: 'Hinta',
          postcode: 5000,
          coordinates: { lat, lng },
          createdAt: moment().toISOString(),
          updatedAt: moment().toISOString(),
        }
      ];
      const groups = LegacyMyWellDatasource.transformLegacyVillagesToGroups(orgId, legacyVillages);

      //Act
      const datasource = new LegacyMyWellDatasource(myWellLegacyBaseUrl, []);
      const result = await datasource.saveGroups(orgId, fs, groups);

      //Assert
      assert.equal(1, result.results.length);
      assert.equal(0, result.warnings.length);
      assert.equal(0, result.errors.length);
    });

  });
});


describe('pushDataToDataSource', function () {

  describe('saveReadingsToLegacyMyWell', function () {
    this.timeout(15000);
    const datasource = new LegacyMyWellDatasource(myWellLegacyBaseUrl, []);

    it('formats an error correctly', async () => {
      //Arrange
      const legacyReadings = [{
        date: '2018-08-03T00:57:47.957Z',
        value: 100,
        villageId: 11,
        postcode: 1234567, //postcode doesn't exist
        resourceId: 1111,
        createdAt: '2018-08-03T00:57:47.957Z',
        updatedAt: '2018-07-03T00:57:47.957Z'
      }];

      //Act
      const result = await datasource.saveReadingsToLegacyMyWell(legacyReadings);

      //Assert
      assert.equal(0, result.results.length);
      assert.equal(0, result.warnings.length);
      assert.equal(1, result.errors.length);
    });

    it('saves a list of readings to LegacyMyWell', async () => {
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
      const result = await datasource.saveReadingsToLegacyMyWell(legacyReadings);

      //Assert
      const expected = {
        results: [],
        warnings: [],
        errors: []
      };
      assert.equal(2, result.results.length);
      assert.equal(0, result.warnings.length);
      assert.equal(0, result.errors.length);
    });
  });

});