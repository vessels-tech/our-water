import 'mocha';
import * as assert from 'assert';
import { admin, firestore } from '../src/test/TestFirebase';
import { unsafeUnwrap } from 'ow_common/lib/utils';
import { ResourceApi, SearchApi } from 'ow_common/lib/api';
type Firestore = admin.firestore.Firestore;
import Migrator from './Migrator';
import { DefaultMyWellResource } from 'ow_common/lib/model';

const {
  orgId,
} = require('../src/test/testConfig.json');


describe.only('Migrator Api', function () {
  this.timeout(15000);
  this.slow(5000);
  const resourceApi = new ResourceApi(firestore, orgId);
  const searchApi = new SearchApi(firestore, orgId);

  describe('Migrates Legacy Pincodes and ResourceIds', function() {

    this.beforeAll(async () => {
      //TODO: Create some resources which match the existing ones EXACTLY
      const defaultExternalIds = {
        hasLegacyMyWellId: true,
        hasLegacyMyWellPincode: true,
        hasLegacyMyWellResourceId: true,
        hasLegacyMyWellVillageId: true,
        legacyMyWellId: "313603.1112",
        legacyMyWellPincode: "313603",
        legacyMyWellResourceId: "1112",
        legacyMyWellVillageId: "11"
      };

      delete DefaultMyWellResource.groups;
      
      //In pincode 313603
      await resourceApi.resourceRef("00001").set({ ...DefaultMyWellResource, id: "00001", externalIds: { ...defaultExternalIds } });
      await resourceApi.resourceRef("00002").set({ ...DefaultMyWellResource, id: "00002", externalIds: { ...defaultExternalIds, legacyMyWellResourceId: "1113" } });
      await resourceApi.resourceRef("00003").set({ ...DefaultMyWellResource, id: "00003", externalIds: { ...defaultExternalIds, legacyMyWellResourceId: "1114" } });
      await resourceApi.resourceRef("00004").set({ ...DefaultMyWellResource, id: "00004", externalIds: { ...defaultExternalIds, legacyMyWellResourceId: "1115" } });

      //In pincode 5063
      await resourceApi.resourceRef("00005").set({ ...DefaultMyWellResource, id: "00005", externalIds: { ...defaultExternalIds, legacyMyWellResourceId: "1170", legacyMyWellPincode: '5063' } });
      await resourceApi.resourceRef("00006").set({ ...DefaultMyWellResource, id: "00006", externalIds: { ...defaultExternalIds, legacyMyWellResourceId: "1171", legacyMyWellPincode: '5063' } });
      await resourceApi.resourceRef("00007").set({ ...DefaultMyWellResource, id: "00007", externalIds: { ...defaultExternalIds, legacyMyWellResourceId: "1172", legacyMyWellPincode: '5063' } });

      //partial
      await resourceApi.resourceRef("00008").set({ ...DefaultMyWellResource, id: "00008", externalIds: { legacyMyWellPincode: '5064' } });

      //No external ids
      await resourceApi.resourceRef("00009").set({ ...DefaultMyWellResource, id: "00009", externalIds: { } });
      await resourceApi.resourceRef("00010").set({ ...DefaultMyWellResource, id: "00010" });
    });

    it('migrates the legacy pincodes and resourceIds', async () => {
      //Arrange
      const params = {
        maxQueryCount: 100,
        limit: 5,
        batchSize: 2,
      };

      //Act
      unsafeUnwrap(await Migrator.migrateLegacyPincodesAndResourceIds(firestore, orgId, params))

      //TODO: Perform a search and compare results length
      //Check the migration tags

      const searchResultsPincode = unsafeUnwrap(await searchApi.searchForResourceInGroup('313603', 'pincode', { limit: 10 }));
      const searchResultsPincode2 = unsafeUnwrap(await searchApi.searchForResourceInGroup('5063', 'pincode', { limit: 10 }));
      const searchResultsPincode3 = unsafeUnwrap(await searchApi.searchForResourceInGroup('5064', 'pincode', { limit: 10 }));
      const searchResultsResourceId = unsafeUnwrap(await searchApi.searchForResourceInGroup('1170', 'legacyResourceId', { limit: 10 }));

      //Assert
      assert.equal(searchResultsPincode.results.length, 4);
      assert.equal(searchResultsPincode2.results.length, 3);
      assert.equal(searchResultsResourceId.results.length, 1);
      assert.equal(searchResultsPincode3.results.length, 1);
    });


  
    this.afterAll(async () => {
      // //Clean up
      await resourceApi.resourceRef("00001").delete();
      await resourceApi.resourceRef("00002").delete();
      await resourceApi.resourceRef("00003").delete();
      await resourceApi.resourceRef("00004").delete();
      await resourceApi.resourceRef("00005").delete();
      await resourceApi.resourceRef("00006").delete();
      await resourceApi.resourceRef("00007").delete();
      await resourceApi.resourceRef("00008").delete();
      await resourceApi.resourceRef("00009").delete();
      await resourceApi.resourceRef("00010").delete();
    });
  });
});