import 'mocha';
import * as assert from 'assert';

import FirebaseApi, { BoundingBox, PageParams } from './FirebaseApi';
import { ResultType, SomeResult } from '../types/AppProviderTypes';
import { firestore } from '../../test/TestFirebase';
import * as MockFirebase from 'mock-cloud-firestore';


import ShortId from '../models/ShortId';
import { pad, hashReadingId } from '../utils';
import { Reading } from '../models/Reading';
import { ResourceType, resourceTypeFromString } from "../enums/ResourceType";
import ResourceIdType from '../types/ResourceIdType';
import { OWGeoPoint } from 'ow_types';
import FirestoreDoc from '../models/FirestoreDoc';
import * as moment from 'moment';
import { pendingResourcesData, basicResource, basicReading } from '../test/Data';
import { Resource } from '../models/Resource';

const orgId = process.env.ORG_ID;
const baseUrl = process.env.BASE_URL;

describe('Firebase Api', function() {
  this.timeout(10000);

  describe('Readings', function() {
    let newReadings;
    const readingIds = [];
    const fbApi = new FirebaseApi(firestore);


    before(async () => {
      //TODO: create a bunch of readings
      newReadings = [
        new Reading(orgId, 'resA', new OWGeoPoint(35.0123, 35.0123), ResourceType.well, {}, moment('2018-01-01').toDate(), 100, ResourceIdType.none()),
        new Reading(orgId, 'resA', new OWGeoPoint(35.0123, 35.0123), ResourceType.well, {}, moment('2018-01-02').toDate(), 101, ResourceIdType.none()),
        new Reading(orgId, 'resB', new OWGeoPoint(39.1234, 34.0123), ResourceType.well, {}, moment('2018-01-02').toDate(), 102, ResourceIdType.none()),
        new Reading(orgId, 'resB', new OWGeoPoint(39.1234, 34.0123), ResourceType.well, {}, moment('2018-01-02').toDate(), 103, ResourceIdType.none()),
        new Reading(orgId, 'resC', new OWGeoPoint(75.0123, 45.0123), ResourceType.well, {}, moment('2018-01-02').toDate(), 104, ResourceIdType.none()),
        new Reading(orgId, 'resD', new OWGeoPoint(39.2234, 34.0123), ResourceType.well, {}, moment('2018-01-02').toDate(), 105, ResourceIdType.none()),
      ];

      await fbApi.batchSaveReadings(newReadings);
      newReadings.forEach(r => readingIds.push(hashReadingId(r.resourceId, r.timeseriesId, r.datetime)));
    });

    it('Gets the readings within the bounding box', async () => {
      //Arrange
      const bbox: BoundingBox = {
        minLat: 35.0122,
        maxLat: 39.2,
        minLng: 34.0122,
        maxLng: 40,
      };
      const pageParams: PageParams = { limit: 100 };
      
      //Act
      const readingsResult = await fbApi.readingsWithinBoundingBox(orgId, bbox, pageParams);
      if (readingsResult.type === ResultType.ERROR) {
        throw new Error(readingsResult.message);
      }

      //Assert
      assert.equal(readingsResult.result.length, 3);
    });

    after(async () => {
      //Clean up the readings;
      // FirebaseApi.batchDelete(firestore, newReadings, readingIds);
    })
  });


  describe('ShortIds', function() {
    let shortId1;
    let shortId2; 
    const fbApi = new FirebaseApi(firestore);

    before(async () => {
      //Create 2 new ids
      const result1 = await fbApi.createShortId(orgId, 'longId_1');
      const result2 = await fbApi.createShortId(orgId, 'longId_2');
      
      if (result1.type !== ResultType.SUCCESS && result2.type !== ResultType.SUCCESS ) {
        throw new Error(`couldn't create shortIds`);   
      }

      //Still need these if statements because TS isn't smart enough to pick up on the Error.
      if (result1.type === ResultType.SUCCESS) {
        shortId1 = result1.result.shortId;
      }

      if (result2.type === ResultType.SUCCESS) {
        shortId2 = result2.result.shortId;
      }
    });

    it('fails to get a long Id that does not exist', async () => {
      //Arrange
      
      //Act
      const result = await fbApi.getLongId(orgId, '12345');

      //Assert
      assert.equal(result.type, ResultType.ERROR);
    });

    it('gets a long id for an existing shortId', async() => {
      //Arrange
      //Act
      const result = await fbApi.getLongId(orgId, shortId1);

      console.log("result", result);
      if (result.type === ResultType.ERROR) {
        throw new Error(result.message);
      }

      //Assert
      assert.equal(result.result, 'longId_1');
    });

    it('does not allow creating multiple short ids with the same long id');
    it('gets the long id for a short Id');

    after(async () => {
      //Cleanup the shortIds
      await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(shortId1).delete();
      await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(shortId2).delete();
      await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest').delete();
    })
  });


  describe('shortId stress tests', function() {
    this.timeout(20000);
    const fbApi = new FirebaseApi(firestore);

    //It seems like it can handle about 5 simultaneous writes.
    //That's good enough for our purposes now.
    const n = 4;

    before(async () => {
      //Create 2 new ids
      const range = Array.from(Array(n).keys())
      return Promise.all(range.map(i => fbApi.createShortId(orgId, `longId_${i}`)))
      .then((results: SomeResult<ShortId>[]) => {
        results.forEach(result => {
          if (result.type === ResultType.ERROR) {
            throw new Error(result.message);
          }
        });
      });
    });

    it("creates many shortIds at once without race conditions", async () => {
      //TODO: create n shortIds simultaneously
      //get the latest shortId, make sure its id is equal to  000100000 + n
      const doc = await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest').get()
      const latest = doc.data();
      assert.equal(latest.id, pad(100000 + n, 9));
    });

    //TODO: cleanup
    after(async () => {
      //Cleanup the shortIds
      const range = Array.from(Array(n).keys())
      Promise.all(range.map(i => 
        firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(pad(100001 + i, 9)).delete()
      ));
      await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest').delete();
    })
  });


  describe('Creates Resources and Readings in batches', function() {
    const mockFirestore = new MockFirebase({}).firestore();
    const fbApi = new FirebaseApi(mockFirestore);
    const userId = 'user_a';

    it('batchSaveResources()', async () => {
      //Arrange
      const resourcesToSave = [ basicResource(orgId) ];

      //Act
      const result = await fbApi.batchSaveResources(resourcesToSave);
      const savedResources = await fbApi.resourceCol(orgId).get()
        .then(sn => {
          const resources = [];
          sn.forEach(doc => resources.push(doc.data()));
          return resources;
        });
      

      //Assert
      assert.equal(resourcesToSave.length, savedResources.length);
    });


    it('batchSaveReadings()', async () => {
      //Arrange
      const readingsToSave = [basicReading(orgId)];

      //Act
      const result = await fbApi.batchSaveReadings(readingsToSave);
      const savedReadings = await fbApi.readingCol(orgId).get()
        .then(sn => {
          const readings = [];
          sn.forEach(doc => readings.push(doc.data()));
          return readings;
        });


      //Assert
      assert.equal(readingsToSave.length, savedReadings.length);
    });
  });

  describe('Deletes Resources and Readings in Batches', function() {
    const mockFirestore = new MockFirebase(pendingResourcesData(orgId)).firestore();
    const fbApi = new FirebaseApi(mockFirestore);
    const userId = 'user_a';

    it('Deletes a batch of pendingResources succesfully', async () => {
      //Arrange
      const resourcesResult = await fbApi.getPendingResources(orgId, userId);
      if (resourcesResult.type === ResultType.ERROR) {
        throw new Error(resourcesResult.message);
      }

      //Act
      const deleteResult = await fbApi.batchDeletePendingResources(orgId, userId, resourcesResult.result);

      //Assert
      if (deleteResult.type === ResultType.ERROR) {
        throw new Error(deleteResult.message);
      }
      const resourcesResult2 = await fbApi.getPendingResources(orgId, userId);
      if (resourcesResult2.type === ResultType.ERROR) {
        throw new Error(resourcesResult2.message);
      }

      assert.equal(resourcesResult2.result.length, 0);
    });


    it('Deletes a batch of pendingReadings succesfully', async () => {
      //Arrange
      const readingsResult = await fbApi.getPendingReadings(orgId, userId);
      if (readingsResult.type === ResultType.ERROR) {
        throw new Error(readingsResult.message);
      }

      //Act
      const deleteResult = await fbApi.batchDeletePendingReadings(orgId, userId, readingsResult.result);

      //Assert
      if (deleteResult.type === ResultType.ERROR) {
        throw new Error(deleteResult.message);
      }
      const readingsResult2 = await fbApi.getPendingReadings(orgId, userId);
      if (readingsResult2.type === ResultType.ERROR) {
        throw new Error(readingsResult2.message);
      }

      assert.equal(readingsResult2.result.length, 0);
    });
  })

  describe('Pending Resources and Readings', function() {
    const mockFirestore = new MockFirebase(pendingResourcesData(orgId)).firestore();
    const fbApi = new FirebaseApi(mockFirestore);

    it('getPendingResources()', async () => {
      //Arrange
      //Act
      const resourcesResult = await fbApi.getPendingResources(orgId, 'user_a');

      //Assert
      if (resourcesResult.type === ResultType.ERROR) {
        throw new Error(resourcesResult.message);
      }

      assert.equal(resourcesResult.result.length, 3);
    });

    it('getPendingReadings()', async () => {
      //Arrange
      //Act
      const readingsResult = await fbApi.getPendingReadings(orgId, 'user_a');

      //Assert
      if (readingsResult.type === ResultType.ERROR) {
        throw new Error(readingsResult.message);
      }

      assert.equal(readingsResult.result.length, 2);
    });
  });
});