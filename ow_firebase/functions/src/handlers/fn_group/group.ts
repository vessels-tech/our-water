import * as validate from 'express-validation';
import * as express from 'express';
import OWGeoPoint from '../common/models/OWGeoPoint';
import firestore from '../common/apis/Firestore';


const bodyParser = require('body-parser');
const Joi = require('joi');


module.exports = (functions) => {
  const app = express();
  app.use(bodyParser.json());


  // const defaultErrorHandler = require('../common/defaultErrorHandler');

  //TODO: fix this error handler
  // app.use(defaultErrorHandler);

  app.use(function (err, req, res, next) {
    console.log("error", err);

    if (err.status) {
      return res.status(err.status).json(err);
    }

    return res.status(500).json({ status: 500, message: err.message });
  });

  app.get('/:orgId', (req, res) => res.send("TODO"));


  const createGroupValidation = {
    options: {
      allowUnknownBody: false,
    },
    body: {
      coords: Joi.array().items(Joi.object().keys({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      })).required(),
      //TODO: make proper enums
      type: Joi.valid('village', 'pincode', 'country').required(),
      name: Joi.string().required()
    }
  };

  const fb = require('firebase-admin')
  app.post('/:orgId/', validate(createGroupValidation), (req, res, next) => {
    const orgId = req.params.orgId;

    //Ensure geopoints get added properly
    const newCoords = req.body.coords.map(c => new OWGeoPoint(c.latitude, c.longitude));
    req.body.coords = newCoords;

    console.log("org id:", orgId );

    //Ensure the orgId exists
    const orgRef = firestore.collection('org').doc(orgId)
    return orgRef.get()
    .then(doc => {
      if (!doc.exists) {
        throw new Error(`Org with id: ${orgId} not found`);
      }
    })
    .then(() => firestore.collection(`/org/${orgId}/group`).add(req.body))
    .then(result => res.json({ groupId: result.id }))
    .catch(err => next(err));
  });


  /**
   * getResourcesForGroup
   * 
   * Returns all the resources for a given group
   */
  const getReadingsForGroupValidation = {
    options: {
      allowUnknownBody: false,
    },
    query: {
      type: Joi.valid('well', 'raingauge', 'checkdam').optional(),
    }
  };

  app.get('/:orgId/:groupId/resource', (req, res, next) => {
    const { type } = req.query;
    const { orgId, groupId } = req.params;

    // // Create a reference to the cities collection
    // var citiesRef = db.collection('cities');

    // // Create a query against the collection
    // var queryRef = citiesRef.where('state', '==', 'CA');
    const readingsRef = firestore.collection(`/org/${orgId}/resource`)
      .where(`groups.${groupId}`, '==', true).get()
      .then(snapshot => {
        const resources = []
        snapshot.forEach(doc => resources.push(doc.data()));
        res.json(resources);
      })
      .catch(err => next(err));
  });


  return functions.https.onRequest(app);
};
