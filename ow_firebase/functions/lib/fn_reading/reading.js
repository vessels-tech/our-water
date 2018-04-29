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
     * Record a new reading
     *
     * Example:
     * {
     *   "datetime":"2018-04-28T09:40:38.460Z",
     *   "value":"123"
     * }
     */
    const createReadingValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            datetime: Joi.string().isoDate().required(),
            value: Joi.number().required()
        }
    };
    app.post('/:orgId/:resourceId/reading', validate(createReadingValidation), (req, res, next) => {
        const { orgId, resourceId } = req.params;
        //Convert string date to firestore date
        req.body.datetime = new Date(req.body.datetime);
        //Add the resourceId to the body
        req.body.resourceId = resourceId;
        //TODO: custom validate depending on resource type
        //Date can't be in the future
        //Ensure the orgId + resource exists
        const resourceRef = fs.collection('org').doc(orgId).collection('resource').doc(resourceId);
        return resourceRef.get()
            .then(doc => {
            if (!doc.exists) {
                throw new Error(`Resource with with orgId: ${orgId}, resourceId: ${resourceId} not found`);
            }
        })
            //TODO: standardize all these refs
            .then(() => fs.collection(`/org/${orgId}/reading/`).add(req.body))
            .then(result => res.json({ reading: result.id }))
            .catch(err => next(err));
    });
    return functions.https.onRequest(app);
};
//# sourceMappingURL=reading.js.map