import { SomeResult, ResultType } from "../types/AppProviderTypes";

import firestore from './Firestore';
import { Resource } from "../models/Resource";
import * as OWGeoPoint from '../models/OWGeoPoint';
import ShortId from "../models/ShortId";
import * as sleep from 'thread-sleep';
import { BasicAuthSecurity } from "soap";
import { pad } from "../utils";
import { isNullOrUndefined } from "util";



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
  public static  async getShortId(orgId: string, longId: string): Promise<SomeResult<ShortId>> {
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
   * CreateNewShortId
   * 
   * Creates a new shortId for the given resource.
   * If there already is a ShortId for the resource, returns the existing one
   * 
   * If this fails for any reason, will retry until retries is 0
   * 
   * @returns ShortId, wrapped in a Promise & SomeResult
   */
  public static  async createShortId(orgId: string, longId: string, retries: number = 5, timeoutMs = 100): Promise<SomeResult<ShortId>> {
    console.log(`CreateShortId with retries: ${retries}, timeoutMs: ${timeoutMs}`)

    //0: Check to make sure the id hasn't already been created
    const existingShortIdResult = await this.getShortId(orgId, longId);
    if (existingShortIdResult.type === ResultType.SUCCESS) {
      return existingShortIdResult;
    }

    //1: Get the next short Id, ensure it's not locked. Retry if needed
    const result = await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest').get();
    let shortIdLock: ShortIdLock = result.data();

    if (!shortIdLock) {
      //This must be the first time
      shortIdLock = {id: '100000', lock: false};
      await firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest').set(shortIdLock);
    } else if (shortIdLock.lock === true) {
      if (retries === 0) {
        return {
          type: ResultType.ERROR,
          message: 'createShortId out of retries',
        }
      }

      sleep(timeoutMs);
      return this.createShortId(orgId, longId, retries - 1, timeoutMs * 2);
    }
    

    const lockRef = firestore.collection('org').doc(orgId).collection(ShortId.docName).doc('latest');
    const nextId = pad(parseInt(shortIdLock.id) + 1, 9);
    const shortIdRef = firestore.collection('org').doc(orgId).collection(ShortId.docName).doc(nextId);
    const shortId = ShortId.fromShortId(orgId, {
      shortId: nextId,
      longId,
      lastUsed: new Date(),
    })

    const batch = firestore.batch();
    batch.update(lockRef, { lock: true });
    batch.set(shortIdRef, shortId.serialize());
    //I'm not 100% sure this will work as intended
    batch.update(lockRef, { id: nextId, lock: false });
    
    return batch.commit()
    .then((batchResult: any) => {
      console.log("batchResult", batchResult);

      return {
        type: ResultType.SUCCESS,
        result: shortId,
      }
    })
    .catch((err: any) => {
      console.log("error saving batch: ", err);
      return {
        type: ResultType.ERROR,
        message: err.message
      }
    });
  }
}