import { NetInfo } from 'react-native';
import firebase, { Firebase } from 'react-native-firebase';
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
import { DeprecatedResource, SearchResult, Reading, OWUser} from '../typings/models/OurWater';
import { SomeResult, ResultType, makeSuccess, makeError } from '../typings/AppProviderTypes';
import { TranslationEnum } from 'ow_translations/Types';
import { Region } from 'react-native-maps';
import { AnyResource } from '../typings/models/Resource';
import { ShortId } from '../typings/models/ShortId';
import { isNullOrUndefined } from 'util';
import { AnyReading } from '../typings/models/Reading';
import { PendingReading } from '../typings/models/PendingReading';
import { PendingResource } from '../typings/models/PendingResource';
import { AnonymousUser } from '../typings/api/FirebaseApi';

const fs = firebase.firestore();
const auth = firebase.auth();

const baseUrl = Config.REACT_APP_BASE_URL;
const timeout = 1000 * 10;


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
      return auth.getIdToken()
    })
    .catch(err => makeError<AnonymousUser>('Error logging in' + err.message))
    .then(token => makeSuccess<AnonymousUser>({userId, token}))
    .catch(err => makeError<AnonymousUser>('Logged in successfully, but could not get token'));
  }

  /**
   * Get the JWT token of the user
   */
  static async getIdToken(): Promise<SomeResult<string>> {
    return auth.getIdToken()
    .then((token: string) => makeSuccess(token))
    .catch((err: Error) => makeError(err.message))
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
    return fs.collection('org').doc(orgId).collection('user').doc(userId).set({ favouriteResources }, {merge: true});
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
      });
  }

  static async addRecentResource(orgId: string, resource: any, userId: string): Promise<SomeResult<AnyResource[]>> {
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
      maybeLog(err);
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
      .catch((err: Error) => maybeLog(err));
  }

  /**
   * Local implementation of getResourceNearLocation
   * 
   * 
   * deprecated. Use getResourcesWithinRegion instead
   * We use this instead of the get request, as it will default to the cache if we're offline
   * @param {*} param0 
   */
  static getResourceNearLocation(networkApi: NetworkApi, orgId: string, latitude: number, longitude: number, distance: number): Promise<Array<any>> {
    const { minLat, minLng, maxLat, maxLng } = boundingBoxForCoords(latitude, longitude, distance);

    return this.checkNetworkAndToggleFirestore()
    .then(() => {
      return fs.collection('org').doc(orgId).collection('resource')
        .where('coords', '>=', new firebase.firestore.GeoPoint(minLat, minLng))
        .where('coords', '<=', new firebase.firestore.GeoPoint(maxLat, maxLng)).get()
    })
    .then(snapshot => {
      const resources: DeprecatedResource[] = []
      snapshot.forEach(doc => {
        //TODO: map to an actual Resource
        const data: any = doc.data();
        //@ts-ignore
        data.id = doc.id;

        // Filter based on longitude. TODO: remove this once google fixes the above query
        //@ts-ignore
        if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
          return;
        }

        resources.push(data);
      });

      return resources;
    });
  }

  /**
   * getResourcesWithinRegion
   */
  static async getResourcesWithinRegion(orgId: string, region: Region): Promise<SomeResult<AnyResource[]>>{
    // //TODO: validate assumption that lat and lng start in top left corner
    // console.log("Region is:", region);
    // const minLat = region.latitude;
    // const minLng = region.longitude;
    // const maxLat = minLat + region.latitudeDelta;
    // const maxLng = minLng + region.longitudeDelta;

    //from region, lat and lng are in centre, delta is the full width (I think)
    console.log("Region is:", region);
    const halfLatDelta = region.latitudeDelta / 2;
    const halfLngDelta = region.longitudeDelta / 2;
    const minLat = region.latitude - halfLatDelta;
    const minLng = region.longitude - halfLngDelta;
    const maxLat = region.latitude + halfLatDelta;
    const maxLng = region.longitude +  halfLngDelta;

    console.log(`mins: ${minLat}, ${minLng}`);
    console.log(`max: ${maxLat}, ${maxLng}`);

    console.log("orgId", orgId);
    return fs.collection('org').doc(orgId).collection('resource').get()
      // .where('coords', '>=', new firebase.firestore.GeoPoint(minLat, minLng)).get()
      // .where('coords', '<=', new firebase.firestore.GeoPoint(maxLat, maxLng)).get()
    .then(snapshot => {
      console.log("got snapshot", snapshot);
      const resources: AnyResource[] = []
      snapshot.forEach(doc => {
        //TODO: map to an actual Resource
        const data: any = doc.data();
        //@ts-ignore
        data.id = doc.id;

        // Filter based on longitude. TODO: remove this once google fixes the above query
        //@ts-ignore
        if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
          return;
        }

        //TODO: fix this hack
        data.timeseries = [];

        resources.push(data);
      });

      return resources;
    })
    .then(result => {
      const response: SomeResult<AnyResource[]> = {
        type: ResultType.SUCCESS,
        result,
      };

      return response;
    })
    .catch(err => {
      maybeLog("error", err);
      const response: SomeResult<AnyResource[]> = {
        type: ResultType.ERROR,
        message: err.message,
      }; 

      return response;
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
        const response: SomeResult<AnyResource> = {
          type: ResultType.ERROR,
          message: `Couldn't find resource for orgId: ${orgId} and resourceId: ${resourceId}`
        };
        return response;
      }

      //@ts-ignore
      const result: AnyResource = sn.data();
      result.timeseries = []; //TODO: figure out how to fix this!
      const response: SomeResult<AnyResource> = {
        type: ResultType.SUCCESS,
        result,
      };

      return response;
    })
    .catch(err => {
      maybeLog("getResourceForId error:", err);
      const response: SomeResult<AnyResource> = {
        type: ResultType.ERROR,
        message: err.message,
      };

      return response;
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
   * saveReadingPossiblyOffline
   * 
   * Deprecated. Use SaveReadingPossiblyOfflineToUser instead
   * 
   * saves a reading, Promise resolves when the reading appears in local cache, 
   * and not actually commited to the server
   */
  static saveReadingPossiblyOffline(orgId: string, reading: any) {
    return new Promise((resolve, reject) => {

      this.pendingReadingsListener(orgId)
      .then(snapshot => {

        //Resolve once the pending reading is saved
        resolve(true);
      });

      this.saveReading(orgId, reading)
      //Don't resolve this - as if we are offline, it will take a long time
      .catch((err: Error) => {
        maybeLog('saveReading Err: ' +  err);
        reject(err);
      });
    });
  }

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
    /* we don't want to wait for this to resolve */
    this.saveReadingToUser(orgId, userId, reading);

    return {
      type: ResultType.SUCCESS,
      result: undefined
    };
  }

  static async saveResourceToUser(orgId: string, userId: string, resource: AnyResource | PendingResource): Promise<SomeResult<null>> {
    /* we don't want to wait for this to resolve */
    if (resource.id) {
      await this.userDoc(orgId, userId).collection('pendingResources').doc(resource.id).set(resource);
      return makeSuccess(null);
    }

    await this.userDoc(orgId, userId).collection('pendingResources').add(resource);
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
   * 
   * We use the Cloudstore Api instead of doing a POST for two reasons:
   * (1) we want to benefit fro Firebase's offline features, and
   * (2) it will likely be easier to implement security on this later on
   * 
   * format:
   * reading: {
   *  resourceId: string    
   *  datetime:   string    #must be iso date format
   *  value:      float     
   *  isLegacy:   boolean   #set to true to stop the resource's lastValue from being updated
   *  userId:     string    #id of the user creating the reading. In the future, this will be inferred from the session
   * }
   * 
   */
  static saveReading(orgId: string, reading: Reading) {
    return this.readingCol(orgId).add(reading);
  }

  static saveReadingToUser(orgId: string, userId: string, reading: AnyReading | PendingReading) {
    return this.userDoc(orgId, userId).collection('pendingReadings').add(reading);
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
      .catch((err: Error) => makeError(err.message));
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

  static listenForPendingReadingsToUser(orgId: string, userId: string, callback: (readings: PendingReading[]) => void): string {
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

  static listenForPendingResourcesToUser(orgId: string, userId: string, callback: (readings: PendingResource[]) => void): string {
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

  static listenForUpdatedUser(orgId: string, userId: string, cb: any) {
    const options = {
      includeMetadataChanges: true
    };
    return this.userDoc(orgId, userId).onSnapshot(options, (sn: any) => {
      try {
        const user: OWUser = this.snapshotToUser(sn);
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
    .then((sn: any) => this.snapshotToUser(sn))
    .then((user: OWUser) => {
      return {
        type: ResultType.SUCCESS,
        result: user,
      }
    })
    .catch((err: any) => {
      maybeLog("error getting user: " + err);
      return {
        type: ResultType.ERROR,
        message: `Could not get user for orgId: ${orgId}, userId: ${userId}`
      }
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
   * Delete a pending reading
   */
  static async deletePendingReading(orgId: string, userId: string, pendingReadingId: string): Promise<SomeResult<void>> {
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
      })
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

    maybeLog("CreateShortId url: ", url);
    maybeLog("CreateShortId options: ", options);

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
  static async sendResourceEmail(orgId: string, token: string, email: string, pendingResources: PendingResource[]): Promise<SomeResult<void>> {
    const url = appendUrlParameters(`${baseUrl}/resource/${orgId}/ggmnResourceEmail`, {});

    const options = {
      timeout,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, pendingResources }),
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


  //
  //Utils
  //------------------------------------------------------------------------------

  /**
   * Map a fb snapshot to a proper OWUser object
   */
  static snapshotToUser(sn: any): OWUser {
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
    }
  }

  /**
   * Map a snapshot from pendingReadings to a readings array
   */
  static snapshotToReadings(sn: any): Reading[] {
    const readings: Reading[] = [];
    sn.forEach((doc: any) => {
      //Get each document, put in the id
      const data = doc.data();
      //@ts-ignore
      data.id = doc.id;
      readings.push(data);
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