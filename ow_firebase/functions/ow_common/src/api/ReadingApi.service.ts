import 'mocha';
import * as assert from 'assert';
//@ts-ignore
import MockFirestore from 'mock-cloud-firestore';
import { firestore } from '../test/TestFirebase';
import { unsafeUnwrap } from '../utils';
import { ReadingApi } from './ReadingApi';
import { Reading, DefaultReading } from '../model';

const {
  orgId,
} = require('../test/testConfig.json');

describe('Reading Api', function () {
  this.timeout(5000);
  const readingApi = new ReadingApi(firestore, orgId);
  const readings: Reading[] = [
    { ...DefaultReading, datetime: '2017-01-01T01:11:01Z', resourceId: "00001", timeseriesId: 'default' },
    { ...DefaultReading, datetime: '2017-01-01T01:12:01Z', resourceId: "00001", timeseriesId: 'default' },
    { ...DefaultReading, datetime: '2017-01-01T01:13:01Z', resourceId: "00002", timeseriesId: 'default' },
    { ...DefaultReading, datetime: '2017-01-01T01:14:01Z', resourceId: "00002", timeseriesId: 'default' },
    { ...DefaultReading, datetime: '2017-01-01T01:15:01Z', resourceId: "00003", timeseriesId: 'default' },
    { ...DefaultReading, datetime: '2017-01-01T01:16:01Z', resourceId: "00003", timeseriesId: 'default' },
    { ...DefaultReading, datetime: '2017-01-01T01:17:01Z', value: 1, resourceId: "00004", timeseriesId: 'default' },
    { ...DefaultReading, datetime: '2017-01-02T01:18:01Z', value: 2, resourceId: "00004", timeseriesId: 'default' },
    { ...DefaultReading, datetime: '2017-01-03T01:19:01Z', value: 3, resourceId: "00004", timeseriesId: 'default' },
  ];
  // const readingIds = readings.map(r => ReadingApi.hashReadingId(r.resourceId, r.timeseriesId, new Date(r.datetime)));

  it('Saves many readings in a batch', async () => {
    //Arrange
    
    const batchSize = 3;


    //Act
    const batchUploadResults = unsafeUnwrap(await readingApi.bulkUploadReadings(readings, batchSize));

    //Assert
    assert.equal(batchUploadResults.length, readings.length)
  });



  this.afterAll(async () => {
    //Delete all readings
    // await Promise.all(readingIds.map(async id => await readingApi.readingCol().doc(id).delete()))
  });
});