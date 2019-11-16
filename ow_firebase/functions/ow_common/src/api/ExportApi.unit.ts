import 'mocha';
import * as assert from 'assert';
//@ts-ignore
import MockFirestore from 'mock-cloud-firestore';

import { DefaultReading } from '../model';
import { ExportApi, ExportFormat } from './ExportApi';
import { Timestamp } from '@google-cloud/firestore';

// const {
//   orgId,
// } = require('../test/testConfig.json');


describe('Export Api', function () {
  this.timeout(5000);
  // const firestore: Firestore = new MockFirestore({}).firestore();

  this.beforeAll(async () => {
  
  });


  it('formats a reading with a tab', async () => {
    //Arrange
    const reading = { ...DefaultReading, id: "00001" };
    const format = ExportFormat.TSV;
    const expected = `00001\t2017-01-01T01:11:01Z\tno_resource_id\twell\tno_timeseries_id\t0\t\t\t`;

    //Act
    const result = ExportApi.formatReading(reading, format);
    
    //Assert
    assert.equal(result, expected);
  });

  it('formats a reading with a comma', async () => {
    //Arrange
    const reading = { ...DefaultReading, id: "00001" };
    const format = ExportFormat.CSV;
    const expected = `00001,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,`;

    //Act
    const result = ExportApi.formatReading(reading, format);
    
    //Assert
    assert.equal(result, expected);
  });

  it('formats many readings', async () => {
    //Arrange
    const readings = [
      { ...DefaultReading, id: "00001" },
      { ...DefaultReading, id: "00002" },
      { ...DefaultReading, id: "00003" },
      { ...DefaultReading, id: "00004" },
    ]
    const format = ExportFormat.CSV;
  const expected = `00001,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,
00002,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,
00003,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,
00004,2017-01-01T01:11:01Z,no_resource_id,well,no_timeseries_id,0,,,
`

    //Act
    const result = ExportApi.readingsToExport(readings, format);
    
    //Assert
    assert.equal(result, expected);
  });

  it('deserializes a legacy timestamp correctly', async () => {
    //Arrange
    const timestamp = new Timestamp(1483233061, 0);
    const reading = { ...DefaultReading, datetime: timestamp, id: "00001" };
    const format = ExportFormat.TSV;
    const expected = `00001\t2017-01-01T01:11:01.000Z\tno_resource_id\twell\tno_timeseries_id\t0\t\t\t`;

    //Act
    // @ts-ignore
    const result = ExportApi.formatReading(reading, format);

    //Assert
    assert.equal(result, expected);

  });

  this.afterAll(async () => {
   
  });
});