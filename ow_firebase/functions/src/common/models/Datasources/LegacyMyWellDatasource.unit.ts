import * as assert from 'assert';
import OWGeoPoint from '../../models/OWGeoPoint';
import * as moment from 'moment';

import fs from '../../apis/Firestore';
import * as MockFirebase from 'mock-cloud-firestore';
import { createDiamondFromLatLng } from '../../utils';
import LegacyMyWellDatasource from './LegacyMyWellDatasource';
import LegacyVillage from '../../types/LegacyVillage';
import ResourceIdType from '../../types/ResourceIdType';
import { Reading } from '../Reading';
import { ResourceType } from '../../enums/ResourceType';
import { Resource } from '../Resource';
import SyncRunResult from '../../types/SyncRunResult';

const orgId = process.env.ORG_ID;
const myWellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;

describe('pullFromDataSource', function () {

  describe('getGroupData', function () {
    it('creates a diamond from a given LatLng', () => {
      //Arrange
      const { lat, lng } = { lat: 34.54, lng: -115.4342 };
      const delta = 0.1;

      //Act
      const coords = createDiamondFromLatLng(lat, lng, delta);

      //Assert
      const expected = [
        new OWGeoPoint(lat - delta, lng),
        new OWGeoPoint(lat, lng + delta),
        new OWGeoPoint(lat + delta, lng),
        new OWGeoPoint(lat, lng - delta),
      ];
      assert.deepEqual(coords, expected);
    });

    it('transformsLegacyVillagesToGroups', () => {
      //Arrange
      const { lat, lng } = { lat: 34.54, lng: -115.4342 };
      const delta = 0.1;
      const legacyVillages: Array<LegacyVillage> = [
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
      const transformedVillages = LegacyMyWellDatasource.transformLegacyVillagesToGroups(orgId, legacyVillages);

      //Assert
      const expected = [{
        name: 'Hinta',
        orgId,
        type: 'village',
        coords: createDiamondFromLatLng(lat, lng, delta),
        externalIds: ResourceIdType.fromLegacyVillageId(5000, 12),
      }];
      assert.deepEqual(transformedVillages, expected);
    });
  });
});


describe('pushDataToDataSource', function () {

  describe('push resources to LegacyMyWell', function() {
    this.timeout(50000);
    const fs = new MockFirebase({}).firestore(); //Careful! We're masking the original fs
    const datasource = new LegacyMyWellDatasource(myWellLegacyBaseUrl, []);

    /* Create 2 resources that haven't yet been synced to LegacyMyWell */
    before(() => {
      const externalIdsA = ResourceIdType.newOWResource(5000).serialize();
      const externalIdsB = ResourceIdType.newOWResource(5000).serialize();

      const resourcesRef = fs.collection('org').doc(orgId).collection('resource');
      const resourceAJson = { "resourceType": "well", "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(), "id": "00znWgaT83RoYXYXxmvk", "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(),  "coords": {    "_latitude": 23.9172222222222,    "_longitude": 73.8244444444444  },  "lastValue": 22.6,  "groups": {    "rhBCmtN16cABh6xSPijR": true,    "jpKBA75GiZAzpA0gkBi8": true  },  "updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(),  "owner": {    "name": "Khokhariya Ramabhai Sojabhai",    "createdByUserId": "default"  },  "orgId": "test_12345",  "externalIds": externalIdsA,};
      const resourceBJson = { "resourceType": "well", "lastReadingDatetime": moment("1970-01-01T00:00:00.000Z").valueOf(), "id": "00znWgaT83RoYXYXxmvk", "createdAt": moment("2018-08-07T01:58:10.031Z").valueOf(), "coords": { "_latitude": 23.9172222222222, "_longitude": 73.8244444444444},"lastValue": 22.6,"groups": {  "rhBCmtN16cABh6xSPijR": true,  "jpKBA75GiZAzpA0gkBi8": true},"updatedAt": moment("2018-08-07T01:58:10.031Z").valueOf(),"owner": {  "name": "Khokhariya Ramabhai Sojabhai",  "createdByUserId": "default"},"orgId": "test_12345","externalIds": externalIdsB};
      const resourceA = Resource.deserialize(resourceAJson);
      const resourceB = Resource.deserialize(resourceBJson);

      return Promise.all([
        resourcesRef.add(resourceA.serialize()),
        resourcesRef.add(resourceB.serialize()),
      ]);
    });

    it('converts a list of SyncRunResults to a list of ids and nulls', () => {
      //Arrange
      const resultList: Array<SyncRunResult> = [
        { results: [1], warnings: [], errors: [] },
        { results: [2], warnings: [], errors: [] },
        { results: [], warnings: [], errors: ['Error saving thingo'] },
      ];

      //Act
      const result = LegacyMyWellDatasource.convertSyncRunResultsToList(resultList);

      //Assert
      const expected = [1, 2, null];
      assert.deepEqual(result, expected);
    });

    it('updateExistingResources updates resources for a list of ids', async () => {
      //Arrange
      const oneYearAgo = moment().subtract(1, 'year').valueOf();
      const newResources: Array<Resource> = await datasource.getNewResources(orgId, fs, oneYearAgo);
      const ids = [1111, 1112];

      //Act
      const result = await datasource.updateExistingResources(newResources, ids, fs);

      //Assert
      const expected = {
        results: [1111, 1112],
        warnings: [],
        errors: [],
      };

      assert.deepEqual(result, expected);
    });

    it('updateExistingResources handles null ids', async () => {
      //Arrange
      const oneYearAgo = moment().subtract(1, 'year').valueOf();
      const newResources: Array<Resource> = await datasource.getNewResources(orgId, fs, oneYearAgo);
      const ids = [1111, null];

      //Act
      const result = await datasource.updateExistingResources(newResources, ids, fs);

      //Assert
      assert.equal(result.results.length, 1);
      assert.equal(result.warnings.length, 1);
      assert.equal(result.errors.length, 0);
    });
  });

  describe('transformReadingsToLegacyMyWell', function () {
    it('transforms a list of Readings to LegacyMyWellReadings', () => {
      //Arrange
      const mockDate = moment('2018-08-03T00:57:47.957Z');
      const readingA = new Reading(orgId, 'readingA', null, ResourceType.Well, {}, mockDate.toDate(), 100, ResourceIdType.fromLegacyReadingId(123, 5000, 1110));
      const readingB = new Reading(orgId, 'readingB', null, ResourceType.Well, {}, mockDate.toDate(), 100, ResourceIdType.fromLegacyReadingId(124, 5000, 1112));

      readingA.id = 'readingA';
      readingB.id = 'readingB';

      readingA.createdAt = mockDate.toDate();
      readingB.createdAt = mockDate.subtract(1, 'month').toDate();
      readingA.updatedAt = mockDate.toDate();
      readingB.updatedAt = mockDate.subtract(1, 'month').toDate();
      const readings = [readingA, readingB];

      //Act
      const transformed = LegacyMyWellDatasource.transformReadingsToLegacyMyWell(readings);

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

  describe('getNewResources', function() {
    this.timeout(50000);
    const fs = new MockFirebase({}).firestore(); //Careful! We're masking the original fs
    const datasource = new LegacyMyWellDatasource(myWellLegacyBaseUrl, []);

    before(() => {
      const externalIdsA = ResourceIdType.newOWResource(5000).serialize();
      // console.log('externalIdsA', externalIdsA);

      //This one isn't new, it should be filtered out
      const externalIdsB = ResourceIdType.fromLegacyMyWellId(5000, 1111).serialize();

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
      const resourceA = Resource.deserialize(resourceAJson);
      const resourceB = Resource.deserialize(resourceBJson);


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
    const datasource = new LegacyMyWellDatasource(myWellLegacyBaseUrl, []);

    //TODO: tidy up, make helper functions...
    before(() => {
      const readingsRef = fs.collection('org').doc(orgId).collection('reading');
      const readingA = new Reading(orgId, 'readingA', null, ResourceType.Well, {}, moment().toDate(), 100, ResourceIdType.fromLegacyReadingId(123, 5000, 1110));
      const readingB = new Reading(orgId, 'readingB', null, ResourceType.Well, {}, moment().toDate(), 100, ResourceIdType.none());
      const readingC = new Reading(orgId, 'readingB', null, ResourceType.Well, {}, moment().toDate(), 100, ResourceIdType.fromLegacyReadingId(124, 5000, 1112));

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