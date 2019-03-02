import 'mocha';
import { getAuthHeader, getToken } from '../../../tools';
import { admin, firestore } from '../../test/TestFirebase';
import * as request from 'request-promise-native';

import { verifyIdToken } from '../../middleware';
import { unsafeUnwrap, ResultType } from 'ow_common/lib/utils/AppProviderTypes';
import * as assert from 'assert';
import { UserApi, ReadingApi } from 'ow_common/lib/api';
import { DefaultUser } from 'ow_common/lib/model/User';
import { isUndefined } from 'ow_common/lib/utils/Maybe';
import UserType from 'ow_common/lib/enums/UserType';
import { DefaultReading } from 'ow_common/lib/model';
type Firestore = admin.firestore.Firestore;


describe('Admin integration tests', function () {

  this.timeout(5000);
  const orgId = process.env.ORG_ID;
  const baseUrl = process.env.BASE_URL;
  const userApi = new UserApi(firestore, orgId);
  const userId = 'user1234';

  
  describe('User tests', function() {
    let authHeader;
    this.beforeAll(async () => {
      authHeader = await getAuthHeader(admin);

      await userApi.userRef(orgId, userId).set(DefaultUser);
      //The admin user that the middleware will look up
      await userApi.userRef(orgId, "12345").set({
        ...DefaultUser,
        type: UserType.Admin
      });
    });
    
    it('changes the user status to Admin', async () => {
      //Arrange
      const body = {
        type: UserType.Admin,
      };
      const options = {
        method: 'PATCH',
        uri: `${baseUrl}/admin/${orgId}/${userId}/type`,
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

    it('changes the user status to Admin with the insecure token', async () => {
      //Arrange
      const insecure_token = process.env.temporary_admin_access_token;
      const body = {
        type: UserType.Admin,
      };
      const options = {
        method: 'PATCH',
        uri: `${baseUrl}/admin/${orgId}/${userId}/type`,
        json: true,
        body,
        headers: {
          insecure_token,
        }
      }

      //Act 
      const response = await request(options);

      //Assert
    });

    this.afterAll(async () => {
      await userApi.userRef(orgId, userId).delete();
    });
  });
});