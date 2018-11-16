import 'mocha'

import * as request from 'request-promise-native';
import { PendingResource } from 'ow_types/lib/PendingResource';
import { OrgType } from 'ow_types/lib/OrgType';
import { ResourceType } from 'ow_types/lib/Enums';


describe('fn_resource', function () {
  const orgId = process.env.ORG_ID;
  const baseUrl = process.env.BASE_URL;


  describe.only('ggmnResourceEmail', function () {
    this.timeout(5000);
    
    it('sends the resource email', async () => {
      //Arrange
      const pendingResources: PendingResource[] = [
        {
          type: OrgType.NONE,
          id: '12345',
          pending: true,
          coords: { latitude: 123, longitude: 23 },
          resourceType: ResourceType.checkdam,
          owner: { name: 'Lewis' },
          userId: '12345',
          timeseries: [],
        },
        {
          type: OrgType.NONE,
          id: '12346',
          pending: true,
          coords: { latitude: 123, longitude: 23 },
          resourceType: ResourceType.checkdam,
          owner: { name: 'Lewis' },
          userId: '12346',
          timeseries: [],
        },
      ];
      const body = {
        "email": "lewisdaly@me.com",
        pendingResources,
      };

      const options = {
        method: 'POST',
        uri: `${baseUrl}/resource/${orgId}/ggmnResourceEmail`,
        json: true,
        body,
      }

      //Act
      const response = await request(options);
      
      console.log('response', response);

      //Assert
    });
  });
});