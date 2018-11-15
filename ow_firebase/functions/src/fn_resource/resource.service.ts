import 'mocha'

import * as request from 'request-promise-native';


describe('fn_resource', function () {
  const orgId = process.env.ORG_ID;
  const baseUrl = process.env.BASE_URL;


  describe.only('ggmnResourceEmail', function () {
    it('sends the resource email', async () => {
      //Arrange
      const body = {

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