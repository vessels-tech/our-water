import 'mocha'
import * as assert from 'assert';

import FOI, { FOIType } from './FOI';
import GetFeatureOfInterestResponse, { GetFeatureOfInterestResponseType } from './GetFeatureOfInterestResponse';



describe('GetFoiResponse Unit Tests', function () {
  it('Deserialises the feature of interest response', () => {
    //Arrange
    const foi: FOIType = {
      id: '12345',
      description: 'Cluny 85-2 South_0219',
      gml_identifier: 'gml:12345', 
      shape: { id: 'shape1234', position: { lat: 123, lng: 456}} 
    }

    const fois: FOI[] = [
      new FOI(foi),
    ];

    const foiResponse: GetFeatureOfInterestResponseType = {
      id: '12345',
      fois,
      exceptionReport: 'exceptionreport?',
    }
    const response = new GetFeatureOfInterestResponse(foiResponse);
    const expected = '';

    //Act
    //Assert
    assert.equal(response.serialize(), expected);
  });
});