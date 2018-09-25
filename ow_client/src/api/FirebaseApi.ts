import { NetInfo } from 'react-native';
import firebase, { Firebase } from 'react-native-firebase';
//@ts-ignore
import { default as ftch } from 'react-native-fetch-polyfill';
import Config from 'react-native-config';

import { 
  appendUrlParameters, 
  rejectRequestWithError 
} from '../utils';
import { validateReading } from './ValidationApi';

import {
  boundingBoxForCoords
} from '../utils';
import NetworkApi from './NetworkApi';
import { Resource, SearchResult, Reading, OWUser } from '../typings/models/OurWater';
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import { userInfo } from 'os';
import { UserCredentials } from 'react-native-keychain';

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
        console.log("FirebaseApi enableNetwork()");
        return fs.enableNetwork().then(() => true);
      }

      console.log("FirebaseApi disableNetwork()");
      return fs.disableNetwork().then(() => false);
    });
  }

  
  static async signIn(): Promise<SomeResult<string>> {

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

  static getRecentResources(orgId: string, userId: string): Promise<SomeResult<Resource[]>> {
  
    return fs.collection('org').doc(orgId).collection('user').doc(userId).get()
      .then(sn => {
        const response: SomeResult<Resource[]> = {
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

  static async addRecentResource(orgId: string, resource: any, userId: string): Promise<SomeResult<Resource[]>> {

    const r = await this.getRecentResources(orgId, userId);

    if (r.type === ResultType.ERROR) {
      return r;
    }

    const recentResources = r.result;
    //only keep the last 5 resources
    recentResources.unshift(resource);
    
    //remove this resource from later on if it already exists
    const dedupDict: any = {};
    recentResources.forEach((res: any) => { dedupDict[res.id] = res});
    const dedupList = Object.keys(dedupDict).map(id => dedupDict[id]);
    while (dedupList.length > 5) {
      dedupList.pop();
    }

    console.log("dedupList is:", orgId, userId, dedupList);

    const result = await fs.collection('org').doc(orgId).collection('user').doc(userId).set({ recentResources: dedupList }, {merge: true});
    console.log("result is", result);

    return await this.getRecentResources(orgId, userId);
  }

  static getResourcesForOrg(orgId: string): Promise<Array<Resource>> {
    return this.checkNetworkAndToggleFirestore()
    .then(() => console.log("getting resource", orgId))
    .then(() => fs.collection('org').doc(orgId).collection('resource')
      .limit(10)
      .get())
    .then(sn => {
      console.log('got snapshot');
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
      console.log(err);
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
      .catch((err: Error) => console.log(err));
  }

  /**
   * Local implementation of getResourceNearLocation
   * 
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
      const resources: Resource[] = []
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
      .then((result: any) => console.log('saveReading result', result))
      .catch((err: Error) => {
        console.log('saveReading Err', err);
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
  static async saveReadingPossiblyOffineToUser(orgId: string, userId: string, reading: Reading): Promise<SomeResult<null>> {
    //TODO: some form of extra validation here?

    /* we don't want to wait for this to resolve */
    this.saveReadingToUser(orgId, userId, reading);

    return {
      type: ResultType.SUCCESS,
      result: null
    };


    // return new Promise((resolve, reject) => {

    //   this.pendingReadingsListenerForUser(orgId, userId)
    //     .then(snapshot => {

    //       //Resolve once the pending reading is saved
    //       resolve();
    //     });

    //   this.saveReadingToUser(orgId, userId, reading)
    //   //Don't resolve this - as if we are offline, it will take a long time
    //   .then((result: any) => console.log('saveReadingToUser result', result))
    //   .catch((err: Error) => {
    //     console.log('saveReading Err', err);
    //     reject(err);
    //   });
    // });
  }

  static async saveResourceToUser(orgId: string, userId: string, resource: Resource): Promise<SomeResult<null>> {
    //TODO: some form of extra validation here?

    /* we don't want to wait for this to resolve */
    this.userDoc(orgId, userId).collection('pendingResources').add(resource);

    return {
      type: ResultType.SUCCESS,
      result: null
    };
  }

  /**
   * Get the pending readings saved to the user's `pendingReadings` collection
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

  static saveReadingToUser(orgId: string, userId: string, reading: Reading) {
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
        // (sn) => console.log("observerOrOnNextOrOnError", thing), //observerOrOnNextOrOnError
        //onError
        (error: Error) => {
          console.log("error", error);
          return reject(error);
        },
        // (sn) => console.log('onCompletion', sn), //onCompletion
      );
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

  static listenForPendingReadings(orgId: string, callback: any) {
    fs.collection('org').doc(orgId).collection('reading')
      .onSnapshot(
        {
          includeMetadataChanges: true,
        },
        //optionsOrObserverOrOnNext
        (sn) => {
          callback(sn);
        },
        //onError
        (error) => {
          console.log("error", error);
          return Promise.reject(error);
        },
        // (sn) => console.log('onCompletion', sn), //onCompletion, doesn't exist now?
    );
  }

  static listenForPendingReadingsToUser(orgId: string, userId: string, callback: any): string {
    return this.userDoc(orgId, userId).collection('pendingReadings')
    .onSnapshot(
      {
          includeMetadataChanges: true,
        },
        //optionsOrObserverOrOnNext
        (sn: any) => {
          callback(sn);
        },
        //onError
        (error: Error) => {
          console.log("error", error);
          return Promise.reject(error);
        },
        // (sn) => console.log('onCompletion', sn), //onCompletion, doesn't exist now?
    );
  }

  static listenForUpdatedUser(orgId: string, userId: string, cb: any) {
    const options = {
      includeMetadataChanges: true
    };
    return this.userDoc(orgId, userId).onSnapshot(options, (sn: any) => {

      const user: OWUser = this.snapshotToUser(sn);
      console.log("user is", user);
      return cb(user);
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
      resources,
      groups: [],
      users: [],
      offline: false,
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
        console.log("recent searches are", recentSearches);
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

    return fs.collection('org').doc(orgId).collection('user').doc(userId).set({recentSearches})
  }



  private static userDoc(orgId: string, userId: string): any {
    return fs.collection('org').doc(orgId).collection('user').doc(userId)
  } 

  private static readingCol(orgId: string): any {
    return fs.collection('org').doc(orgId).collection('reading');
  }

  /**
   * getUser
   * 
   * Gets the entire user object from firebase
   */
  static async getUser(orgId: string, userId: string): Promise<SomeResult<OWUser>> {
    return this.userDoc(orgId, userId).get()
    .then((sn: any) => {
      //TODO: transform and map here

      return {
        type: ResultType.SUCCESS,
        result: this.snapshotToUser(sn),
      }
    })
    .catch((err: any) => {
      return {
        type: ResultType.ERROR,
        message: `Could not get user for orgId: ${orgId}, userId: ${userId}`
      }
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


    let favouriteResources: Resource[] = [];
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
    }
  }

}

export default FirebaseApi;