import 'mocha';
import * as assert from 'assert';
//@ts-ignore
import MockFirestore from 'mock-cloud-firestore';
import { SearchApi, SearchPageParams } from './SearchApi';
import { unsafeUnwrap } from '../utils/AppProviderTypes';
import { admin } from '../test/TestFirebase';
import { DefaultShortId, DefaultMyWellResource } from '../model';
type Firestore = admin.firestore.Firestore;

const {
  orgId,
} = require('../test/testConfig.json');


describe('Search Api', function () {
  this.timeout(5000);


  describe('Groups', function () {
    const firestore: Firestore = new MockFirestore({}).firestore();
    const searchApi = new SearchApi(firestore, orgId);

    this.beforeAll(async () => {
      //TODO: Add a bunch of shortIds
      await SearchApi.resourceCol(firestore, orgId).doc("00001").set({...DefaultMyWellResource, id: "00001", groups: { country: "IN", pincode: "313603"}});
      await SearchApi.resourceCol(firestore, orgId).doc("00002").set({...DefaultMyWellResource, id: "00002", groups: { country: "IN", pincode: "313603"}});
      await SearchApi.resourceCol(firestore, orgId).doc("00003").set({...DefaultMyWellResource, id: "00003", groups: { country: "AU", pincode: "5016"}});
      await SearchApi.resourceCol(firestore, orgId).doc("00004").set({...DefaultMyWellResource, id: "00004", groups: { country: "AU", pincode: "5063"}});
      await SearchApi.resourceCol(firestore, orgId).doc("00005").set({...DefaultMyWellResource, id: "00005", groups: { country: "IL", pincode: "5555"}});
      await SearchApi.resourceCol(firestore, orgId).doc("00006").set({...DefaultMyWellResource, id: "00006", groups: { country: "IL", pincode: "313604"}});
      await SearchApi.resourceCol(firestore, orgId).doc("00007").set({...DefaultMyWellResource, id: "00007", groups: { country: "IL", pincode: "313605"}});
    });

    it('searches for resources within the pincode group', async () => {
      // Arrange
      const searchQuery = "313";

      //Act
      const result = unsafeUnwrap(await searchApi.searchForResourceInGroup(searchQuery, 'pincode', { limit: 10 }));

      //Assert
      assert.equal(result.results.length, 4);
    });

    it('searches for resources with a full pincode', async () => {
      // Arrange
      const searchQuery = "313603";

      //Act
      const result = unsafeUnwrap(await searchApi.searchForResourceInGroup(searchQuery, 'pincode', { limit: 10 }));

      //Assert
      assert.equal(result.results.length, 2);
    });

    it('searches for resources within the country group', async () => {
      // Arrange
      const searchQuery = "I";

      //Act
      const result = unsafeUnwrap(await searchApi.searchForResourceInGroup(searchQuery, 'country', { limit: 10 }));

      //Assert
      assert.equal(result.results.length, 5);
    });

    it('searches for resources within the country group with an exact match', async () => {
      // Arrange
      const searchQuery = "IL";

      //Act
      const result = unsafeUnwrap(await searchApi.searchForResourceInGroup(searchQuery, 'country', { limit: 10 }));

      //Assert
      assert.equal(result.results.length, 3);
    });

    //Pagination doesn't work correctly for mock-cloud-firestore
    //This test passes against live firebase
    it.skip('paginates correctly', async () => {
      // Arrange
      const searchQuery = "I";
      let searchParams: SearchPageParams = { limit: 2 };


      //Act
      const searchResultA = unsafeUnwrap(await searchApi.searchForResourceInGroup(searchQuery, 'country', searchParams));
      searchParams = searchResultA.params;
      const searchResultB = unsafeUnwrap(await searchApi.searchForResourceInGroup(searchQuery, 'country', searchParams));

      //Assert
      assert.equal(searchResultA.results.length, 2);
      assert.equal(searchResultB.results.length, 2);
    });

    this.afterAll(async () => {
      await SearchApi.resourceCol(firestore, orgId).doc("00001").delete();
      await SearchApi.resourceCol(firestore, orgId).doc("00002").delete();
      await SearchApi.resourceCol(firestore, orgId).doc("00003").delete();
      await SearchApi.resourceCol(firestore, orgId).doc("00004").delete();
      await SearchApi.resourceCol(firestore, orgId).doc("00005").delete();
    });
  });

  describe('ShortId', function () {

    const firestore: Firestore = new MockFirestore({}).firestore();
    const searchApi = new SearchApi(firestore, orgId);

    this.beforeAll(async () => {
      //TODO: Add a bunch of shortIds
      await SearchApi.shortIdCol(firestore, orgId).doc("000100001").set({ ...DefaultShortId, id: '000100001', shortId: '000100001'});
      await SearchApi.shortIdCol(firestore, orgId).doc("000100002").set({ ...DefaultShortId, id: '000100002', shortId: '000100002'});
      await SearchApi.shortIdCol(firestore, orgId).doc("000100003").set({ ...DefaultShortId, id: '000100003', shortId: '000100003'});
      await SearchApi.shortIdCol(firestore, orgId).doc("000100004").set({ ...DefaultShortId, id: '000100004', shortId: '000100004'});

      await SearchApi.shortIdCol(firestore, orgId).get();
    });

    it('transforms shortId strings into valid shortId lookup ranges', () => {
      const inputs = [
        "100-000",
        "100--000",
        "100 100 000 ",
        "100",
        "1001",
        "00010001",
      ];

      const expected = [
        ["000100000", "000100000"],
        ["000100000", "000100000"],
        ["100100000", "100100000"],
        ["000100000", "000101000"],
        ["000100100", "000100200"],
        ["000100010", "000100020"],
      ];

      inputs.forEach((input, idx) => assert.deepEqual(
        unsafeUnwrap(SearchApi.rangeFromShortIdString(input)), 
        expected[idx]
      ));
    });

    it('performs a basic search', async () => {
      //Arrange
      const shortId = "100-001";

      //Act
      const result = unsafeUnwrap(await searchApi.searchByShortId(shortId, {limit: 10}));

      //Assert
      assert.equal(result.results.length, 1);
    });

    //Pagination doesn't work correctly for mock-cloud-firestore
    //This test passes against live firebase
    it.skip('performs a paginated search', async () => {
      //Arrange
      //This test assumes onlt 4 shortIds
      const query = "100";
      let searchParams: SearchPageParams = { limit: 3 };

      //Act
      const searchResultA = unsafeUnwrap(await searchApi.searchByShortId(query, searchParams));
      searchParams = searchResultA.params;
      const searchResultB = unsafeUnwrap(await searchApi.searchByShortId(query, searchParams));

      //Assert
      assert.equal(searchResultA.results.length, 3);
      assert.equal(searchResultB.results.length, 1);
    });

    this.afterAll(async () => {
      await SearchApi.shortIdCol(firestore, orgId).doc("000100001").delete();
      await SearchApi.shortIdCol(firestore, orgId).doc("000100002").delete();
      await SearchApi.shortIdCol(firestore, orgId).doc("000100003").delete();
      await SearchApi.shortIdCol(firestore, orgId).doc("000100004").delete();
    });
  });
});