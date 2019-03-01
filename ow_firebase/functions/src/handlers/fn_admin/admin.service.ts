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

  describe('Download Readings', function() {
    let authHeader;
    const readingApi = new ReadingApi(firestore, orgId);


    this.beforeAll(async () => {
      authHeader = await getAuthHeader(admin);
      
      //TODO: make some readings;
      await readingApi.readingCol().doc("reading_001").set({ ...DefaultReading, resourceId: "00001", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_002").set({ ...DefaultReading, resourceId: "00001", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_003").set({ ...DefaultReading, resourceId: "00002", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_004").set({ ...DefaultReading, resourceId: "00002", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_005").set({ ...DefaultReading, resourceId: "00003", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_006").set({ ...DefaultReading, resourceId: "00003", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_007").set({ ...DefaultReading, datetime: '2017-01-01T01:11:01Z', value: 1, resourceId: "00004", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_008").set({ ...DefaultReading, datetime: '2017-01-02T01:11:01Z', value: 2, resourceId: "00004", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_009").set({ ...DefaultReading, datetime: '2017-01-03T01:11:01Z', value: 3, resourceId: "00004", timeseriesId: 'default' })
    });

    it.only('downloads the readings for multiple resourceIds', async () => {
      //Arrange
      const resourceIds = '00001,00002,00003';
      const options = {
        method: 'GET',
        uri: `${baseUrl}/admin/${orgId}/readings/${resourceIds}`,
        json: true,
        headers: {
          ...authHeader,
        }
      }
      
      //Act
      const response = await request(options);
      console.log("Response is", response);
      
      //Assert
    });

    it('downloads the readings for just one resourceId');

    it('does not fail to donwload if there are no readings for the resourceId');


    this.afterAll(async () => {
      await readingApi.readingCol().doc("reading_001").delete();
      await readingApi.readingCol().doc("reading_002").delete();
      await readingApi.readingCol().doc("reading_003").delete();
      await readingApi.readingCol().doc("reading_004").delete();
      await readingApi.readingCol().doc("reading_005").delete();
      await readingApi.readingCol().doc("reading_006").delete();
      await readingApi.readingCol().doc("reading_007").delete();
      await readingApi.readingCol().doc("reading_008").delete();
      await readingApi.readingCol().doc("reading_009").delete();
    });
  });
});