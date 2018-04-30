import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import { gzipSync } from 'zlib';
import { deepStrictEqual } from 'assert';
import { resource } from '..';

const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin')

module.exports = (functions, admin) => {
  const app = express();
  app.use(bodyParser.json());
  const fs = admin.firestore();

  /* CORS Configuration */
  const openCors = cors({origin: '*'});
  app.use(openCors);
  // app.options('/', openCors) // enable pre-flight request for DELETE request


  //TODO: fix this error handler
  // app.use(defaultErrorHandler);

  app.use(function (err, req, res, next) {
    console.log("error", err);

    if (err.status) {
      return res.status(err.status).json(err);
    }

    return res.status(500).json({ status: 500, message: err.message });
  });

  /**
   * return all the resources in a given organisation, containing the latest reading
   */
  app.get('/:orgId', (req, res, next) => {
    const orgId = req.params.orgId;

    // const resourceRef = fs.collection('org').doc(orgId).collection('resource');
    return fs.collection('org').doc(orgId).collection('resource').get()
    .then(snapshot => {

      const resources = [];
      snapshot.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        resources.push(doc.data());
      });
    
      //Sadly this doesn't give us the nested reading.
      //It also doesn't give us the document containing the resources...
      //One way to do this would be to store readings in an array on this object, but I'm worried about performance issues
      return res.json(resources);
    })
    .catch(err => next(err));
  });


  /**
   * createResource
   * 
   *  Example:
   *  {
   *    "coords": {"latitude":13.2, "longitude":45.4},
   *    "type": "well",
   *    "owner": { "name": "Ram Ji"},
   *    "imageUrl": "s3://location",
   *    "groups": {
   *       "9waUCZJIDvGXJzAi64BX": true
   *     }
   *  }
   */
  const createResourceValidation = {
    options: {
      allowUnknownBody: false,
    },
    body: {
      //This is annoying...
      data: {
        coords: Joi.object().keys({
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
        }).required(),
        //TODO: make proper enums
        owner: Joi.object().keys({
          name: Joi.string().required(),
        }),
        groups: Joi.object().optional(),
        imageUrl: Joi.string().optional(),
        //We will create an index on this to make this backwards compatible with MyWell
        legacyId: Joi.string().optional(),
        type: Joi.valid('well', 'raingauge', 'checkdam').required()
      },
      //TODO: add custom fields based on type
    }
  };

  app.post('/:orgId/', validate(createResourceValidation), (req, res, next) => {
  // app.post('/:orgId/', (req, res, next) => {
    console.log('body is', req.body);

    const orgId = req.params.orgId;

    //Ensure geopoints get added properly
    const oldCoords = req.body.data.coords;
    const newCoords = new fb.firestore.GeoPoint(oldCoords.latitude, oldCoords.longitude);
    req.body.data.coords = newCoords;

    console.log("org id:", orgId);

    //Add default lastReading
    req.body.data.lastValue = 0;
    req.body.data.lastReadingDatetime = new Date(0);

    //Ensure the orgId exists
    const orgRef = fs.collection('org').doc(orgId)
    return orgRef.get()
      .then(doc => {
        if (!doc.exists) {
          throw new Error(`Org with id: ${orgId} not found`);
        }
      })
      //TODO: standardize all these refs
      .then(() => fs.collection(`/org/${orgId}/resource`).add(req.body.data))
      .then(result => res.json({ resource: result.id }))
      .catch(err => next(err));
  });

  /**
   * getReadingsForResource
   * 
   * Returns all the readings for a given resource, optionally filtering by type.
   * May need 
   */
  const getReadingsForResourceValidation = {
    options: {
      allowUnknownBody: false,
    },
    query: {
      type: Joi.valid('well', 'raingauge', 'checkdam').optional(),
    }
  };

  app.get('/:orgId/:resourceId/reading', validate(getReadingsForResourceValidation), (req, res, next) => {
    const { type } = req.query;
    const { orgId, resourceId } = req.params;

    // // Create a reference to the cities collection
    // var citiesRef = db.collection('cities');

    // // Create a query against the collection
    // var queryRef = citiesRef.where('state', '==', 'CA');

    //TODO: implement optional type filter
    const readingsRef = fs.collection(`/org/${orgId}/reading`)
      .where(`resourceId`, '==', resourceId).get()
      .then(snapshot => {
        console.log("snapshot", snapshot);
        const resources = []
        snapshot.forEach(doc => resources.push(doc.data()));
        res.json(resources);
      })
      .catch(err => next(err));
  });


  /**
   * getResourceNearLocationValidation
   * 
   * Returns all the resources near a given location.
   * Basic geoquery, creates a square bounding box (sorry, nothing too fancy here).
   * 
   * Currently, the cloudstore database only filters by latitude, and not longitude.
   * So this endpoint queries based on latitude, and then manually filters.
   * See: https://github.com/invertase/react-native-firebase/issues/561, 
   *  and https://gist.github.com/zirinisp/e5cf5d9c33cb0bd815993900618eafe0
   * 
   * It seems if we want more advanced geo queries, we will have to implement that ourselves. Some people sync
   * their data to Algolia, which allows them to peform these complex queries. That could work in the future, 
   * but for now, this will do.
   * 
   * @param {number} latitude  - the Latitude of the centre point
   * @param {number} longitude - the Longitude of the centre point
   * @param {float}  distance  - between 0 & 1, how far the search should go. Min x m, Max 10km (approximate)
   */

  const getResourceNearLocationValidation = {
    options: {
      allowUnknownBody: false,
    },
    query: {
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      distance: Joi.number().max(1).min(0).required(),
    }
  };

  app.get('/:orgId/nearLocation', validate(getResourceNearLocationValidation), (req, res, next) => {
    const { latitude, longitude, distance } = req.query;
    const { orgId } = req.params;

    const distanceMultiplier = 10; //TODO: tune this value based on the queries we are getting back once we can see it a map

    const minLat = latitude - distanceMultiplier * distance;
    const minLng = longitude - distanceMultiplier * distance;
    const maxLat = latitude + distanceMultiplier * distance;
    const maxLng = longitude + distanceMultiplier * distance;

    console.log(`Coords are: min:(${minLat},${minLng}), max:(${maxLat},${maxLng}).`);
    
    const readingsRef = fs.collection(`/org/${orgId}/resource`)
      .where('coords', '>=', new fb.firestore.GeoPoint(minLat, minLng))
      .where('coords', '<=', new fb.firestore.GeoPoint(maxLat, maxLng)).get()
      .then(snapshot => {
        const resources = []
        snapshot.forEach(doc => {
          const data = doc.data();

          // Filter based on longitude. TODO: remove this once google fixes this query
          if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
            return;
          }

          resources.push(data);
        });
        
        res.json(resources);
      })
      .catch(err => next(err));
  });



  return functions.https.onRequest(app);
};
