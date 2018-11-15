import 'mocha'
import GGMNApi from './GGMNApi';
import * as assert from 'assert';
import { PendingResource } from 'ow_types/PendingResource';
import { ResultType } from '../types/AppProviderTypes';
import { OrgType } from 'ow_types/OrgType';
import { ResourceType } from 'ow_types/Enums';

describe('GGMNApi', function () {
  describe('pendingResourceToZip', function() {
    it.only('saves a pending resource to .zip shapefile', async () => {
      //Arrange
      const pendingResources: PendingResource[] = [
        {
          type: OrgType.NONE,
          id: '12345',
          pending: true,
          coords: { latitude: 123, longitude: 23 },
          resourceType: ResourceType.checkdam,
          owner: { name: 'Lewis'},
          userId: '12345',
          timeseries: [],
        },
        {
          type: OrgType.NONE,
          id: '12346',
          pending: true,
          coords: { latitude: 123, longitude: 23 },
          resourceType: ResourceType.checkdam,
          owner: { name: 'Lewis'},
          userId: '12346',
          timeseries: [],
        },
    ];

      //Act
      const result = await GGMNApi.pendingResourceToZip(pendingResources);

      //Assert
      if (result.type === ResultType.ERROR) {
        throw new Error(result.message);
      }
      assert.equal('/tmp/12345.zip', result.result);
    });
  });
});