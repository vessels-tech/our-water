
import 'mocha';
import { getAuthHeader, getToken } from '../tools';
import { admin } from './test/TestFirebase';
import { verifyIdToken } from './middleware';
import { unsafeUnwrap, ResultType } from 'ow_common/lib/utils/AppProviderTypes';
import * as assert from 'assert';

describe('Middleware integration tests', function() {
  this.timeout(5000);
  const orgId = process.env.ORG_ID;
  const baseUrl = process.env.BASE_URL;
  // let authToken;


  // before(async function () {
  //   authToken = await getToken(admin);
  // });

  it('successfully validates the id token', async () => {
    //Arrange
    const authToken = await getToken(admin);

    //Act
    const verifyToken = unsafeUnwrap(await verifyIdToken(authToken));
    
    //Assert
    //As long as unsafeUnwrap doesn't die, then we are happy.
  });


  it('fails to validate an invalid token', async () => {
    //Arrange
    const authToken = "!@#$";
    const expected = ResultType.ERROR;

    //Act
    const verifyToken = await verifyIdToken(authToken);

    //Assert
    assert.equal(verifyToken.type, expected);
  });  

 
});