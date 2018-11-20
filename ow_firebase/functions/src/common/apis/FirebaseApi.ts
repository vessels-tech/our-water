import { SomeResult, ResultType } from "../types/AppProviderTypes";

import firestore from './Firestore';
import { Resource } from "../models/Resource";
import ShortId from "../models/ShortId";
import * as sleep from 'thread-sleep';
import { BasicAuthSecurity } from "soap";
import { pad } from "../utils";
import { isNullOrUndefined } from "util";
import { OWGeoPoint } from "ow_types";



export type ShortIdLock = {
  id: string, //9 digit number as string
  lock: boolean,
}

export default class FirebaseApi {


  /**
   * ResourcesNearLocation
   * 
   * Get the resources near a given location
   */
  public static async resourcesNearLocation(orgId: string, latitude: number, longitude: number, distance: number): 
  Promise<SomeResult<Resource[]>> {

    const distanceMultiplier = 100; //TODO: tune this value based on the queries we are getting back once we can see it a map

    const minLat = latitude - distanceMultiplier * distance;
    const minLng = longitude - distanceMultiplier * distance;
    const maxLat = latitude + distanceMultiplier * distance;
    const maxLng = longitude + distanceMultiplier * distance;

    console.log(`Coords are: min:(${minLat},${minLng}), max:(${maxLat},${maxLng}).`);

    return firestore.collection(`/org/${orgId}/resource`)
      .where('coords', '>=', new OWGeoPoint(minLat, minLng))
      .where('coords', '<=', new OWGeoPoint(maxLat, maxLng)).get()
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

        return {
          type: ResultType.SUCCESS,
          result: resources,
        }
      })
      .catch(err => {
        return {
          type: ResultType.ERROR,
          message: err.message,
        }
      });
  }


  //
  // ShortId
  // ----------------------------------------


  /**
   * GetLongId
   * 
   * Get the longId given a short Id and orgId
   */
  public static async getLongId(orgId: string, shortId: string): Promise<SomeResult<string>> {
    //TODO: update the lastUsed
    try {
      const result = await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(shortId).get();
      if (isNullOrUndefined(result.data())) {
        return {
          type: ResultType.ERROR,
          message: `No id mapping found for orgId: ${orgId}, shortId: ${shortId}.`
        }
      }
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
  public static async getShortId(orgId: string, longId: string): Promise<SomeResult<ShortId>> {
    //TODO: update the lastUsed

    return firestore.collection('org').doc(orgId).collection(ShortId.docName)
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
        return {
          type: ResultType.ERROR,
          message: `Couldn't find a shortId for id: ${longId}`,
        }
      }

      const shortId = shortIds[0];
      const shortIdObj = ShortId.deserialize(shortId);

      return {
        type: ResultType.SUCCESS,
        result: shortIdObj
      }
    })
    .catch((err: any) => {
      return {
        type: ResultType.ERROR,
        message: err.message,
      }
    });
  }


  /**
   * CreateShortId
   * 
   * Test of CreateShortId with Firebase Transactions
   */
  public static async createShortId(orgId: string, longId: string): Promise<SomeResult<ShortId>> {
    const existingShortIdResult = await this.getShortId(orgId, longId);
    if (existingShortIdResult.type === ResultType.SUCCESS) {
      return existingShortIdResult;
    }

    //I think the transactions handle the retries for us
    const lockRef = firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest');
    let shortIdLock: ShortIdLock;
    let shortIdRef;
    let shortId;

    return firestore.runTransaction(tx => {
      return tx.get(lockRef)
      .then(doc => {
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
        shortIdRef = firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(nextId);
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
    .then(result => {
      // console.log("TX success, result", result);
      return {
        type: ResultType.SUCCESS,
        result: shortId
      }
    })    
    .catch(err => {
      console.log("TX Error", err);
      return {
        type: ResultType.ERROR,
        message: err.message,
      }
    });
  }


  /**
   * CreateNewShortId
   * 
   * Creates a new shortId for the given resource.
   * If there already is a ShortId for the resource, returns the existing one
   * 
   * If this fails for any reason, will retry until retries is 0
   * 
   * @returns ShortId, wrapped in a Promise & SomeResult
   */
  public static async dep_createShortId(orgId: string, longId: string, retries: number = 5, timeoutMs = 100): Promise<SomeResult<ShortId>> {
    console.log(`CreateShortId with retries: ${retries}, timeoutMs: ${timeoutMs}`)

    //0: Check to make sure the id hasn't already been created
    const existingShortIdResult = await this.getShortId(orgId, longId);
    if (existingShortIdResult.type === ResultType.SUCCESS) {
      return existingShortIdResult;
    }

    //1: Get the next short Id, ensure it's not locked. Retry if needed
    const result = await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest').get();
    let shortIdLock: ShortIdLock = result.data();

    console.log("1. shortIdLock:", shortIdLock);

    //TODO: use timeout instead of lock
    if (!shortIdLock) {
      //This must be the first time
      shortIdLock = {id: '100000', lock: false};
      await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest').set(shortIdLock);
    } else if (shortIdLock.lock === true) {
      console.log("lock is locked. Sleeping and trying again");
      if (retries === 0) {
        return {
          type: ResultType.ERROR,
          message: 'createShortId out of retries',
        }
      }

      sleep(timeoutMs);
      return this.dep_createShortId(orgId, longId, retries - 1, timeoutMs * 2);
    }

    const lockRef = firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest');
    const nextId = pad(parseInt(shortIdLock.id) + 1, 9);
    const shortIdRef = firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(nextId);
    const shortId = ShortId.fromShortId(orgId, {
      shortId: nextId,
      longId,
      lastUsed: new Date(),
    });
  
    try {
      await lockRef.set({id: nextId, lock: true});
      await shortIdRef.set(shortId.serialize());
      await lockRef.set({ lock: false });
      
      return {
        type: ResultType.SUCCESS,
        result: shortId,
      }
    } catch(err) {
      console.log("Error", err);
      return {
        type: ResultType.ERROR,
        message: err.message,
      }
    }

   

    // const batch = firestore.batch();
    // batch.update(lockRef, {id: nextId, lock: true });
    // batch.set(shortIdRef, shortId.serialize());
    // //I'm not 100% sure this will work as intended
    // batch.update(lockRef, { id: nextId, lock: false });
    
    // return batch.commit()
    // .then((batchResult: any) => {
    //   console.log("batchResult", batchResult);

    //   return {
    //     type: ResultType.SUCCESS,
    //     result: shortId,
    //   }
    // })
    // .catch((err: any) => {
    //   console.log("error saving batch: ", err);
    //   return {
    //     type: ResultType.ERROR,
    //     message: err.message
    //   }
    // });
  }
}