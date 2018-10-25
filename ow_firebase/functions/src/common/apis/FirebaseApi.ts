import { SomeResult, ResultType } from "../types/AppProviderTypes";

import firestore from './Firestore';
import { Resource } from "../models/Resource";
import OWGeoPoint from '../models/OWGeoPoint';


export default class FirebaseApi {

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
}