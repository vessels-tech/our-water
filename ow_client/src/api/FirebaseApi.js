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
const baseUrl = Config.REACT_APP_BASE_URL;
const timeout = 1000 * 10;

class FirebaseApi {

  static signIn() {
    return auth.signInAnonymouslyAndRetrieveData();
  }

  static addFavouriteResource({orgId, resourceId, userId}) {
    return null;
  }

  static removeFavouriteResource({ orgId, resourceId, userId}) {
    return null;
  }

  static addRecentResource({ orgId, resourceId, userId}) {
    const recentResources = [resourceId];
    //TODO: get the recent resources first
    //TODO: only keep the last 5 
    return fs.collection('org').doc(orgId).collection('user').doc(userId).set({recentResources})
      .then(result => console.log(result))
      .catch(err => console.log(err))
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
          console.log(response._bodyText);
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
  static getResourceNearLocation({ orgId, latitude, longitude, distance }) {
    const { minLat, minLng, maxLat, maxLng } = boundingBoxForCoords({longitude, latitude, distance});

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
    console.log('save reading');
    return validateReading(reading)
    .then(validReading => {
      console.log('validReading', validReading);
      return fs.collection('org').doc(orgId)
        .collection('reading').add(validReading);

      // return fs.collection('org').doc(orgId).set({
      //   reading: validReading,
      // }, {merge: true})
    })
    //This only resolves when the reading is actually written
    //we need a way to use the pendingReadingsListener here...
    .then(result => {
      console.log('saved reading of id', result.id);
      return result;
    })
    .catch(err => { 
      console.log('error is', err);
      return Promise.reject(err);
    });
  }


  static pendingReadingsListener({orgId}) {
    return fs.collection('org').doc(orgId).collection('reading')
    .onSnapshot(
      (thing) => console.log("thing1", thing), //optionsOrObserverOrOnNext
      (thing) => console.log("thing2", thing), //observerOrOnNextOrOnError
      (error) => console.log("error", error),  //onError
      (thing) => console.log('onCompletion'), //onCompletion
    );
  }
}

export default FirebaseApi;