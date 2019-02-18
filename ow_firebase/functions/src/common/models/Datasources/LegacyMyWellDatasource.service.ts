/**
 * LegacyMyWellDatasource
 * Service Tests (small integration tests) 
 * 
 */

import * as assert from 'assert';
import * as moment from 'moment';
import 'mocha';
import * as chai from 'chai';

// import fs from '../../apis/Firestore';
import { firestore } from '../../../test/TestFirebase';
import LegacyMyWellDatasource from './LegacyMyWellDatasource';
import LegacyVillage from '../../types/LegacyVillage';
import SyncRunResult from '../../types/SyncRunResult';
import ResourceIdType from '../../types/ResourceIdType';
import { Resource } from '../Resource';

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
      const result = await datasource.saveGroups(orgId, firestore, groups);

      //Assert
      assert.equal(1, result.results.length);
      assert.equal(0, result.warnings.length);
      assert.equal(0, result.errors.length);
    });

  });
});


//TD: reenable tests
describe.skip('pushDataToDataSource', function () {

  describe('saveResourcesToLegacyMyWell', function() {
    this.timeout(15000);
    const datasource = new LegacyMyWellDatasource(myWellLegacyBaseUrl, []);
    let newResources;
    let legacyResources;

    /* Create 2 resources that haven't yet been synced to LegacyMyWell */
    before(() => {
      const externalIdsA = ResourceIdType.newOWResource(223456789).serialize();
      const externalIdsB = ResourceIdType.newOWResource(223456789).serialize();

      const resourcesRef = firestore.collection('org').doc(orgId).collection('resource');
      const resourceAJson = { "resourceType": "well", "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(), "id": "00znWgaT83RoYXYXxmvk", "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "coords": { "_latitude": 23.9172222222222, "_longitude": 73.8244444444444 }, "lastValue": 22.6, "groups": { "rhBCmtN16cABh6xSPijR": true, "jpKBA75GiZAzpA0gkBi8": true }, "updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "owner": { "name": "Khokhariya Ramabhai Sojabhai", "createdByUserId": "default" }, "orgId": "test_12345", "externalIds": externalIdsA, };
      const resourceBJson = { "resourceType": "well", "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(), "id": "00znWgaT83RoYXYXxmvk", "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "coords": { "_latitude": 23.9172222222222, "_longitude": 73.8244444444444 }, "lastValue": 22.6, "groups": { "rhBCmtN16cABh6xSPijR": true, "jpKBA75GiZAzpA0gkBi8": true }, "updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "owner": { "name": "Khokhariya Ramabhai Sojabhai", "createdByUserId": "default" }, "orgId": "test_12345", "externalIds": externalIdsB };
      const resourceA = Resource.deserialize(resourceAJson);
      const resourceB = Resource.deserialize(resourceBJson);

      return Promise.all([
        resourcesRef.add(resourceA.serialize()),
        resourcesRef.add(resourceB.serialize()),
      ]).then(() => {
        const oneYearAgo = moment().subtract(1, 'year').valueOf();
        return datasource.getNewResources(orgId, firestore, oneYearAgo);
      }).then(_newResources => {
        newResources = _newResources;
        legacyResources = LegacyMyWellDatasource.transformResourcesToLegacyMyWell(newResources);
      });
    });

    //TODO: we need a different set of legacyResources that have the external resourceId
    it.skip('saves resources to LegacyMyWell', async () => {
      //Arrange
      //Act
      const result = await datasource.saveResourcesToLegacyMyWell(legacyResources);

      console.log('result is', result);
      
      //Assert
      assert.equal(2, result.results.length);
      assert.equal(0, result.warnings.length);
      assert.equal(0, result.errors.length);
    });

    it('saves new resources to LegacyMyWell and returns a list of ids', async () => {
      //Arrange
      //Act
      const result = await datasource.saveNewResourcesToLegacyMyWell(newResources);

      //Assert
      chai.expect(result).to.be.an('array').that.does.not.include(null);
    });
  });

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
      assert.equal(2, result.results.length);
      assert.equal(0, result.warnings.length);
      assert.equal(0, result.errors.length);
    });
  });

});