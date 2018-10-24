import 'mocha'

import SOSApi from './SOSApi';
import * as assert from 'assert';




describe('SOSApi Unit Tests', function() {
  describe('GetCapabilities', function() {
    it.only('handles the default request', () => {
      //Arrange
      const request = {};
      const expected = '';

      //Act
      const response = SOSApi.getCapabilities();

      //Assert
      assert.equal(response, expected);
    });
  });
});