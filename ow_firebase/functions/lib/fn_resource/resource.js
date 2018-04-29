"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = require("express-validation");
const express = require("express");
const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin');
module.exports = (functions, admin) => {
    const app = express();
    app.use(bodyParser.json());
    const fs = admin.firestore();
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
            type: Joi.valid('well', 'raingauge', 'checkdam').required(),
        }
    };
    app.post('/:orgId/', validate(createResourceValidation), (req, res, next) => {
        const orgId = req.params.orgId;
        //Ensure geopoints get added properly
        const oldCoords = req.body.coords;
        const newCoords = new fb.firestore.GeoPoint(oldCoords.latitude, oldCoords.longitude);
        req.body.coords = newCoords;
        console.log("org id:", orgId);
        //Add default lastReading
        req.body.lastValue = 0;
        //Ensure the orgId exists
        const orgRef = fs.collection('org').doc(orgId);
        return orgRef.get()
            .then(doc => {
            if (!doc.exists) {
                throw new Error(`Org with id: ${orgId} not found`);
            }
        })
            //TODO: standardize all these refs
            .then(() => fs.collection(`/org/${orgId}/resource`).add(req.body))
            .then(result => res.json({ resource: result.id }))
            .catch(err => next(err));
    });
    return functions.https.onRequest(app);
};
//# sourceMappingURL=resource.js.map