import { getIdToken, getIsUserAdmin } from './middleware'; 
import * as assert from 'assert';
import { makeError, unsafeUnwrap, ResultType } from 'ow_common/lib/utils/AppProviderTypes';

//Not sure why this import is different from ow_common
import * as MockFirestore from 'mock-cloud-firestore';

import { admin } from './test/TestFirebase';
import { UserApi } from 'ow_common/lib/api';
import { DefaultUser } from 'ow_common/lib/model/User';
import UserType from 'ow_common/lib/enums/UserType';
type Firestore = admin.firestore.Firestore;

const orgId = process.env.ORG_ID;

describe('Middleware Unit tests', function() {

  describe('validateFirebaseIdToken', function () {
    it('fails to retrieve token when token is missing', () => {
      //Arrange
      const mockedRequest = {
        headers: {
          
        }
      };
      const expected = makeError<string>("No ID token found").type
      
      //Act
      const validateResult = getIdToken(mockedRequest);
      
      //Assert
      assert.equal(validateResult.type, expected);
    });
  });

  describe('validateUserIsAdmin', function () {
    const firestore: Firestore = new MockFirestore({}).firestore();
    const userApi = new UserApi(firestore, orgId);

    this.beforeAll(async () => {
      await userApi.userRef(orgId, 'normal_user').set(DefaultUser);
      await userApi.userRef(orgId, 'admin_user').set({
        ...DefaultUser,
        type: UserType.Admin,
      });
    });

    it('validates if the user is admin', async () => {
      //Arrange
      //Act
      unsafeUnwrap(await getIsUserAdmin(userApi, orgId, 'admin_user'));

      //Assert
    });

    it('fails to validate if user is not admin', async () => {
      //Arrange
      const expected = ResultType.ERROR;

      //Act
      const result = await getIsUserAdmin(userApi, orgId, 'normal_user');

      //Assert
      assert.equal(result.type, expected);
    });
  })

});