import { NetInfo } from 'react-native';
import firebase from 'react-native-firebase';
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

const fs = firebase.firestore();
const auth = firebase.auth();
// const config = firebase.config();
const baseUrl = Config.REACT_APP_BASE_URL;
const timeout = 1000 * 10;

class FirebaseApi {

  /**
   * call this before everything, to make sure we're turning firestore off and on
   */
  static checkNetworkAndToggleFirestore() {
    return NetInfo.isConnected.fetch()
    .then(isConnected => {
      console.log('isConnected', isConnected);
      if (isConnected) {
        return fs.enableNetwork().then(() => true);
      }

      return fs.disableNetwork().then(() => false);
    });
  }

  
  static signIn() {
    return auth.signInAnonymouslyAndRetrieveData();
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
      delete favouriteResources[resourceId];

      return this.updateFavouriteResources(orgId, userId, favouriteResources);
    });  
  }

  static isInFavourites(orgId: string, resourceId: string, userId: string) {
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

  static getRecentResources(orgId: string, userId: string) {
    return fs.collection('org').doc(orgId).collection('user').doc(userId).get()
      .then(sn => {
        //@ts-ignore
        if (!sn || !sn.data() || !sn.data().recentResources) {
          return [];
        }

        //@ts-ignore
        return sn.data().recentResources;
      });
  }

  static addRecentResource(orgId: string, resource: any, userId: string) {

    return this.getRecentResources(orgId, userId)
    .then(recentResources => {
      //only keep the last 5 resources
      recentResources.unshift(resource);
      
      //remove this resource from later on if it already exists
      const dedupDict = {};
      recentResources.forEach((res: any) => { dedupDict[res.id] = res});
      const dedupList = Object.keys(dedupDict).map(id => dedupDict[id]);

      while (dedupList.length > 5) {
        dedupList.pop();
      }

      return fs.collection('org').doc(orgId).collection('user').doc(userId).set({ recentResources: dedupList }, {merge: true});
    });
  }

  static getResourcesForOrg({ orgId }) {
    return fs.collection('org').doc(orgId).collection('resource').get()
      .then(sn => {
        const resources = [];
        sn.forEach((doc) => {
          //Get each document, put in the id
          const data = doc.data();
          data.id = doc.id;
          resources.push(data);
        });

        return resources;
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
  static dep_getResourceNearLocation({orgId, latitude, longitude, distance}) {
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
      .then(response => {
        if (!response.ok) {
          return rejectRequestWithError(response.status);
        }

        return response.json();
      })
      .catch(err => console.log(err));
  }

  /**
   * Local implementation of getResourceNearLocation
   * 
   * We use this instead of the get request, as it will default to the cache if we're offline
   * @param {*} param0 
   */
  static getResourceNearLocation(networkApi, { orgId, latitude, longitude, distance }) {
    const { minLat, minLng, maxLat, maxLng } = boundingBoxForCoords({longitude, latitude, distance});

    return this.checkNetworkAndToggleFirestore()
    .then(() => {
      return fs.collection('org').doc(orgId).collection('resource')
        .where('coords', '>=', new firebase.firestore.GeoPoint(minLat, minLng))
        .where('coords', '<=', new firebase.firestore.GeoPoint(maxLat, maxLng)).get()
    })
    .then(snapshot => {
      const resources = []
      snapshot.forEach(doc => {
        const data = doc.data();
        data.id = doc.id;

        // Filter based on longitude. TODO: remove this once google fixes the above query
        if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
          return;
        }

        resources.push(data);
      });

      return resources;
    })
    .catch(err => console.log(err));
  }

  static createNewResource({ orgId, resourceData }) {
    const resource = functions.httpsCallable(`resource/${orgId}`);

    //TODO: cors, figure out how to set the path here.
    return resource(resourceData)
      .then(result => {
        // Read result of the Cloud Function.
      })
  };


  /**
   * saveReadingPossiblyOffline
   * 
   * saves a reading, Promise resolves when the reading appears in local cache, 
   * and not actually commited to the server
   */
  static saveReadingPossiblyOffline({orgId, reading}) {
    return new Promise((resolve, reject) => {

      this.pendingReadingsListener({orgId})
      .then(snapshot => {

        //Resolve once the pending reading is saved
        resolve(true);
      });

      this.saveReading({orgId, reading})
      //Don't resolve this - as if we are offline, it will take a long time
      .then(result => console.log('saveReading result', result))
      .catch(err => {
        console.log('saveReading Err', err);
        reject(err);
      });
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

  static saveReading({orgId, reading}) {
    return validateReading(reading)
    .then(validReading => {

      //Don't return this promise. Indicate success or failure based on watching
      //the snapshot 
      fs.collection('org').doc(orgId)
        .collection('reading').add(validReading);
    })
    .catch(err => { 
      console.log('error is', err);
      return Promise.reject(err);
    });
  }


  static pendingReadingsListener({orgId}) {
    return new Promise((resolve, reject) => {
      fs.collection('org').doc(orgId).collection('reading')
        .onSnapshot(
          //optionsOrObserverOrOnNext
          (sn) => {
            if (sn.docChanges.length > 0) {
              return resolve(sn);
            }
            reject(new Error('recieved snapshot with no changes'))
          },
          (sn) => console.log("observerOrOnNextOrOnError", thing), //observerOrOnNextOrOnError
          //onError
          (error) => {
            console.log("error", error);
            return reject(error);
          },
          (sn) => console.log('onCompletion', sn), //onCompletion
      );
    });
  }


  static listenForPendingReadings({orgId}, callback) {
    fs.collection('org').doc(orgId).collection('reading')
      .onSnapshot(
        {
          includeQueryMetadataChanges: true,
        },
        //optionsOrObserverOrOnNext
        (sn) => {
          callback(sn);
        },
        //onError
        (error) => {
          console.log("error", error);
          return reject(error);
        },
        (sn) => console.log('onCompletion', sn), //onCompletion
    );
  }

  static listenForUpdatedUser({orgId, userId}, cb) {
    const ref = fs.collection('org').doc(orgId)
        .collection('user').doc(userId);

    return ref.onSnapshot(cb);
  }

  /**
   * Do a basic search, where we filter by resourceId
   * This is suboptimal, as we have to load all resources first. 
   * 
   * Searching is a little tricky, we need to figure out by which fields that
   * the user is likely to search by first (eg. groupName, )
   */
  static performBasicSearch({orgId, text}) {
    return this.getResourcesForOrg({orgId})
      .then(resources => {
        return resources.filter(resource => {
          return resource.id.toLowerCase().indexOf(text.toLowerCase()) >= 0;
        });
      });
  }
}

export default FirebaseApi;