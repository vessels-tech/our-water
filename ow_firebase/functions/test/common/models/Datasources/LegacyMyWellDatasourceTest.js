const assert = require('assert');
const MockFirebase = require('mock-cloud-firestore');
const moment = require('moment');
const { Reading } = require('../../../../lib/common/models/Reading');
const LegacyMyWellDatasource = require('../../../../lib/common/models/Datasources/LegacyMyWellDatasource').default;
const ResourceIdType = require('../../../../lib/common/types/ResourceIdType').default;

const orgId = process.env.ORG_ID;
const baseUrl = process.env.BASE_URL;


module.exports = ({fs}) => {
  describe.only('pushDataToDataSource', function() {
    this.timeout(5000);

    describe('getNewReadings', function() {
      const fs = new MockFirebase({}).firestore();
      const datasource = new LegacyMyWellDatasource(baseUrl);

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

        //TODO: Mock library doesn't support composite indexes...
        return datasource.getNewReadings(orgId, fs, oneYearAgo)
          .then(readings => {
            console.log('found readings', readings);
            assert.equal(readings.length, 1);
          });

      });
    });
  });
}