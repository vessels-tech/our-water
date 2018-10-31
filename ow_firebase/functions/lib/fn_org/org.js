"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = require("express-validation");
const express = require("express");
const Firestore_1 = require("../common/apis/Firestore");
const bodyParser = require('body-parser');
const Joi = require('joi');
module.exports = (functions) => {
    const app = express();
    app.use(bodyParser.json());
    app.get('/', (req, res) => {
        console.log("TODO");
        res.json(['test_12345', 'mywell', 'igrac']);
    });
    const createOrgValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            name: Joi.string().required(),
            url: Joi.string().hostname(),
        }
    };
    app.post('/', validate(createOrgValidation), (req, res) => {
        return Firestore_1.default.collection('org').add(req.body)
            .then(result => {
            return res.json({ orgId: result.id });
        });
    });
    return functions.https.onRequest(app);
};
//# sourceMappingURL=org.js.map