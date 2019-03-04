import { Firestore, QuerySnapshot, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { SomeResult, ResultType } from "../src/common/types/dep_AppProviderTypes";
import { makeSuccess, makeError } from "ow_common/lib/utils/AppProviderTypes";
import { Resource, DefaultMyWellResource, ResourceType, } from "ow_common/lib/model";
import { safeGetNested } from "ow_common/lib/utils";
import { chunkArray } from '../src/common/utils';



export enum MigrationTag {
  AA_ADD_LEGACY_TO_GROUPS ='AA_ADD_LEGACY_TO_GROUPS',
}


const getResourcesInBatch = (firestore: FirebaseFirestore.Firestore, orgId: string, startAfter?: QueryDocumentSnapshot, limit?: number): Promise<SomeResult<QuerySnapshot>> => {
  let query = firestore.collection('org').doc(orgId).collection('resource')
  .where('externalIds.legacyMyWellPincode', '>', '0');

  if (startAfter) {;
    query = query.startAfter(startAfter)
  }

  if (limit) {
    query = query.limit(limit);
  }

  return query.get()
  .then(qs => makeSuccess(qs))
  .catch((error: Error) => makeError<QuerySnapshot>(error.message));
}

const updateFieldsInBatch = (batch: FirebaseFirestore.WriteBatch, ref: FirebaseFirestore.DocumentReference, fields: any): void => {
  batch.set(ref, fields, { merge: true});
}

const commitBatch = (batch: FirebaseFirestore.WriteBatch): Promise<SomeResult<Array<FirebaseFirestore.WriteResult>>> => {
  return batch.commit()
  .then(res => makeSuccess(res))
  .catch((err: Error) => makeError<Array<FirebaseFirestore.WriteResult>>(err.message));
}

export default class Migrator {


  /**
   * migrateLegacyPincodesAndResourceIds
   * 
   * Migrate legacy resources to use the updated groups field.
   * 
   * @param firestore 
   * @param orgId 
   * @param params 
   */

  public static async migrateLegacyPincodesAndResourceIds(firestore: FirebaseFirestore.Firestore, orgId: string, params: { maxQueryCount: number, limit: number, batchSize: number }): Promise<SomeResult<any>> {
    /* Tweakable params */
    // const maxQueryCount = 100; //absolute maximum number of queries
    // const limit = 100; //limit for each individual batch size
    // const batchSize = 250 // size of each batch when saving
    const {
      maxQueryCount,
      limit,
      batchSize,
    } = params;

    const queries: number[] = [...Array(maxQueryCount).keys()];
    const tag = MigrationTag.AA_ADD_LEGACY_TO_GROUPS;

    //Get all of the resourceIds where "externalIds.legacyMyWellPincode" > 0, in pages of 10
    const resources: Resource[] = [];
    let startAfter: QueryDocumentSnapshot;
  
    /*
      Reduce over the maxQueryCount.
      Add resourceids to the list.
      If it encounters any error, error result will be returned immediately
     */
    const getResourcesResult = await queries.reduce(async (acc: Promise<SomeResult<QuerySnapshot>>) => {
      const lastResult = await acc;
      if (lastResult.type === ResultType.ERROR) {
        return Promise.resolve(lastResult);
      }
      const snapshot = lastResult.result;
      if (!snapshot) {
        return getResourcesInBatch(firestore, orgId, startAfter, limit); 
      }
    

      if (snapshot.docs.length > 0) {
        startAfter = snapshot.docs[snapshot.docs.length - 1];
      } else {
        //Keep returning this result so we don't make unnecessary empty requests
        return Promise.resolve(lastResult);
      }
      
      //This may be dangerous...
      snapshot.forEach(doc => resources.push({
        ...DefaultMyWellResource,
        ...doc.data(),
        id: doc.id,
      }));
      return getResourcesInBatch(firestore, orgId, startAfter, limit);
    }, Promise.resolve(makeSuccess<QuerySnapshot>(undefined)));

    if (getResourcesResult.type === ResultType.ERROR) {
      return getResourcesResult;
    }

    /*
      Arrange into batches and save, using the merge property.
    */
   const resourceBatches = chunkArray(resources, batchSize);
    const saveResourcesResult = await resourceBatches.reduce(async (acc: Promise<SomeResult<any>>, curr: Resource[], idx) => {
     const lastResult = await acc;
     if (lastResult.type === ResultType.ERROR) {
       return Promise.resolve(lastResult);
     }

     if (lastResult.result) {
       console.log(`Saved batch ${idx}, resourcesCount: ${lastResult.result.length}`)
     }

     const batch = firestore.batch();
     curr.forEach(r => {
      const pincode = safeGetNested(r, ['externalIds', 'legacyMyWellPincode']);
      const legacyResourceId = safeGetNested(r, ['externalIds', 'legacyMyWellResourceId']);

      if (!pincode && !legacyResourceId) {
        console.log("WARNING: Empty pincode AND legacyResourceId for resourceId", r.id);
        return;
      }

       //TODO: check that Merge accurately merges nested fields
       const ref = firestore.collection('org').doc(orgId).collection('resource').doc(r.id);
       updateFieldsInBatch(batch, ref, { 
         groups: {
           pincode,
           legacyResourceId,
         },
         lastMigrationTag: tag,
         updatedAt: new Date(),
       });
     });

     return commitBatch(batch);
   }, Promise.resolve(makeSuccess<void>(undefined)));

    if (saveResourcesResult.type === ResultType.ERROR) {
      return saveResourcesResult;
    }

    return makeSuccess<void>(undefined);
  }
}