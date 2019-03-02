import { SomeResult, ResultType, makeSuccess, makeError, ErrorResult } from "ow_common/lib/utils/AppProviderTypes";


// import {this. } from './FirebaseAdmin';
import { Resource } from "../models/Resource";
import ShortId from "../models/ShortId";
import * as sleep from 'thread-sleep';
import { BasicAuthSecurity } from "soap";
import { pad, hashReadingId, resourceIdForResourceType } from "../utils";
import { isNullOrUndefined } from "util";
import * as admin from "firebase-admin";
import { Reading } from "../models/Reading";
type WriteResult = admin.firestore.WriteResult;

export type ShortIdLock = {
  id: string, //9 digit number as string
  lock: boolean,
}

export type BoundingBox = {
  minLat: number, 
  minLng: number, 
  maxLat: number, 
  maxLng: number
}

export type PageParams = {
  limit: number,
  startAfter?: FirebaseFirestore.DocumentSnapshot,
}

export type PageResult<T> = {
  result: T,
  hasNext: boolean,
  startAfter: FirebaseFirestore.DocumentSnapshot;
}

export function makePageResult<T>(startAfter: FirebaseFirestore.DocumentSnapshot, hasNext: boolean, result: T): PageResult<T> {
  return {
    result,
    hasNext,
    startAfter,
  }
}

export default class FirebaseApi {
  firestore: FirebaseFirestore.Firestore;

  constructor(firestore: FirebaseFirestore.Firestore) {
    this.firestore = firestore;
  }

  public batchSaveResources(docs: Resource[]): Promise<WriteResult[]> {
    if (docs.length === 0) {
      console.log('WARN: Tried to save a batch of resources, but resources was empty.');
      return Promise.resolve([]);
    }

    const batch = this.firestore.batch();
    //Pass in the resourceId here - very low chance of colission
    // docs.forEach(doc => doc.batchCreate(batch, this.firestore, doc.id));
    docs.forEach(doc => {
      console.log("creating in batch", doc.id);
      doc.batchCreate(batch, this.firestore, doc.id)
    });
    return batch.commit();
  }

  public async batchSaveReadings(docs: Reading[]): Promise<WriteResult[]> {
    if (docs.length === 0) {
      console.log('WARN: Tried to save a batch of readings, but readings was empty.');
      return Promise.resolve([]);
    }

    const batch = this.firestore.batch();
    //Readings are unique by their timestamp + resourceId.
    docs.forEach(doc => {
      // console.log("batchSaveReadings, doc", hashReadingId(doc.resourceId, doc.timeseriesId, doc.datetime));
      doc.batchCreate(batch, this.firestore, hashReadingId(doc.resourceId, doc.timeseriesId, doc.datetime))
    });
    return batch.commit();
  }

  /**
   * 
   * @param fs 
   * @param docs 
   * @param docIds - optional. If provided, will use these ids instead of the doc's id
   */
  public async batchDelete(fs: admin.firestore.Firestore, docs: Reading[], docIds?: string[]): Promise<any> {
    if (docs.length === 0) {
      console.warn('Tried to save a batch of resources, but readings was empty.');
      return Promise.resolve(true);
    }

    const batch = fs.batch();

    if (docIds && docIds.length !== docs.length) {
      return Promise.reject(new Error("docs.length and docIds.length must match"));
    }

    if (docIds) {
      docs.forEach((doc, idx) => {
        const id = docIds[idx];
        doc.batchDelete(batch, this.firestore, id);
      });
    } else {
      docs.forEach(doc => doc.batchDelete(batch, this.firestore));
    }

    return batch.commit();
  }

  /**
   * ResourcesNearLocation
   * 
   * Get the resources near a given location
   */
  public async resourcesNearLocation(orgId: string, latitude: number, longitude: number, distance: number): 
  Promise<SomeResult<Resource[]>> {

    const distanceMultiplier = 100; //TODO: tune this value based on the queries we are getting back once we can see it a map

    const minLat = latitude - distanceMultiplier * distance;
    const minLng = longitude - distanceMultiplier * distance;
    const maxLat = latitude + distanceMultiplier * distance;
    const maxLng = longitude + distanceMultiplier * distance;

    return this.firestore.collection(`/org/${orgId}/resource`)
      .where('coords', '>=', new admin.firestore.GeoPoint(minLat, minLng))
      .where('coords', '<=', new admin.firestore.GeoPoint(maxLat, maxLng)).get()
      .then(snapshot => {
        const resources = []
        snapshot.forEach(doc => {
          const data = doc.data();
          data.id = doc.id;

          // Filter based on longitude. TODO: remove this once google fixes this query
          if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
            return;
          }

          resources.push(data);
        });

        return makeSuccess<Resource[]>(resources);
      })
      .catch(err => makeError<Resource[]>(err.message));
  }


  /**
   * Readings In Bounding Box
   * 
   * Get the readings taken within a bounding box
   */
  public async readingsWithinBoundingBox(orgId: string, bbox: BoundingBox, pageParams: PageParams ):
  Promise<SomeResult<Reading[]>> {
    const { minLat, minLng, maxLat, maxLng } = bbox;

    return this.firestore.collection(`/org/${orgId}/reading`)
    .where('coords', '>=', new admin.firestore.GeoPoint(minLat, minLng))
    .where('coords', '<=', new admin.firestore.GeoPoint(maxLat, maxLng))
    //We need to order by coords to make sure the pagination works
    .orderBy('coords')
      //TODO: implement pagination
      .limit(pageParams.limit)
      .get()
      .then(snapshot => {
        const readings = []
        snapshot.forEach(doc => {
          const data = doc.data();
          data.id = doc.id;

          // Filter based on longitude. TODO: remove this once google fixes this query
          if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
            return;
          }

          readings.push(data);
        });

        return makeSuccess<Reading[]>(readings);
      })
      .catch(err => makeError<Reading[]>(err.message))
  }


  /**
   * Readings In Bounding Box
   * 
   * Get the readings taken within a bounding box
   */
  public async readingsWithinBoundingBoxPaginated(orgId: string, bbox: BoundingBox, pageParams: PageParams ):
  Promise<SomeResult<PageResult<Reading[]>>> {
    const { minLat, minLng, maxLat, maxLng } = bbox;
    // console.log(`Coords are: min:(${minLat},${minLng}), max:(${maxLat},${maxLng}).`);

    return Promise.resolve()
    .then(() => {
      if (pageParams.startAfter) {
        return this.firestore.collection(`/org/${orgId}/reading`)
          .where('coords', '>=', new admin.firestore.GeoPoint(minLat, minLng))
          .where('coords', '<=', new admin.firestore.GeoPoint(maxLat, maxLng))
          //We need to order by coords to make sure the pagination works
          .orderBy('coords')
          .startAfter(pageParams.startAfter)
          .limit(pageParams.limit)
          .get()
      }

      return this.firestore.collection(`/org/${orgId}/reading`)
        .where('coords', '>=', new admin.firestore.GeoPoint(minLat, minLng))
        .where('coords', '<=', new admin.firestore.GeoPoint(maxLat, maxLng))
        //We need to order by coords to make sure the pagination works
        .orderBy('coords')
        .limit(pageParams.limit)
        .get()
    })
    .then(snapshot => {
      const readings = []
      snapshot.forEach(doc => {
        const data = doc.data();
        data.id = doc.id;

        // Filter based on longitude. TODO: remove this once google fixes this query
        if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
          // return;
        }

        readings.push(data);
      });

      const startAfter = snapshot.docs[snapshot.docs.length - 1];
      let hasNext = false;
      if (snapshot.docs.length === pageParams.limit) {
        hasNext = true;
      }
      const result = makeSuccess(makePageResult(startAfter, hasNext, readings));
      return result;
    })
    .catch(err => makeError<PageResult<Reading[]>>(err.message))
  }


  //
  // ShortId
  // ----------------------------------------

  /**
   * GetLongId
   * 
   * Get the longId given a short Id and orgId
   */
  public async getLongId(orgId: string, shortId: string): Promise<SomeResult<string>> {
    //TODO: update the lastUsed
    try {
      const result = await this.firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(shortId).get();
      if (isNullOrUndefined(result.data())) {
        return {
          type: ResultType.ERROR,
          message: `No id mapping found for orgId: ${orgId}, shortId: ${shortId}.`
        }
      }
      //@ts-ignore
      const shortIdObj = ShortId.deserialize(result.data());

      return {
        type: ResultType.SUCCESS,
        result: shortIdObj.longId,
      };
    } catch (err) {
      return {
        type: ResultType.ERROR,
        message: err.message,
      }
    }
  }

  /**
   * GetShortId
   * 
   * Get the shortId given the longId and orgId
   */
  public async getShortId(orgId: string, longId: string): Promise<SomeResult<ShortId>> {
    //TODO: update the lastUsed

    return this.firestore.collection('org').doc(orgId).collection(ShortId.docName)
      .where('longId', '==', longId).get()
    .then((snapshot: any) => {
      const shortIds = []
      snapshot.forEach(doc => {
        const data = doc.data();
        data.id = doc.id;
        shortIds.push(data);
      });

      if (shortIds.length > 0) {
        console.warn(`found more than 1 short id for longId ${longId}. Returning the first only.`);
      }

      if (shortIds.length === 0) {
        return makeError<ShortId>(`Couldn't find a shortId for id: ${longId}`);
      }

      const shortId = shortIds[0];
      const shortIdObj = ShortId.deserialize(shortId);

      return makeSuccess<ShortId>(shortIdObj);
      
    })
    .catch((err: Error) => makeError<ShortId>(err.message));
  }


  /**
   * CreateShortId
   * 
   * Test of CreateShortId with Firebase Transactions
   */
  public async createShortId(orgId: string, longId: string): Promise<SomeResult<ShortId>> {
    const existingShortIdResult = await this.getShortId(orgId, longId);
    if (existingShortIdResult.type === ResultType.SUCCESS) {
      return existingShortIdResult;
    }

    //I think the transactions handle the retries for us
    const lockRef = this.firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest');
    let shortIdLock: ShortIdLock;
    let shortIdRef;
    let shortId;

    return this.firestore.runTransaction(tx => {
      return tx.get(lockRef)
      .then(doc => {
        //@ts-ignore
        shortIdLock = doc.data();
        //Lock has never been created. Set to initial value
        if (!shortIdLock) {
          shortIdLock = { id: '100000', lock: false };
          return tx.set(lockRef, shortIdLock);
        }
        //Another write is currently happening
        if(shortIdLock.lock === true) {
          //Hopefully throwing an error here will make the tx retry
          console.log(`tx is locked for shortIdLock: ${shortIdLock}.`);
          throw new Error(`tx is locked for shortIdLock: ${shortIdLock}.`);
        }
      })
      .then(() => {
        //Lock:
        shortIdLock.lock = true;
        return tx.set(lockRef, shortIdLock);
      })
      .then(() => {
        //Set the new value
        const nextId = pad(parseInt(shortIdLock.id) + 1, 9);
        shortIdRef = this.firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(nextId);
        shortId = ShortId.fromShortId(orgId, {
          shortId: nextId,
          longId,
          lastUsed: new Date(),
        });

        return tx.set(shortIdRef, shortId.serialize());
      })
      .then(() => {
        //Unlock
        return tx.set(lockRef, { id: shortId.shortId, lock: false });
      })
    })
    .then(result => makeSuccess(shortId))   
    .catch((err: Error) => {
      console.log("TX Error", err);
      return makeError<ShortId>(err.message);
    });
  }

  /**
   * Change the user's status
   */
  public async changeUserStatus(orgId: string, userId: string, status: 'Approved' | 'Rejected'): Promise<SomeResult<void>> {
    return this.firestore.collection('org').doc(orgId).collection('user').doc(userId).set({status}, {merge: true})
    .then(() => makeSuccess<void>(undefined))
    .catch(err => makeError<void>(err.message))
  }

  /**
   * syncPendingForUser
   * 
   * Save the user's pendingResources and pendingReadings and delete from their collection in user.
   * returns an array of pending resources
   */
  public async syncPendingForUser(orgId: string, userId: string): Promise<SomeResult<Array<string>>> {
    const errorResults: ErrorResult[] = [];

    //Get the user's pending resources and readings
    const pendingResourceResult = await this.getPendingResources(orgId, userId);
    const pendingReadingsResult = await this.getPendingReadings(orgId, userId);
    
    let pendingResources;
    let pendingReadings;
    if (pendingResourceResult.type === ResultType.ERROR) {
      errorResults.push(pendingResourceResult);
    } else {
      pendingResources = pendingResourceResult.result;
    }

    if (pendingReadingsResult.type === ResultType.ERROR) {
      errorResults.push(pendingReadingsResult);
    } else {
      pendingReadings = pendingReadingsResult.result;
    }

    if (errorResults.length > 0) {
      console.log("Error: ", errorResults);
      return Promise.resolve(makeError<Array<string>>(errorResults.reduce((acc, curr) => `${acc} ${curr.message},\n`, '')));
    }

    //map them to the Firebase Domain (if needed)
    //Save to public
    let batchResultResources;
    try {
      batchResultResources = await this.batchSaveResources(pendingResources)
    } catch (err) {
      errorResults.push({type: ResultType.ERROR, message:err});
    }

    //TODO: transform the and pendingReadings where isResourcePending=true, and substitue the new resourceId.
    

    let batchResultReadings;
    try {
      batchResultReadings = await this.batchSaveReadings(pendingReadings);
    } catch(err) {
      errorResults.push({ type: ResultType.ERROR, message: err });
    }

    if (errorResults.length > 0) {
      console.log("Error: ", errorResults);
      return Promise.resolve(makeError<Array<string>>(errorResults.reduce((acc, curr) => `${acc} ${curr.message},\n`, '')));
    }

    //Delete pending resources and readings
    //We get them again since our first array has been modified in place.
    const pendingResourceResult2 = await this.getPendingResources(orgId, userId);
    const pendingReadingsResult2 = await this.getPendingReadings(orgId, userId);

    if (pendingResourceResult2.type === ResultType.ERROR) {
      errorResults.push(pendingResourceResult2);
    } 

    if (pendingReadingsResult2.type === ResultType.ERROR) {
      errorResults.push(pendingReadingsResult2);
    }

    if (errorResults.length > 0) {
      console.log("Error: ", errorResults);
      return Promise.resolve(makeError<Array<string>>(errorResults.reduce((acc, curr) => `${acc} ${curr.message},\n`, '')));
    }

    //@ts-ignore
    const deleteResourcesResult = await this.batchDeletePendingResources(orgId, userId, pendingResourceResult2.result);
    //@ts-ignore
    const deleteReadingsResult = await this.batchDeletePendingReadings(orgId, userId, pendingReadingsResult2.result);

    if (deleteResourcesResult.type === ResultType.ERROR) {
      errorResults.push(deleteResourcesResult);
    }
    if (deleteReadingsResult.type === ResultType.ERROR) {
      errorResults.push(deleteReadingsResult);
    }

    if (errorResults.length > 0) {
      console.log("Error: ", errorResults);
      return Promise.resolve(makeError<Array<string>>(errorResults.reduce((acc, curr) => `${acc} ${curr.message},\n`, '')));
    }

    //This will always be true, otherwise we would have errors
    const savedResourceIds = [];
    if (pendingResourceResult2.type === ResultType.SUCCESS) {
      pendingResourceResult2.result.forEach(r => savedResourceIds.push(r.id));
    }

    return makeSuccess<Array<string>>(savedResourceIds);
  }

  //
  // COMMON - Can be refactored to combine with front end Firebase Api
  //------------------------------------------------------------------------

  /**
   * getPendingResources
   * 
   * Get the Pending Resources from the user's object.
   * 
   * @param orgId 
   * @param userId 
   */
  public async getPendingResources(orgId: string, userId: string): Promise<SomeResult<Resource[]>> {
    return this.userDoc(orgId, userId).collection('pendingResources').get()
      .then((sn: any) => {
        const resources: Resource[] = [];
        //TODO: not sure if deser will work
        sn.forEach((doc: any) => resources.push(Resource.fromDoc(doc, doc.id)));
        
        return makeSuccess(resources);
      })
      .catch((err: Error) => makeError(err.message + err.stack))
  }

  /**
   * getPendingReadings
   *
   * Get the Pending Readings from the user's object.
   *
   * @param orgId
   * @param userId
   */
  public async getPendingReadings(orgId: string, userId: string): Promise<SomeResult<Reading[]>> {
    return this.userDoc(orgId, userId).collection('pendingReadings').get()
      .then((sn: any) => {
        const readings: Reading[] = [];
        //TODO: not sure if deser will work
        sn.forEach((doc: any) => readings.push(Reading.deserialize(doc, doc.id)));
        
        return makeSuccess(readings);
      })
      .catch((err: Error) => makeError(err.message + err.stack))
  }


  /**
  * deletePendingResource
  * 
  * Delete a pending resource from the user's pending resource list
  */
  public async deletePendingResourceFromUser(orgId: string, userId: string, resourceId: string): Promise<SomeResult<void>> {
    return await this.userDoc(orgId, userId).collection('pendingResources').doc(resourceId).delete()
      .then(() => makeSuccess(undefined))
      .catch((err: Error) => makeError(err.message));
  }


  /**
   * batchDeletePendingResources
   * 
   * Delete an array of pending Resources in a batch
   * 
   * @param orgId 
   * @param userId 
   * @param resources 
   */
  public batchDeletePendingResources(orgId: string, userId: string, resources: Resource[]): Promise<SomeResult<void>> {
    if (resources.length === 0) {
      console.warn('Tried to delete a batch of resources, but resources was empty.');
      return Promise.resolve(makeSuccess<void>(undefined));
    }

    const batch = this.firestore.batch();
    resources.forEach(r => {
      const ref = this.firestore.collection('org').doc(orgId).collection('user').doc(userId).collection('pendingResources').doc(r.id);
      batch.delete(ref);
    });

    return batch.commit()
    .then((res: any) => makeSuccess<void>(undefined))
    .catch((error: Error) => makeError<void>(error.message + error.stack))
  }

  /**
   * batchDeletePendingReadings
   * 
   * Delete an array of pending Resources in a batch
   * 
   * @param orgId 
   * @param userId 
   * @param readings
   */
  public batchDeletePendingReadings(orgId: string, userId: string, readings: Reading[]): Promise<SomeResult<void>> {
    if (readings.length === 0) {
      console.warn('Tried to delete a batch of readings, but readings was empty.');
      return Promise.resolve(makeSuccess<void>(undefined));
    }

    const batch = this.firestore.batch();
    readings.forEach(r => {
      const ref = this.firestore.collection('org').doc(orgId).collection('user').doc(userId).collection('pendingReadings').doc(r.id);
      batch.delete(ref);
    });

    return batch.commit()
    .then(() => makeSuccess<void>(undefined))
    .catch((error: Error) => makeError<void>(error.message + error.stack))
  }

  /**
   * Doc shortcuts
   */
  public userDoc(orgId: string, userId: string): any {
    return this.firestore.collection('org').doc(orgId).collection('user').doc(userId)
  }

  public resourceCol(orgId: string): FirebaseFirestore.CollectionReference {
    return this.firestore.collection('org').doc(orgId).collection('resource');
  }

  public readingCol(orgId: string): FirebaseFirestore.CollectionReference {
    return this.firestore.collection('org').doc(orgId).collection('reading');
  }

  public shortIdCol(orgId: string): any {
    return this.firestore.collection('org').doc(orgId).collection('shortId');
  }

}