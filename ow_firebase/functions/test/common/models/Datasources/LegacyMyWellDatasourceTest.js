const assert = require('assert');
const MockFirebase = require('mock-cloud-firestore');
const moment = require('moment');
const { Reading } = require('../../../../lib/common/models/Reading');
const LegacyMyWellDatasource = require('../../../../lib/common/models/Datasources/LegacyMyWellDatasource').default;
const ResourceIdType = require('../../../../lib/common/types/ResourceIdType').default;
const { createDiamondFromLatLng } = require('../../../../lib/common/utils');

const orgId = process.env.ORG_ID;
const myWellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;


module.exports = ({fs}) => {

  describe('pullFromDataSource', function() {

    describe('getGroupData', function() {
      it('creates a diamond from a given LatLng', () => {
        //Arrange
        const {lat, lng} = {lat: 34.54, lng: -115.4342};
        const delta = 0.1;

        //Act
        const coords = createDiamondFromLatLng(lat, lng, delta);

        //Assert
        const expected = [
          new GeoPoint(lat - delta, lng),
          new GeoPoint(lat, lng + delta),
          new GeoPoint(lat + delta, lng),
          new GeoPoint(lat, lng - delta),
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
            coordinates: { lat, lng},
            createdAt: moment().toISOString,
            updatedAt: moment().toISOString,
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
          externalIds: {
            legacyMyWellId: '5000.12345',
          },
        }];
        assert.deepEqual(transformedVillages, expected);
      });

      /**
       * Integration Test Only
       * 
       * We mainly want to test that the GeoPoint is being saved correctly
       */
      it.skip('[INT] saves new Group Data', async function() {
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
            createdAt: moment().toISOString,
            updatedAt: moment().toISOString,
          }
        ];
        const groups = LegacyMyWellDatasource.transformLegacyVillagesToGroups(orgId, legacyVillages);

        //Act
        const datasource = new LegacyMyWellDatasource(myWellLegacyBaseUrl);
        const result = await datasource.saveGroups(orgId, fs, groups);

        //Assert
        assert.equal(1, result.results.length);   
        assert.equal(0, result.warnings.length);   
        assert.equal(0, result.errors.length);   
      });

    });
  });


  describe('pushDataToDataSource', function() {

    /*INTEGRATION TEST */
    /* //TODO: test using mocks instead, and move this to integration test section*/
    describe.skip('saveReadingsToLegacyMyWell', function() {
      this.timeout(15000);
      const datasource = new LegacyMyWellDatasource(myWellLegacyBaseUrl);

      it('formats an error correctly', async () => {
        //Arrange
        const legacyReadings = [{
          date: '2018-08-03T00:57:47.957Z',
          value: 100,
          villageId: 11,
          postcode: 01010101, //postcode doesn't exist
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
    
    describe('transformReadingsToLegacyMyWell', function() {
      it('transforms a list of Readings to LegacyMyWellReadings', () => {
        //Arrange
        const mockDate = moment('2018-08-03T00:57:47.957Z');
        const readingA = new Reading(orgId, 'readingA', null, null, {}, mockDate.valueOf(), 100, ResourceIdType.fromLegacyReadingId('123', '5000', '1110'));
        const readingB = new Reading(orgId, 'readingB', null, null, {}, mockDate.valueOf(), 100, ResourceIdType.fromLegacyReadingId('124', '5000', '1112'));

        readingA.id = 'readingA';
        readingB.id = 'readingB';

        readingA.createdAt = mockDate.valueOf();
        readingB.createdAt = mockDate.subtract(1, 'month').valueOf();
        readingA.updatedAt = mockDate.valueOf();
        readingB.updatedAt = mockDate.subtract(1, 'month').valueOf();
        const readings = [ readingA, readingB];

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
    
    describe('getNewReadings', function() {
      this.timeout(5000);
      const fs = new MockFirebase({}).firestore(); //Careful! We're masking the original fs
      const datasource = new LegacyMyWellDatasource(myWellLegacyBaseUrl);

      //TODO: tidy up, make helper functions...
      before(() => {
        const readingsRef = fs.collection('org').doc(orgId).collection('reading');
        const readingA = new Reading(orgId, 'readingA', null, null, {}, moment().valueOf(), 100, ResourceIdType.fromLegacyReadingId('123', '5000', '1110'));
        const readingB = new Reading(orgId, 'readingB', null, null, {}, moment().valueOf(), 100, ResourceIdType.none());
        const readingC = new Reading(orgId, 'readingB', null, null, {}, moment().valueOf(), 100, ResourceIdType.fromLegacyReadingId('124', '5000', '1112'));
        
        readingA.id = 'readingA';
        readingB.id = 'readingB';
        readingC.id = 'readingC';

        readingA.createdAt = moment().valueOf();
        readingB.createdAt = moment().subtract(1, 'month').valueOf();
        readingC.createdAt = moment().subtract(2, 'year').valueOf();

        readingA.updatedAt = moment().valueOf();
        readingB.updatedAt = moment().subtract(1, 'month').valueOf();
        readingC.updatedAt = moment().subtract(2, 'year').valueOf();

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
}