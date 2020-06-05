import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import * as moment from 'moment';
import { Group } from '../../common/models/Group';
import { GroupType } from '../../common/enums/GroupType';
import { Resource } from '../../common/models/Resource';
import { isNullOrUndefined } from 'util';
import ResourceIdType from '../../common/types/ResourceIdType';
import { resourceTypeFromString } from '../../common/enums/ResourceType';
import FirebaseApi from '../../common/apis/FirebaseApi';
import { firestore } from '../../common/apis/FirebaseAdmin';
import ErrorHandler from '../../common/ErrorHandler';

//@ts-ignore
import * as morgan from 'morgan';
//@ts-ignore
import * as morganBody from 'morgan-body';
import { ggmnResourceEmailValidation } from './validation';
import EmailApi from '../../common/apis/EmailApi';
import { PendingResource, OWGeoPoint, PendingReading, MyWellResource } from 'ow_types';
import GGMNApi from '../../common/apis/GGMNApi';
import { validateFirebaseIdToken } from '../../middleware';
import { ResultType, unsafeUnwrap } from 'ow_common/lib/utils/AppProviderTypes';
import { enableLogging, getDefaultTimeseries } from '../../common/utils';
import { UserApi, ResourceApi } from 'ow_common/lib/api';
import { User } from 'ow_common/lib/model/User';
import UserStatus from 'ow_common/lib/enums/UserStatus';
import { DefaultMyWellResource } from 'ow_common/lib/model';

const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin')
require('express-async-errors');

module.exports = (functions) => {
  const app = express();
  app.use(bodyParser.json());
  enableLogging(app);

  app.use(validateFirebaseIdToken);

  const getOrgs = (orgId, last_createdAt = moment().valueOf(), limit = 25) => {
    return firestore.collection('org').doc(orgId)
      .collection('resource')
      .orderBy('createdAt')
      .startAfter(last_createdAt)
      .limit(limit)
      .get();
  }

  /**
   * return all the resources in a given organisation, containing the latest reading
   */
  app.get('/:orgId', (req, res, next) => {
    const orgId = req.params.orgId;
    const { last_createdAt, limit } = req.query;

    // const resourceRef = firestore.collection('org').doc(orgId).collection('resource');
    //@ts-ignore
    return getOrgs(orgId, last_createdAt, limit)
      .then(snapshot => {

        const resources = [];
        snapshot.forEach(function (doc) {
          resources.push(doc.data());
        });
      
        //Sadly this doesn't give us the nested reading.
        //It also doesn't give us the document containing the resources...
        //One way to do this would be to store readings in an array on this object, but I'm worried about performance issues
        return res.json(resources);
      })
      .catch(err => next(err));
  });

  app.get('/:orgId/test', (req, res, next) => {
    console.log("running TEST function");
    const orgId = req.params.orgId;

    // Try saving a new group
    const coords = [
      new OWGeoPoint(34.34, -115.67),
    ];

    const group = new Group('5000', orgId, GroupType.Pincode, coords, null);
    return group.create({firestore})
    .then((saved) => res.json(saved));
  });


  /**
   * createResource
   * 
   * Creates a new resource for a given org
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
          createdByUserId: Joi.string().required(),
        }),
        groups: Joi.object().keys({
          legacyResourceId: Joi.string().optional(),
          pincode: Joi.string().optional(),
          country: Joi.string().optional(),
        }),
        resourceType: Joi.valid('well', 'raingauge', 'checkdam', 'quality', 'custom').required(),
      },
    }
  };

  app.post('/:orgId/', validate(createResourceValidation), async (req, res, next) => {
    const orgId = req.params.orgId;
    const resourceApi = new ResourceApi(firestore, orgId);

    //Ensure geopoints get added properly
    const oldCoords = req.body.data.coords;
    const newCoords = new fb.firestore.GeoPoint(oldCoords.latitude, oldCoords.longitude);
    req.body.data.coords = newCoords;

    //Add default lastReading
    req.body.data.lastValue = 0;
    req.body.data.lastReadingDatetime = new Date(0);
    req.body.orgId = orgId;

    const timeseries = unsafeUnwrap(await getDefaultTimeseries(req.body.data.resourceType));
    const resource: MyWellResource = {
      ...DefaultMyWellResource,
      ...req.body.data,
      timeseries,
    };

    let id;
    //Ensure the orgId exists
    const orgRef = firestore.collection('org').doc(orgId)
    return orgRef.get()
      .then(doc => {
        if (!doc.exists) {
          throw new Error(`Org with id: ${orgId} not found`);
        }
      })
      .then(() => {
        const ref = resourceApi.resourceRef();
        id = ref.id;
        return ref.create({...resource, id});
      })
      .then(() => res.json({id}))
      .catch(err => next(err));
  });

  /**
   * updateResource
   * TD: this is outdated, Don't use until it's fixed.
   * 
   * PUT /:orgId/:resourceId
   */
  const updateResourceValidation = {
    options: {
      allowUnknownBody: true,
    },
    body: {
      //This is annoying...
      data: {
        coords: Joi.object().keys({
          _latitude: Joi.number().optional(),
          _longitude: Joi.number().optional(),
        }).optional(),
        owner: Joi.object().keys({
          name: Joi.string().optional(),
          createdByUserId: Joi.string().optional(),
        }).optional(),
        externalIds: Joi.object().optional(),
        imageUrl: Joi.string().optional(),
        resourceType: Joi.valid('well', 'raingauge', 'checkdam').optional()
      },
    }
  };

  app.put('/:orgId/:resourceId', validate(updateResourceValidation), async (req, res, next) => {
    const { orgId, resourceId } = req.params;
    const newData = req.body.data;

    try {
      //get the resource
      const resource = await Resource.getResource({ orgId, id: resourceId, firestore});
      const modifiableKeys = ['owner', 'externalIds', 'resourceType', 'coords'];
      modifiableKeys.forEach(key => {
        let newValue = newData[key];
        if (isNullOrUndefined(newValue)) {
          return;
        }
        
        if (key === 'externalIds') {
          newValue = ResourceIdType.deserialize(newValue);
        }

        if (key === 'resourceType') {
          newValue = resourceTypeFromString(newValue);
        }

        resource[key] = newValue;
      });

      await resource.save({ firestore});
      return res.json(resource);
    } catch (err) {
      next(err);
      return;
    }
  });

  app.post('/:orgId/ggmnResourceEmail', validate(ggmnResourceEmailValidation), async(req, res) => {
    const { subject, message } = req.body;
    const pendingResources: PendingResource[] = req.body.pendingResources;
    const pendingReadings: PendingReading[] = req.body.pendingReadings;
    
    const attachments = [];

    console.log("pre resources");

    /* only add the pending resouces if the user is trying to save new resources */
    if (pendingResources.length > 0) {
      const generateZipResult = await GGMNApi.pendingResourcesToZip(pendingResources);
      
      if (generateZipResult.type === ResultType.ERROR) {
        console.log("ggmnResourceEmail generateZipResult error", generateZipResult.message);
        throw new Error(generateZipResult.message);
      }
      attachments.push({ filename: 'id.zip', path: generateZipResult.result});
    }

    console.log("generated pending resources. Now generating csv");

    const generateCSVResult = await GGMNApi.pendingResourceToCSV(pendingResources, pendingReadings, ['GWmMSL', 'GWmBGS']);
    if (generateCSVResult.type === ResultType.ERROR) {
      console.log("ggmnResourceEmail generateCSVResult error", generateCSVResult.message);
      throw new Error(generateCSVResult.message);
    }

    console.log("generated csv");

    attachments.push({ filename: 'id.csv', path: generateCSVResult.result});
    const sendEmailResult = await EmailApi.sendResourceEmail(req.body.email, subject, message, attachments);
    if (sendEmailResult.type === ResultType.ERROR) {
      console.log("Error sending emails:", sendEmailResult.message);
      throw new Error(sendEmailResult.message);
    }

    console.log("sent email");

    res.json(true);
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
    const readingsRef = firestore.collection(`/org/${orgId}/reading`)
      .where(`resourceId`, '==', resourceId).get()
      .then(snapshot => {
        const resources = []
        snapshot.forEach(doc => resources.push(doc.data()));
        res.json(resources);
      })
      .catch(err => next(err));
  });


  /**
   * getResourceNearLocation
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

  app.get('/:orgId/nearLocation', validate(getResourceNearLocationValidation), async (req, res, next) => {
    const { latitude, longitude, distance } = req.query;
    const { orgId } = req.params;
    const fbApi = new FirebaseApi(firestore);

    // @ts-ignore
    const result = await fbApi.resourcesNearLocation(orgId, latitude, longitude, distance);
    if (result.type === ResultType.ERROR) {
      next(result.message);
      return;
    }

    res.json(result.result);
  });

  /**
   * SyncUserData
   * POST /:orgId/:userId/sync
   * 
   * Synchronises the user's pendingResources and pendingReadings, and cleans them up
   * The user MUST be approved before calling this method. 
   *
   */
  app.post('/:orgId/:userId/sync', async (req, res) => {
    const { orgId, userId } = req.params;
    const userApi = new UserApi(firestore, orgId);
    const resourceApi = new ResourceApi(firestore, orgId);
    const fbApi = new FirebaseApi(firestore);

    const userResult = await userApi.getUser(userApi.userRef(orgId, userId));
    if (userResult.type === ResultType.ERROR) {
      return res.status(400).send(`Couldn't find user with orgId: ${orgId}, userId: ${userId}`);
    }
    if (userResult.result.status !== UserStatus.Approved) {
      return res.status(403).send("unauthorized");
    }

    const resourceIds = unsafeUnwrap(await fbApi.syncPendingForUser(orgId, userId));
   
    /* Get a list of resources */
    const resources = unsafeUnwrap(await resourceApi.getResourcesForIds(resourceIds));
   
    /* Add to the user's favourites */
    unsafeUnwrap(await userApi.addFavouriteResources(userId, resources));
    
    /* Add to the user's new resources */
    //This is non critical - we don't care if it fails.
    await userApi.markAsNewResources(userId, resourceIds);

    return res.status(204).send("true");
  });

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
};
