"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = require("express-validation");
const express = require("express");
const moment = require("moment");
const utils_1 = require("../../common/utils");
const FirebaseAdmin_1 = require("../../common/apis/FirebaseAdmin");
const bodyParser = require('body-parser');
const Joi = require('joi');
module.exports = (functions) => {
    const app = express();
    app.use(bodyParser.json());
    utils_1.enableLogging(app);
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
     * GET reading
     * Get all the readings for an orgId + resourceId
     */
    const getReading = (orgId, resourceId, last_createdAt = moment().valueOf(), limit = 25) => {
        return FirebaseAdmin_1.firestore.collection('org').doc(orgId)
            .collection('reading')
            .where('resourceId', '==', resourceId)
            .orderBy('createdAt')
            .startAfter(last_createdAt)
            .limit(limit)
            .get();
    };
    app.get('/:orgId/:resourceId', (req, res, next) => {
        const { orgId, resourceId } = req.params;
        const { last_createdAt, limit } = req.query;
        return getReading(orgId, resourceId, last_createdAt, limit)
            .then(snapshot => utils_1.snapshotToResourceList(snapshot))
            .then(resources => res.json(resources))
            .catch(err => next(err));
    });
    /**
     * saveReading
     * Records a new reading for a given orgId + resourceId
     *
     * Example:
     * "data" {
     *   "datetime":"2018-04-28T09:40:38.460Z",
     *   "value":"123"
     * }
     */
    const createReadingValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            data: {
                datetime: Joi.string().isoDate().required(),
                value: Joi.number().required()
            }
        }
    };
    //Format the reading to be saved into the database
    const formatNewReading = (data, resourceId) => {
        return Object.assign({ datetime: new Date(data.datetime), resourceId }, data);
    };
    app.post('/:orgId/:resourceId/reading', validate(createReadingValidation), (req, res, next) => {
        const { orgId, resourceId } = req.params;
        const data = formatNewReading(req.body.data, resourceId);
        //TODO: custom validate depending on resource type
        //e.g. Date can't be in the future
        //Ensure the orgId + resource exists
        const resourceRef = FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection('resource').doc(resourceId);
        return resourceRef.get()
            .then(doc => {
            if (!doc.exists) {
                throw new Error(`Resource with with orgId: ${orgId}, resourceId: ${resourceId} not found`);
            }
        })
            //TODO: standardize all these refs
            .then(() => FirebaseAdmin_1.firestore.collection(`/org/${orgId}/reading/`).add(data))
            .then(result => res.json({ reading: result.id }))
            .catch(err => next(err));
    });
    /**
     * legacy_saveReading
     * Records a reading from the legacy MyWell System
     *
     * @param {string} orgId - the organisation id
     * @param {string} legacyResourceId - a lecacy resourceId, of the format `pincode.resourceId`, eg 313603.1120
     */
    app.post('/legacy_save/:orgId/:legacyResourceId', validate(createReadingValidation), (req, res, next) => {
        const { orgId, legacyResourceId } = req.params;
        //First, look up the resource based on the legacy id
        return FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection('resource')
            .where('legacyResourceId', '==', legacyResourceId).get()
            .then(snapshot => {
            const resources = [];
            snapshot.forEach(doc => resources.push(Object.assign({ id: doc.id }, doc.data())));
            if (resources.length === 0) {
                const error = new Error(`No legacy resource found for legacyResourceId: ${legacyResourceId}`);
                return Promise.reject(error);
            }
            if (resources.length > 1) {
                console.error(`Found ${resources.length} resources for legacyResourceId: ${legacyResourceId}. Expected 1.`);
            }
            console.log('found legacy res', resources);
            return resources[0];
        })
            .then(newResource => {
            const data = formatNewReading(req.body.data, newResource.id);
            console.log("data is:", data);
            return FirebaseAdmin_1.firestore.collection(`/org/${orgId}/reading/`).add(data);
        })
            .then(result => res.json({ reading: result.id }))
            .catch(err => next(err));
    });
    return functions.https.onRequest(app);
};
//# sourceMappingURL=reading.js.map