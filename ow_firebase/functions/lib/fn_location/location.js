"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = require("express-validation");
const express = require("express");
const bodyParser = require('body-parser');
const Joi = require('joi');
module.exports = (functions, admin) => {
    const app = express();
    app.use(bodyParser.json());
    const fs = admin.firestore();
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
    const fb = require('firebase-admin');
    app.post('/:orgId/', validate(createGroupValidation), (req, res, next) => {
        console.log("req.query", req.params);
        const orgId = req.params.orgId;
        //Ensure geopoints get added properly
        const newCoords = req.body.coords.map(c => new fb.firestore.GeoPoint(c.latitude, c.longitude));
        req.body.coords = newCoords;
        console.log("org id:", orgId);
        //Ensure the orgId exists
        const orgRef = fs.collection('org').doc(orgId);
        return orgRef.get()
            .then(doc => {
            if (!doc.exists) {
                throw new Error(`Org with id: ${orgId} not found`);
            }
        })
            .then(() => fs.collection(`/org/${orgId}/group`).add(req.body))
            .then(result => res.json({ groupId: result.id }))
            .catch(err => next(err));
    });
    return functions.https.onRequest(app);
};
//# sourceMappingURL=location.js.map