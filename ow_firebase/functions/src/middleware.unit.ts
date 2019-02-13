import { getIdToken } from './middleware'; 
import * as assert from 'assert';
import { makeError } from 'ow_common/lib/utils/AppProviderTypes';

describe('Middleware Unit tests', function() {

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