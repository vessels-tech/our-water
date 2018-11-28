import 'mocha'
import GGMNApi from './GGMNApi';
import * as assert from 'assert';
import { 
  PendingResource,
  OrgType,
  ResourceType,
  PendingReading,
 } from 'ow_types';
import { ResultType } from '../types/AppProviderTypes';


describe('GGMNApi', function () {
  const pendingResources: PendingResource[] = [
    {
      type: OrgType.NONE,
      id: '12345',
      pending: true,
      coords: { latitude: -34.9285, longitude: 138.6007 },
      resourceType: ResourceType.checkdam,
      owner: { name: 'Lewis' },
      userId: '12345',
      timeseries: [],
    },
    {
      type: OrgType.NONE,
      id: '12346',
      pending: true,
      coords: { latitude: -34.9283, longitude: 138.6009 },
      resourceType: ResourceType.checkdam,
      owner: { name: 'Lewis' },
      userId: '12346',
      timeseries: [],
    },
  ];

  describe('pendingReadingToCSV', function() {
    it('converts a pending reading list to a csv file', async () => {
      //Arrange
      const timeseriesNames = ['GWmMSL', 'GWmBGS'];

      //Act
      const result = GGMNApi._generateCSV(pendingResources, timeseriesNames);

      //Assert
      const expected = 
`1970-01-01T00:00:00Z,GWmMSL,00.00,12345
1970-01-01T00:00:00Z,GWmBGS,00.00,12345
1970-01-01T00:00:00Z,GWmMSL,00.00,12346
1970-01-01T00:00:00Z,GWmBGS,00.00,12346
`;
      assert.equal(result, expected);
    });
  });



  describe('pendingResourceToZip', function() {
    it('saves a pending resource to .zip shapefile', async () => {
      //Arrange
      //Act
      const result = await GGMNApi.pendingResourcesToZip(pendingResources);

      //Assert
      if (result.type === ResultType.ERROR) {
        throw new Error(result.message);
      }
      assert.equal('/tmp/12345.zip', result.result);
    });
  });
});