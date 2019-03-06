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


  describe('Bulk Upload Readings Endpoint', function () {
    let authHeader;
    this.timeout(10000);
    
    this.beforeAll(async () => {
      authHeader = await getAuthHeader(admin);

      //The admin user that the middleware will look up
      await userApi.userRef(orgId, "12345").set({
        ...DefaultUser,
        type: UserType.Admin
      });
    });

    it('does not throw if validateOnly is missing', async () => {
      //Arrange
      const body = {
        readings: [{ "date": "in yyyy/mm/dd format", "time": "(24 hour format, leave as 00:00 if unknown)", "timeseries": "(leave default if unknown)", "value": "", "shortId": "(leave blank if unknown, 9 digits)", "id": "(leave blank if unknown)", "legacyPincode": "(blank if N/A)", "legacyResourceId": "(4 digits,  blank if N/A)" }],
      };
      const options = {
        method: 'POST',
        uri: `${baseUrl}/admin/${orgId}/${userId}/bulk_upload_readings`,
        json: true,
        body,
        headers: {
          ...authHeader,
        }
      }

      //Act
      const results = await request(options);

      //Assert
    });

    it('returns a validate only result if validateOnly is true', async () => {
      //Arrange
      const body = {
        readings: [{ "date": "in yyyy/mm/dd format", "time": "(24 hour format, leave as 00:00 if unknown)", "timeseries": "(leave default if unknown)", "value": "", "shortId": "(leave blank if unknown, 9 digits)", "id": "(leave blank if unknown)", "legacyPincode": "(blank if N/A)", "legacyResourceId": "(4 digits,  blank if N/A)" }, { "date": "2017/01/01", "time": "0:00", "timeseries": "default", "value": "12.44", "shortId": "", "id": "", "legacyPincode": "313603", "legacyResourceId": "1110" }, { "date": "2017/01/02", "time": "", "timeseries": "default", "value": "23.4", "shortId": "", "id": "", "legacyPincode": "313603", "legacyResourceId": "1111" }]
      };
      const options = {
        method: 'POST',
        uri: `${baseUrl}/admin/${orgId}/${userId}/bulk_upload_readings?validateOnly=true`,
        json: true,
        body,
        headers: {
          ...authHeader,
        }
      }

      //Act
      const results = await request(options);

      //Assert
    });


    this.afterAll(async () => {
      await userApi.userRef(orgId, "12345").delete();
    });
  });
});