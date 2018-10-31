import 'mocha'
import SOSApi from './SOSApi';
import * as assert from 'assert';




describe('SOSApi Unit Tests', function() {
  describe('GetCapabilities', function() {
    it('handles the default request', () => {
      //Arrange
      const request = {};
      const expected = '';

      //Act
      const response = SOSApi.getCapabilities();

      //Assert
      assert.equal(response, expected);
    });
  });

  describe('GetObservation', function() { 
    it('handles the default request', () => {
      //Arrange
      const request = {};
      const expected = '';

      //Act
      const response = SOSApi.getObservation();

      //Assert
      assert.equal(response, expected);

    });
  })
});