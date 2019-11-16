import 'mocha';
import * as assert from 'assert';
//@ts-ignore
import MockFirestore from 'mock-cloud-firestore';
import { SearchApi, SearchPageParams } from './SearchApi';
import { unsafeUnwrap } from '../utils/AppProviderTypes';
import { firestore } from '../test/TestFirebase';
import request from 'request-promise-native';

const {
  orgId,
} = require('../test/testConfig.json');


describe('Search Api', function () {
  this.timeout(5000);


  describe('Groups', function () {

    const searchApi = new SearchApi(firestore, orgId);

    // this.beforeAll(async () => {
    
    // });

    it('searches for a place, an returns the expected response', async () => {
      // Arrange
      const baseUrl = "https://nominatim.openstreetmap.org/search";
      const placeName = "Adelaide";
      const searchParams: SearchPageParams = {limit: 10};

      //Act
      const result = unsafeUnwrap(await searchApi.searchForPlaceName(baseUrl, placeName, searchParams, request));

      //Assert
      //This is a little naive, but it's ok for now.
      assert.equal(result.results.length, 10);
    });

    // this.afterAll(async () => {
      
    // });

  });
});