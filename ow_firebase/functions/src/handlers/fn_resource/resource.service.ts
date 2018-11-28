import 'mocha'

import * as request from 'request-promise-native';
import { OrgType, PendingResource, ResourceType } from 'ow_types';
import { getAuthHeader } from '../../../tools';
import { admin } from '../../test/TestFirebase';

describe('fn_resource', function () {
  const orgId = process.env.ORG_ID;
  const baseUrl = process.env.BASE_URL;
  let authHeader;


  describe('ggmnResourceEmail', function () {
    this.timeout(5000);

    before(async function() {
      authHeader = await getAuthHeader(admin);
    });
    
    it.only('sends the resource email', async () => {
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
        pendingReadings: [],
        subject: 'This is the email subject',
        message: 'This is the email message',
      };

      const options = {
        method: 'POST',
        uri: `${baseUrl}/resource/${orgId}/ggmnResourceEmail`,
        json: true,
        body,
        headers: {
          ...authHeader,
        }
      }

      //Act
      const response = await request(options);
      
      console.log('response', response);

      //Assert
    });
  });
});