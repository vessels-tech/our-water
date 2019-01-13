import { NetInfo } from 'react-native';
import firebase, { Firebase, RNFirebase } from 'react-native-firebase';
//@ts-ignore
import { default as ftch } from 'react-native-fetch-polyfill';
import Config from 'react-native-config';

import { 
  appendUrlParameters, 
  rejectRequestWithError, 
  maybeLog
} from '../utils';
import {
  boundingBoxForCoords
} from '../utils';
import NetworkApi from './NetworkApi';
import { DeprecatedResource, SearchResult, Reading, OWUser, TimeseriesRange, OWUserStatus} from '../typings/models/OurWater';
import { SomeResult, ResultType, makeSuccess, makeError } from '../typings/AppProviderTypes';
import { TranslationEnum } from 'ow_translations';
import { Region } from 'react-native-maps';
import { AnyResource } from '../typings/models/Resource';
import { ShortId } from '../typings/models/ShortId';
import { isNullOrUndefined, isError } from 'util';
import { AnyReading, MyWellReading } from '../typings/models/Reading';
import { PendingReading } from '../typings/models/PendingReading';
import { PendingResource } from '../typings/models/PendingResource';
import { AnonymousUser, FullUser } from '../typings/api/FirebaseApi';
import { SyncError } from '../typings/api/ExternalServiceApi';
import { fromCommonResourceToFBResoureBuilder, fromCommonReadingToFBReadingBuilder } from '../utils/Mapper';
import FBResource from '../model/FBResource';
import FBReading from '../model/FBReading';
import { SaveUserDetailsType } from './internalAccountApi';
import { OrgType } from '../typings/models/OrgType';
import { ReadingImageType, NoReadingImage } from '../typings/models/ReadingImage';
import { NoReadingLocation, ReadingLocationType } from '../typings/models/ReadingLocation';
import { UserStatus } from '../typings/UserTypes';
import { date } from 'react-native-joi';

const fs = firebase.firestore();
const auth = firebase.auth();

const baseUrl = Config.REACT_APP_BASE_URL;
const timeout = 1000 * 10;

export type SendResourceEmailOptions = {
  email: string,
  subject: string,
  message: string,
}


class FirebaseApi {

  /**
   * call this before everything, to make sure we're turning firestore off and on
   * 
   * //TODO: should this talk to the NetworkApi?
   */
  static checkNetworkAndToggleFirestore() {
    return NetInfo.isConnected.fetch()
    .then(isConnected => {
      if (isConnected) {
        maybeLog("FirebaseApi enableNetwork()");
        return fs.enableNetwork().then(() => true);
      }

      maybeLog("FirebaseApi disableNetwork()");
      return fs.disableNetwork().then(() => false);
    });
  }

  //
  // Authentication
  // ------------------------------------

  /**
   * User signIn() instead
   */
  static async deprecated_signIn(): Promise<SomeResult<string>> {
    try {
      const userCredential = await auth.signInAnonymouslyAndRetrieveData();
      return {
        type: ResultType.SUCCESS,
        result: userCredential.user.uid,
      }
    } catch (err) {
      return {
        type: ResultType.ERROR,
        message: 'Could not sign in.'
      }
    }
  }


  /**
   * Sign in anonymously to firebase and get the user's Id token
   */
  static async signIn(): Promise<SomeResult<AnonymousUser>> {
    let userId: string;

    return auth.signInAnonymouslyAndRetrieveData()
    .then(userCredential => {
      userId = userCredential.user.uid;
      return userCredential.user.getIdToken();
    })
    .then(token => makeSuccess<AnonymousUser>({userId, token}))
    .catch(err => makeError<AnonymousUser>('Error logging in: ' + err.message))
  }

  /**
   * Get the JWT token of the user
   */
  static async getIdToken(): Promise<SomeResult<string>> {
    return auth.getIdToken()
    .then((token: string) => makeSuccess(token))
    .catch((err: Error) => makeError(err.message))
  }


  /**
   *  Send the code to the given user.
   */
  static async sendVerifyCode(mobile: string): Promise<SomeResult<RNFirebase.ConfirmationResult>> {
    return auth.signInWithPhoneNumber(mobile)
      .then(confirmResult => makeSuccess(confirmResult))
      .catch(err => makeError<RNFirebase.ConfirmationResult>(err.message));
  }

  /**
   * Verify the code and get the access token.
   * 
   * TODO: handle merging user identities
   */
  static async verifyCodeAndLogin(orgId: string, confirmResult: RNFirebase.ConfirmationResult, code: string, oldUserId: string): Promise<SomeResult<FullUser>> {
    let anonymousCredential: RNFirebase.UserCredential;
    let user: RNFirebase.User;
    let mobile: string;
  
    return confirmResult.confirm(code)
    .then(_user => {
      if (!_user) {
        return Promise.reject(new Error('No user found'));
      }
      user = _user;
      if (!user.phoneNumber) {
        return Promise.reject(new Error('User logged in, but no phone number found'));
      }

      //Save the user's phone number!
      mobile = user.phoneNumber;
      return this.userDoc(orgId, user.uid).set({ mobile }, { merge: true });
    })
    .then(() => this.mergeUsers(orgId, oldUserId, user.uid))
    .then(mergeResult => {
      if (mergeResult.type === ResultType.ERROR) {
        maybeLog("Non fatal error merging users:", mergeResult.message)
      } 

      return user.getIdToken();
    })
    .then(token => makeSuccess<FullUser>({userId: user.uid, token, mobile}))
    .catch((err: Error) => {
      maybeLog("ERROR", err);
      return makeError<FullUser>(err.message)
    });
  }

  static async logout(orgId: string): Promise<SomeResult<any>> {
    return auth.signOut()
    .then(() => this.signIn())
    .catch((err: Error) => makeError<void>(err.message));
  }

  /**
   * Authenticaion Callback
   */
  static onAuthStateChanged(listener: (user: RNFirebase.User) => void): () => void {
    return auth.onAuthStateChanged(listener);
  }

  static saveUserDetails(orgId: string, userId: string, userDetails: SaveUserDetailsType): Promise<SomeResult<void>> {
    return this.userDoc(orgId, userId).set({...userDetails}, {merge: true})
    .then(() => makeSuccess<void>(undefined))
    .catch((err: Error) => makeError<void>(err.message));
  }


  /**
   * When a user changes, merge the old user's data into the new one
   * 
   * This doesn't handle subcollections
   */
  static async mergeUsers(orgId: string, oldUserId: string, userId: string): Promise<SomeResult<any>> {
    const oldUserResult = await this.getUser(orgId, oldUserId);
    if (oldUserResult.type === ResultType.ERROR) {
      return oldUserResult;
    }
    const oldUser = oldUserResult.result;
    delete oldUser.userId;
    delete oldUser.email;
    delete oldUser.name;
    delete oldUser.nickname;
    delete oldUser.mobile;
    if (oldUser.favouriteResources.length === 0 ) {
      delete oldUser.favouriteResources;
    }
    if (oldUser.recentResources.length === 0 ) {
      delete oldUser.recentResources;
    }
    if (oldUser.recentSearches.length === 0 ) {
      delete oldUser.recentSearches;
    }
    
    return this.userDoc(orgId, userId).set({...oldUser}, {merge: true})
    .then(() => makeSuccess<void>(undefined))
    .catch((err: Error) => makeError<void>(err.message));
  }

  static addFavouriteResource(orgId: string, resource: any, userId: string) {
    return this.getFavouriteResources(orgId, userId)
    .then(favouriteResources => {
      favouriteResources[resource.id] = resource;

      return this.updateFavouriteResources(orgId, userId, favouriteResources);
    });
  }

  static removeFavouriteResource(orgId: string, resourceId: string, userId: string) {
    return this.getFavouriteResources(orgId, userId)
    .then(favouriteResources => {
      favouriteResources[resourceId] = null;

      return this.updateFavouriteResources(orgId, userId, favouriteResources);
    });  
  }

  static isInFavourites(orgId: string, resourceId: string, userId: string): Promise<boolean> {
    return this.getFavouriteResources(orgId, userId)
    .then(favouriteResources => {
      return resourceId in favouriteResources;
    });
  }

  static updateFavouriteResources(orgId: string, userId: string, favouriteResources: any) {
    return fs.collection('org').doc(orgId).collection('user').doc(userId).set({ favouriteResources }, {merge: true})
    .catch(err => {
      maybeLog(err.message);
    })
  }

  static getFavouriteResources(orgId: string, userId: string) {
    return fs.collection('org').doc(orgId).collection('user').doc(userId).get()
      .then(sn => {
        //@ts-ignore
        if (!sn || !sn.data() || !sn.data().favouriteResources) {
          return {};
        }
        //@ts-ignore
        return sn.data().favouriteResources;
      })
  }

  static getResourceListener(orgId: string, resourceId: string, onSnapshot: any) {
    return fs.collection('org').doc(orgId).collection('resource').doc(resourceId)
    .onSnapshot(sn => onSnapshot(sn.data()));
  }

  static getRecentResources(orgId: string, userId: string): Promise<SomeResult<AnyResource[]>> {
    return fs.collection('org').doc(orgId).collection('user').doc(userId).get()
      .then(sn => {
        const response: SomeResult<AnyResource[]> = {
          type: ResultType.SUCCESS,
          result: [],
        };

        //@ts-ignore
        if (!sn || !sn.data() || !sn.data().recentResources) {
          return response;
        }

        //@ts-ignore
        response.result = sn.data().recentResources;
        return response;
      })
      .catch((err: Error) => makeError<AnyResource[]>(err.message))
  }

  static async addRecentResource(orgId: string, resource: AnyResource, userId: string): Promise<SomeResult<AnyResource[]>> {
    //The issue with this implementation is that it doesn't preserve order
    const r = await this.getRecentResources(orgId, userId);
    if (r.type === ResultType.ERROR) {
      return r;
    }

    const recentResources = r.result;
    //Remove from array this resource already is present
    const filtered = recentResources.filter(r => r.id !== resource.id)
    //Add latest to the start
    filtered.unshift(resource);

    //Make sure we don't have more than 10
    while (filtered.length > 10) {
      filtered.pop();
    }
    const result = await fs.collection('org').doc(orgId).collection('user').doc(userId).set({ recentResources: filtered }, {merge: true});
    return await this.getRecentResources(orgId, userId);
  }

  static getResourcesForOrg(orgId: string): Promise<Array<AnyResource>> {
    return this.checkNetworkAndToggleFirestore()
    .then(() => fs.collection('org').doc(orgId).collection('resource')
      .limit(10)
      .get())
    .then(sn => {
      const resources: any[] = [];
      sn.forEach((doc) => {
        //Get each document, put in the id
        const data = doc.data();
        //@ts-ignore
        data.id = doc.id;
        resources.push(data);
      });

      return resources;
    })
    .catch(err => {
      maybeLog('getResourcesForOrg', err);
      return Promise.reject(err);
    });
  }

  /**
   * functions.httpsCallable is not yet available for react-native-firebase
   * instead, we can just use fetch
   * 
   * Use the firebase api, otherwise we don't get the caching tools
   * 
   * @param {*} param0 
   */
  static dep_getResourceNearLocation(orgId: string, latitude: number, longitude: number, distance: number) {
    const resourceUrl = `${baseUrl}/resource/${orgId}/nearLocation`;
    const url = appendUrlParameters(resourceUrl, {latitude, longitude, distance});
    
    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    return ftch(url, options)
      .then((response: any) => {
        if (!response.ok) {
          return rejectRequestWithError(response.status);
        }

        return response.json();
      })
      .catch((err: Error) => maybeLog('dep_getResourceNearLocation error' + err));
  }

  // /**
  //  * Local implementation of getResourceNearLocation
  //  * 
  //  * 
  //  * deprecated. Use getResourcesWithinRegion instead
  //  * We use this instead of the get request, as it will default to the cache if we're offline
  //  * @param {*} param0 
  //  */
  // static getResourceNearLocation(networkApi: NetworkApi, orgId: string, latitude: number, longitude: number, distance: number): Promise<Array<any>> {
  //   const { minLat, minLng, maxLat, maxLng } = boundingBoxForCoords(latitude, longitude, distance);

  //   return this.checkNetworkAndToggleFirestore()
  //   .then(() => {
  //     return fs.collection('org').doc(orgId).collection('resource')
  //       .where('coords', '>=', new firebase.firestore.GeoPoint(minLat, minLng))
  //       .where('coords', '<=', new firebase.firestore.GeoPoint(maxLat, maxLng)).get()
  //   })
  //   .then(snapshot => {
  //     const fbResources: FBResource[] = []
  //     snapshot.forEach(doc => {
  //       const fbResource: FBResource = FBResource.deserialize(doc.data());

  //       // Filter based on longitude. TODO: remove this once google fixes the above query
  //       //@ts-ignore
  //       if (fbResource.coords.latitude < minLng || fbResource.coords.longitude > maxLng) {
  //         return;
  //       }

  //       fbResources.push(fbResource);
  //     });

  //     return fbResources;
  //   })
  //   .then((fbResources: FBResource[]) => fbResources.map(r => r.toAnyResource()));
  // }

  /**
   * getResourcesWithinRegion
   */
  static async getResourcesWithinRegion(orgId: string, region: Region): Promise<SomeResult<AnyResource[]>>{
    //from region, lat and lng are in centre, delta is the full width (I think)
    const halfLatDelta = region.latitudeDelta / 2;
    const halfLngDelta = region.longitudeDelta / 2;
    const minLat = region.latitude - halfLatDelta;
    const minLng = region.longitude - halfLngDelta;
    const maxLat = region.latitude + halfLatDelta;
    const maxLng = region.longitude +  halfLngDelta;

    return fs.collection('org').doc(orgId).collection('resource')
      .where('coords', '>=', new firebase.firestore.GeoPoint(minLat, minLng))
      .where('coords', '<=', new firebase.firestore.GeoPoint(maxLat, maxLng))
      .limit(100)
    .get()
    .then(snapshot => {
      const fbResources: FBResource[] = []
      snapshot.forEach(doc => {
        const fbResource: FBResource = FBResource.deserialize(doc.data());

        // Filter based on longitude. TODO: remove this once google fixes the above query
        //@ts-ignore
        if (fbResource.coords.longitude < minLng || fbResource.coords.longitude > maxLng) {
          return;
        }

        fbResources.push(fbResource);
      });

      return fbResources;
    })
    .then((fbResources: FBResource[]) => fbResources.map(r => r.toAnyResource()))
    .then(result => makeSuccess<AnyResource[]>(result))
    .catch(err => {
      maybeLog("error", err);
      return makeError<AnyResource[]>(err.message);
    });
  }

  /**
   * getResourceForId
   */
  static getResourceForId(orgId: string, resourceId: string): Promise<SomeResult<AnyResource>> {
    return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).get()
    .then(sn => {
      //@ts-ignore
      if (!sn || !sn.data()) {
        return makeError<AnyResource>(`Couldn't find resource for orgId: ${orgId} and resourceId: ${resourceId}`);
      }

      const fbResource: FBResource = FBResource.deserialize(sn.data());
      const anyResource: AnyResource = fbResource.toAnyResource();
      return makeSuccess(anyResource);
    })
    .catch(err => {
      maybeLog("getResourceForId error:", err);
      return makeError<AnyResource>(err.message);
    });
  }

  static createNewResource(orgId: string, resourceData: any) {
    // const resource = functions.httpsCallable(`resource/${orgId}`);

    return Promise.resolve(true);
    //TODO: cors, figure out how to set the path here.
    // return resource(resourceData)
    //   .then(() => {
    //     // Read result of the Cloud Function.
    //   })
  };


  /**
   * saveReadingPossiblyOffineToUser
   * 
   * Returns immediately, as long as there was no firebase error.
   * 
   * Like saveReadingPossiblyOffline, but saves to a 'pendingReadings' object on the
   * user model, instead of the actual reading. Use this for integration with external
   * services where OurWater doesn't need to contain all of the data.
   * 
   * Promise resolves when the reading appears in local cache,
   * and not actually commited to the server
   */
  static async saveReadingPossiblyOffineToUser(orgId: string, userId: string, reading: AnyReading | PendingReading): Promise<SomeResult<void>> {
    console.log("Reading is", reading);

    /* we don't want to wait for this to resolve */
    this.saveReadingToUser(orgId, userId, reading);

    return {
      type: ResultType.SUCCESS,
      result: undefined
    };
  }

  /**
   * SaveResource
   * 
   * Save the resource publicly  
   * 
   * //TODO: check login status and stuff, maybe we can do that on the backend
   * //TODO: flags: deleted, pending etc
   * @param orgId 
   * @param userId 
   * @param resource 
   */
  static async saveResource(orgId: string, userId: string, resource: AnyResource | PendingResource): Promise<SomeResult<any>> {
    const builder = fromCommonResourceToFBResoureBuilder(orgId, resource);
    const fbResource = new FBResource(builder);
    
    return fbResource.save(fs);
  }

  static async saveResourceToUser(orgId: string, userId: string, resource: AnyResource | PendingResource): Promise<SomeResult<null>> {
    /* we don't want to wait for this to resolve */
    if (resource.id) {
      this.userDoc(orgId, userId).collection('pendingResources').doc(resource.id).set(resource);
      return makeSuccess(null);
    }

    this.userDoc(orgId, userId).collection('pendingResources').add(resource);
    return makeSuccess(null);
  }


  /**
   * deletePendingResource
   * 
   * Delete a pending resource from the user's pending resource list
   */
  static async deletePendingResourceFromUser(orgId: string, userId: string, resourceId: string): Promise<SomeResult<void>> {
    return await this.userDoc(orgId, userId).collection('pendingResources').doc(resourceId).delete()
    .then(() => makeSuccess(undefined))
    .catch((err: Error) => makeError(err.message));
  }

  /**
   * getReadings
   * 
   * Get readings from the readings collection
   * 
   * Range is currently ignored
   */
  static async getReadings(orgId: string, resourceId: string, timeseriesId: string, range: TimeseriesRange): Promise<SomeResult<AnyReading[]>> {
    console.log("getting readings, ", resourceId, timeseriesId)
    return this.readingCol(orgId)
      .where('resourceId', '==', resourceId)
      .where('timeseriesId', '==', timeseriesId)
      .limit(300)
      .get()
    .then((sn: any) => {
      console.log("readings result", sn);
      const parsedReadings = this.snapshotToReadings(sn);
      console.log("parsed readings are", parsedReadings);

      return parsedReadings;
    })
    .then((readings: AnyReading[]) => makeSuccess(readings))
    .catch((err: Error) => {
      maybeLog("error: ", err.message);
      makeError<AnyReading[]>(err.message)
    })
  }

  /**
   * Get the pending readings saved to the user's `pendingReadings` collection
   * 
   * TODO: update to just the user object, not the pendingReadings collection
   */
  static getPendingReadingsFromUser(orgId: string, userId: string): Promise<Reading[]> {
    return this.userDoc(orgId, userId).collection('pendingReadings').get()
      .then((sn: any) => {
        const readings: Reading[] = [];
        sn.forEach((doc: any) => {
          //Get each document, put in the id
          const data = doc.data();
          //@ts-ignore
          data.id = doc.id;
          readings.push(data);
        });

        return readings;
      });
  }

  /**
   * Get the pending readings from firestore from the user's `pendingReadings`
   * for a given resourceId
   *    * TODO: update to just the user object, not the pendingReadings collection

   */
  static getPendingReadingsForUserAndResourceId(orgId: string, userId: string, resourceId: string): Promise<Reading[]> {
    return this.userDoc(orgId, userId).collection('pendingReadings')
      .where('resourceId', '==', resourceId)
      .limit(100)
      .get()
      .then((sn: any) => {
        const readings: Reading[] = [];
        sn.forEach((doc: any) => {
          //Get each document, put in the id
          const data = doc.data();
          //@ts-ignore
          data.id = doc.id;
          readings.push(data);
        });

        return readings;
      });
  }
  
  /**
   * saveReading
   * submits a new reading for a given resource
   */
  static async saveReading(orgId: string, userId: string, reading: AnyReading | PendingReading): Promise<SomeResult<AnyReading>> {
    const builder = fromCommonReadingToFBReadingBuilder(orgId, userId, reading);
    const fbReading = new FBReading(builder);

    const saveResult = await fbReading.save(fs);
    if (saveResult.type === ResultType.ERROR) {
      return makeError<AnyReading>(saveResult.message);
    }

    const savedFBReading = FBReading.deserialize(saveResult.result);
    return makeSuccess(savedFBReading.toAnyReading());
  }

  /**
   * saveReadingToUser
   * 
   * Submits a new reading to the user's pendingReadings collection
   */
  static async saveReadingToUser(orgId: string, userId: string, reading: AnyReading | PendingReading): Promise<SomeResult<AnyReading>> {
    const builder = fromCommonReadingToFBReadingBuilder(orgId, userId, reading);
    const fbReading = new FBReading(builder);

    //TODO: should this hash the resourceId + tsId + date to get the unique reading id?
    return this.userDoc(orgId, userId).collection('pendingReadings').add(fbReading.serialize())
    .then(() => makeSuccess(fbReading.toAnyReading()))
    .catch((err: Error) => {
      return makeError<AnyReading>(err.message);
    })
  }

  static listenForPendingWrites(collection: any) {
    return new Promise((resolve, reject) => {
      collection.onSnapshot(
        //optionsOrObserverOrOnNext
        (sn: any) => {
          if (sn.docChanges.length > 0) {
            return resolve(sn);
          }
          reject(new Error('recieved snapshot with no changes'))
        },
        //TODO: this needs to be fixed
        //onError
        (error: Error) => {
          maybeLog("error: " +  error);
          return reject(error);
        },
      );
    });
  }

  /**
  * deletePendingReadingFromUser
  * 
  * Delete a pending reading from the user's pending reading list
  */
  static async deletePendingReadingFromUser(orgId: string, userId: string, id: string): Promise<SomeResult<void>> {
    return await this.userDoc(orgId, userId).collection('pendingReadings').doc(id).delete()
      .then(() => makeSuccess(undefined))
      .catch((err: Error) => {
        maybeLog(`deletePendingReadingFromUser error: ${err}`);
        return makeError(SyncError.DeletePendingReading);
      });
  }

  static pendingReadingsListener(orgId: string) {
    return this.listenForPendingWrites(this.readingCol(orgId));
  }

  /**
   * The listener for pending readings that are cached to the user instead of in the normal place
   * see `saveReadingPossiblyOffineToUser`
   */
  static pendingReadingsListenerForUser(orgId: string, userId: string) {
    return this.listenForPendingWrites(
      this.userDoc(orgId, userId).collection('pendingReadings')
    );
  }

  /**
   * Listen to pending readings that will eventually be saved to firebase.
   * Don't use for GGMN, use listenForPendingReadingsToUser instead
   */
  static listenForPendingReadings(orgId: string, callback: any) {
    fs.collection('org').doc(orgId).collection('reading')
      .onSnapshot(
        {
          includeMetadataChanges: true,
        },
        //optionsOrObserverOrOnNext
        (sn) => {
          //TODO: map snapshot to readings
          callback(sn);
        },
        //onError
        (error) => {
          maybeLog("error: " + error);
          return Promise.reject(error);
        }
      );
  }

  static listenForPendingReadingsToUser(orgId: string, userId: string, callback: (readings: PendingReading[]) => void): () => void {
    return this.userDoc(orgId, userId).collection('pendingReadings')
    .onSnapshot(
      {
          includeMetadataChanges: true,
        },
        //optionsOrObserverOrOnNext
        (sn: any) => {
          const readings = this.snapshotToPendingReadings(sn);
          callback(readings);
        },
        //onError
        (error: Error) => {
          maybeLog("error: " + error);
          return Promise.reject(error);
        }
      );
  }

  static listenForPendingResourcesToUser(orgId: string, userId: string, callback: (readings: PendingResource[]) => void): () => void {
    return this.userDoc(orgId, userId).collection('pendingResources')
    .onSnapshot(
      {
          includeMetadataChanges: true,
        },
        //optionsOrObserverOrOnNext
        (sn: any) => {
          const resources = this.snapshotToPendingResource(sn);
          callback(resources);
        },
        //onError
        (error: Error) => {
          maybeLog("error: " + error);
          return Promise.reject(error);
        }
    );
  }

  /**
   * @returns unsubscribe function
   */
  static listenForUpdatedUser(orgId: string, userId: string, cb: any): () => void {
    const options = {
      includeMetadataChanges: true
    };
    return this.userDoc(orgId, userId).onSnapshot(options, (sn: any) => {
      try {
        const user: OWUser = this.snapshotToUser(userId, sn);
        return cb(user);
      } catch (err) {
        maybeLog("error: " + err);
      }
    });
  }

  /**
   * Do a basic search, where we filter by resourceId
   * This is suboptimal, as we have to load all resources first. 
   * 
   * Searching is a little tricky, we need to figure out by which fields that
   * the user is likely to search by first (eg. groupName, )
   */
  static async performBasicSearch(orgId: string, text: string): Promise<SearchResult> {
    const resources = await this.getResourcesForOrg(orgId);
    const filteredResources = resources.filter(r => {
      return r.id.toLowerCase().indexOf(text.toLowerCase()) >= 0;
    });

    return {
      hasNextPage: false,
      resources,
    };
  }


  /**
   * Get the n most recent searches the user made
   */
  static getRecentSearches(orgId: string, userId: string): Promise<string[]> {
    return fs.collection('org').doc(orgId).collection('user').doc(userId).get()
      .then(sn => {
        //@ts-ignore
        if (!sn || !sn.data() || !sn.data().recentSearches) {
          return [];
        }
        //@ts-ignore
        const recentSearches = sn.data().recentSearches;
        return recentSearches;
      });
  }

  /**
   * Save this search to the user's recent searches
   */
  static async saveRecentSearch(orgId: string, userId: string, searchQuery: string): Promise<any> {
    const maxRecentSearches = 5;
    const recentSearches = await this.getRecentSearches(orgId, userId);
    //Make sure we don't re-add an existing query. Add it to the start of the array
    const existingIndex = recentSearches.indexOf(searchQuery);
    if (existingIndex > -1) {
      delete recentSearches[existingIndex];
    }

    recentSearches.unshift(searchQuery);
    while (recentSearches.length > maxRecentSearches + 1) {
      recentSearches.pop();
    }

    return fs.collection('org').doc(orgId).collection('user').doc(userId).set({ recentSearches }, { merge: true })
  }

  private static userDoc(orgId: string, userId: string): any {
    return fs.collection('org').doc(orgId).collection('user').doc(userId)
  } 

  private static readingCol(orgId: string): any {
    return fs.collection('org').doc(orgId).collection('reading');
  }

  private static shortIdCol(orgId: string): any {
    return fs.collection('org').doc(orgId).collection('shortId');
  }

  /**
   * getUser
   * 
   * Gets the entire user object from firebase
   */
  static async getUser(orgId: string, userId: string): Promise<SomeResult<OWUser>> {
    return this.userDoc(orgId, userId).get()
    .then((sn: any) => this.snapshotToUser(userId, sn))
    .then((user: OWUser) => makeSuccess<OWUser>(user))
    .catch((err: any) => {
      maybeLog("error getting user: " + err);
      return makeError<OWUser>(`Could not get user for orgId: ${orgId}, userId: ${userId}`);
    });
  }

  /**
   * changeUserLanguage
   * 
   * Change the language for the given user. 
   * Triggers a user changed callback
   */
  static async changeUserTranslation(orgId: string, userId: string, translation: TranslationEnum): Promise<SomeResult<void>> {
    return this.userDoc(orgId, userId).set({ translation }, { merge: true })
    .then(() => {
      return {
        type: ResultType.SUCCESS,
        result: undefined
      }
    })
    .catch((err: Error) => {
      return {
        type: ResultType.ERROR,
        message: err.message,
      }
    });
  }

  /**
   * Delete a pending resource
   */
  static async deletePendingResource(orgId: string, userId: string, pendingResourceId: string): Promise<SomeResult<void>> {
    return this.userDoc(orgId, userId).collection('pendingResources').doc(pendingResourceId).delete()
    .then(() => {
      return {
        type: ResultType.SUCCESS,
      };
    })
    .catch(() => {
      return {
        type: ResultType.ERROR,
        message: 'Could not delete pending resource'
      };
    })
  }

  /**
   * Delete the pending readings from a pending resource
   */
  static async deletePendingReadingsForResource(orgId: string, userId: string, pendingResourceId: string): Promise<SomeResult<void>> {
    return this.userDoc(orgId, userId).collection('pendingReadings').get()
      .then((sn: any) => {
        const readings: PendingReading[] = [];
        sn.forEach((doc: any) => {
          //Get each document, put in the id
          const data = doc.data();
          //@ts-ignore
          data.id = doc.id;
          readings.push(data);
        });

        return readings;
      })
      .then((pendingReadings: PendingReading[]) => {
      return Promise.all(pendingReadings
        .filter(r => r.resourceId === pendingResourceId)
        .map(r => this.deletePendingReading(orgId, userId, r.id))
      )
    })
    .then(() => makeSuccess<void>(undefined))
    .catch((err: Error) => makeError<void>(err.message))
  }

  /**
   * Delete a pending reading
   */
  static async deletePendingReading(orgId: string, userId: string, pendingReadingId: string): Promise<SomeResult<void>> {
    //This needs to work offline, don't wait for feedback
    return this.userDoc(orgId, userId).collection('pendingReadings').doc(pendingReadingId).delete()
      .then(() => {
        return {
          type: ResultType.SUCCESS,
        };
      })
      .catch(() => {
        return {
          type: ResultType.ERROR,
          message: 'Could not delete pending resource'
        };
      });
  }

  /**
   * getShortId
   * 
   * Get the shortId for the given long Id.
   * Uses firestore, not Rest API
   */
  public static async getShortId(orgId: string, longId: string): Promise<SomeResult<string>> {
    const col = this.shortIdCol(orgId);
    return col.where('longId', '==', longId).get()
    .then((sn: any) => this.snapshotToShortIds(sn))
    .then((shortIds: ShortId[]) => {
      if (shortIds.length > 1) {
        maybeLog(`Found more than 1 short Id for longId: ${longId}. Returning the first.`);
      }

      if (shortIds.length === 0 || isNullOrUndefined(shortIds[0])) {
        throw new Error(`ShortId not found for longId: ${longId}`);
      }

      return {
        type: ResultType.SUCCESS,
        result: shortIds[0].id,
      };
    })
    .catch((err: Error) => {
      return {
        type: ResultType.ERROR,
        message: err.message,
      }
    });
  }

  /**
   * createShortId
   * 
   * Creates a short id for the given long id. Uses the REST Api instead
   * of the firestore Api. This limits the offline usability of shortIds,
   * but is a necessary compromise for now
   */
  public static async createShortId(orgId: string, longId: string): Promise<SomeResult<string>> {
    const shortIdUrl = `${baseUrl}/shortId/${orgId}`;
    const url = appendUrlParameters(shortIdUrl, {});

    const options = {
      timeout,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({resourceId: longId})
    };

    return ftch(url, options)
    .then((response: any) => {
      if (!response.ok) {
        return rejectRequestWithError(response.status);
      }

      return response.json();
    })
    .then((shortId: ShortId) => {
      return {
        type: ResultType.SUCCESS,
        result: shortId.shortId,
      }
    })
    .catch((err: Error) => {
      maybeLog(`CreateShortId Error: ${err}`);
      return {
        type: ResultType.ERROR,
        message: err.message
      };
    });
  }

  /**
   * SendResourceEmail
   * 
   * http://localhost:5000/our-water/us-central1/resource/ggmn/ggmnResourceEmail
   * 
   * Trigger the Firebase Api to send an email containing shapefiles for the given resources
   */
  static async sendResourceEmail(orgId: string, unusedToken: string, pendingResources: PendingResource[], pendingReadings: PendingReading[], sendOptions: SendResourceEmailOptions): Promise<SomeResult<void>> {
    const url = appendUrlParameters(`${baseUrl}/resource/${orgId}/ggmnResourceEmail`, {});

    //TD: Need a better way to get the token
    const userResult = await this.signIn();
    if (userResult.type === ResultType.ERROR) {
      return userResult;
    }
    const token = userResult.result.token;

    const body = {
      pendingResources,
      pendingReadings,
      ...sendOptions,
    };

    const options = {
      timeout,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };

    maybeLog("SendResourceEmail url: ", url);
    maybeLog("SendResourceEmail options: ", options);

    return ftch(url, options)
      .then((response: any) => {
        if (!response.ok) {
          return rejectRequestWithError(response.status);
        }

        return response.json();
      })
      .then((shortId: ShortId) => makeSuccess(shortId.shortId))
      .catch((err: Error) => {
        maybeLog(`send resource email Error: ${err}`);
        return makeError(err.message);
      });
  }


  //
  //Utils
  //------------------------------------------------------------------------------


  /**
   * Map a fb snapshot to a proper OWUser object
   * If the snapshot is null, returns an empty user object
   */
  static snapshotToUser(userId: string, sn: any): OWUser {
    const data = sn.data();

    if (!data) {
      return {
        userId,
        recentResources: [],
        favouriteResources: [],
        pendingSavedReadings:  [],
        pendingSavedResources:[],
        recentSearches: [],
        //TODO: default translation can be overriden here
        translation: TranslationEnum.en_AU,
        mobile: null,
        email: null,
        name: null,
        nickname: null,
        status: UserStatus.Unapproved,
      }
    }

    return this.oldSnapshotToUser(sn);
  }


  /**
   * Map a fb snapshot to a proper OWUser object
   */
  static oldSnapshotToUser(sn: any): OWUser {
    const data = sn.data();

    if (!data) {
      throw new Error("Data from snapshot was undefined or null");
    }

  

    let favouriteResources: AnyResource[] = [];
    const favouriteResourcesDict = data.favouriteResources;
    if (favouriteResourcesDict) {
      favouriteResources = Object
        .keys(favouriteResourcesDict)
        .map(k => favouriteResourcesDict[k])
        .filter(v => v !== null);
    }

    return {
      userId: sn.id,
      recentResources: data.recentResources || [],
      //Stored as a dict, we want an array
      favouriteResources,
      pendingSavedReadings: data.pendingSavedReadings || [],
      pendingSavedResources: data.pendingSavedResources || [],
      recentSearches: data.recentSearches || [],
      //TODO: default translation can be overriden here
      translation: data.translation || 'en_AU', 
      mobile: data.mobile || null,
      email: data.email || null,
      name: data.name || null,
      nickname: data.nickname || null,
      status: data.status || OWUserStatus.Unapproved,
    }
  }

  /**
   * Map a snapshot from pendingReadings to a readings array
   */
  static snapshotToReadings(sn: any): AnyReading[] {
    const readings: AnyReading[] = [];
    sn.forEach((doc: any) => {
      const data = doc.data();
      //TD this is a temporary measure as we wait to fix up the backend models
      let image: NoReadingImage = { type: ReadingImageType.NONE };
      if (data.image) {
        image = data.image;
      }

      let location: NoReadingLocation = { type: ReadingLocationType.NONE };
      if (data.location) {
        location = data.location;
      }

      //TD: This really needs to be fixed
      const reading: MyWellReading = {
        type: OrgType.MYWELL,
        resourceId: data.resourceId,
        timeseriesId: data.timeseriesId,
        date: data.datetime || data.date,
        value: data.value,
        userId: data.userId || 'unknown',
        image,
        location,
      };

      readings.push(reading);
      //TODO: use this proper method instead
      // const fbReading = FBReading.fromDoc(doc);
      // readings.push(fbReading.toAnyReading());
    });

    return readings;
  }

  static snapshotToPendingReadings(sn: any): PendingReading[] {
    const readings: PendingReading[] = [];
    sn.forEach((doc: any) => {
      //Get each document, put in the id
      const data: PendingReading = doc.data();
      data.id = doc.id;
      readings.push(data);
    });

    return readings;
  }

  /**
   * Map a snapshot from pendingResources to a Resource array
   */
  static snapshotToResources(sn: any): DeprecatedResource[] {
    const resources: DeprecatedResource[] = [];
    sn.forEach((doc: any) => {
      //Get each document, put in the id
      const data = doc.data();
      //@ts-ignore
      data.id = doc.id;
      resources.push(data);
    });

    return resources;
  }

  static snapshotToPendingResource(sn: any): PendingResource[] {
    const readings: PendingResource[] = [];
    sn.forEach((doc: any) => {
      //Get each document, put in the id
      const data = doc.data();
      //@ts-ignore
      data.id = doc.id;
      readings.push(data);
    });

    return readings;
  }

  static snapshotToShortIds(sn: any): ShortId[] {
    const shortIds: ShortId[] = [];
    sn.forEach((doc: any) => {
      //Get each document, put in the id
      const data = doc.data();
      //@ts-ignore
      data.pendingId = doc.id;
      shortIds.push(data);
    });

    return shortIds;
  }


}

export default FirebaseApi;