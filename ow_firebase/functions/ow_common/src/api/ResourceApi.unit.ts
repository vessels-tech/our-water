import 'mocha';
import * as assert from 'assert';
//@ts-ignore
import MockFirestore from 'mock-cloud-firestore';
import { ResourceApi } from './ResourceApi';
// import { SearchApi, SearchPageParams } from './SearchApi';
// import { unsafeUnwrap } from '../utils/AppProviderTypes';
import { admin } from '../test/TestFirebase';
import { DefaultResource } from '../model';
import { unsafeUnwrap } from '../utils';
// import { DefaultShortId, DefaultMyWellResource } from '../model';
type Firestore = admin.firestore.Firestore;

const {
  orgId,
} = require('../test/testConfig.json');


describe('Resource Api', function () {
  this.timeout(5000);
  const firestore: Firestore = new MockFirestore({}).firestore();
  const resourceApi = new ResourceApi(firestore, orgId);


  this.beforeAll(async () => {
    //TODO: Add a bunch of shortIds
    await resourceApi.resourceRef("00001").set({ ...DefaultResource, id: "00001", groups: { country: "IN", pincode: "313603" } });
    await resourceApi.resourceRef("00002").set({ ...DefaultResource, id: "00002", groups: { country: "IN", pincode: "313603" } });
    await resourceApi.resourceRef("00003").set({ ...DefaultResource, id: "00003", groups: { country: "IN", pincode: "313603" } });
    await resourceApi.resourceRef("00004").set({ ...DefaultResource, id: "00004", groups: { country: "IN", pincode: "313603" } });
    await resourceApi.resourceRef("00005").set({ ...DefaultResource, id: "00005", groups: { country: "IN", pincode: "313603" } });
  });


  it('gets a resource for an id', async () => {
    //Arrange
    const resourceId = "00001";

    //Act
    const resource = unsafeUnwrap(await resourceApi.getResourceForId(resourceId));

    //Assert
    assert.equal(resource.id, resourceId);
  });

  it('gets a list of resources from a list of ids', async () => {
    //Arrange
    const resourceIds = [
      "00001", 
      "00002", 
      "00003", 
      "00005", 
    ]

    //Act
    const resources = unsafeUnwrap(await resourceApi.getResourcesForIds(resourceIds));

    //Assert
    assert.equal(resources.length, resourceIds.length);
  });

  this.afterAll(async () => {
    await resourceApi.resourceRef("00001").delete();
    await resourceApi.resourceRef("00002").delete();
    await resourceApi.resourceRef("00003").delete();
    await resourceApi.resourceRef("00004").delete();
    await resourceApi.resourceRef("00005").delete();
  });
});