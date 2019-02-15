import 'mocha'

import * as request from 'request-promise-native';
import { OrgType, PendingResource, ResourceType, PendingReading } from 'ow_types';
import { getAuthHeader } from '../../../tools';
import { admin, firestore } from '../../test/TestFirebase';
import { UserApi } from 'ow_common/lib/api';
import { DefaultUser } from 'ow_common/lib/model/User';
import * as assert from 'assert';
import UserStatus from 'ow_common/lib/enums/UserStatus';

describe('fn_resource', function () {
  const orgId = process.env.ORG_ID;
  const baseUrl = process.env.BASE_URL;
  let authHeader;

  describe('user sync', function () {
    this.timeout(5000);
    const userApi = new UserApi(firestore, orgId);
    const userId = "user1223";


    this.beforeAll(async () => {
      authHeader = await getAuthHeader(admin);
      await userApi.userRef(orgId, userId).set({
        ...DefaultUser,
        status: UserStatus.Unapproved,
      });
    });
    
    it('fails to sync if the user is unverified', async () => {
      //Arrange
      const options = {
        method: 'POST',
        uri: `${baseUrl}/resource/${orgId}/${userId}/sync`,
        json: true,
        body: {},
        headers: {
          ...authHeader,
        }
      }

      //Act
      let statusCode = 200;
      try {
        await request(options);
      } catch (err) {
        statusCode = err.statusCode;
      }

      //Assert
      assert.equal(statusCode, 403);
    });

    this.afterAll(async () => {
      await userApi.userRef(orgId, userId).delete();
    });
  });


  describe('ggmnResourceEmail', function () {
    this.timeout(5000);

    before(async function() {
      authHeader = await getAuthHeader(admin);
    });
    
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

      const pendingReadings: any[] = [
        {
          date: "2018-11-28T02:18:49Z",
          id: "AMEJ7HjS9A2UcIibZdv2",
          pending: true,
          resourceId: "lewus",
          timeseriesId: "gwmmsl",
          value: 11,
        }
      ];
      const body = {
        "email": "lewisdaly@me.com",
        pendingResources,
        pendingReadings,
        subject: 'This is the email subject',
        message: 'This is the email message line two<br/>Does html <strong>WORK</strong>?',
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
      

      //Assert
    });
  });
});