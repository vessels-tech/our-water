import 'mocha';
import * as assert from 'assert';

import FirebaseApi from './FirebaseApi';
import { ResultType } from '../types/AppProviderTypes';
import firestore from './Firestore';
import ShortId from '../models/ShortId';


const orgId = process.env.ORG_ID;
const baseUrl = process.env.BASE_URL;

describe.only('Firebase Api', function() {
  this.timeout(10000);

  describe('ShortIds', function() {
    let shortId1;
    let shortId2; 
    before(async () => {
      //Create 2 new ids
      const result1 = await FirebaseApi.createShortId(orgId, 'longId_1');
      const result2 = await FirebaseApi.createShortId(orgId, 'longId_2');
      
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
      const result = await FirebaseApi.getLongId(orgId, '12345');

      console.log("result", result);

      //Assert
      assert.equal(result.type, ResultType.ERROR);
    });

    it('gets a long id for an existing shortId', async() => {
      //Arrange
      //Act
      const result = await FirebaseApi.getLongId(orgId, shortId1);

      console.log("result", result);
      if (result.type === ResultType.ERROR) {
        throw new Error(result.message);
      }

      //Assert
      assert.equal(result.result, 'longId_1');
    });


    after(async () => {
      //Cleanup the shortIds
      await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(shortId1).delete();
      await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(shortId2).delete();
      await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest').delete();
    })
  });

});