import 'mocha'
import * as assert from 'assert';

import FOI from './FOI';
import GetFeatureOfInterestResponse from './GetFeatureOfInterestResponse';



describe('GetFoiResponse Unit Tests', function () {
  it.only('Deserialises the feature of interest response', () => {
    //Arrange
    const fois: FOI[] = [];

    const response = new GetFeatureOfInterestResponse(fois);
    const expected = '';

    //Act
    //Assert
    assert.equal(response.serialize(), expected);
  });
});