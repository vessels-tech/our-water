"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require('body-parser');
const Joi = require('joi');
const app = express();
app.use(bodyParser.json());
const validation = {
    body: {
        name: Joi.string().required(),
        url: Joi.string().hostname(),
    }
};
//TODO: fix this error handler
// app.use(function (err, req, res, next) {
//   console.log("error", err);
//   if (err.status) {
//     return res.status(err.status).json(err);
//   }
//   return res.status(500).json({status:500, message: err.message});
// });
// app.post('*', validate(validation), (req, res) => {
app.get('/', (req, res) => res.send("hello"));
app.post('/', (req, res) => {
    //Create the 
    console.log(req.body);
    res.status(200).send("hello there");
});
module.exports = functions.https.onRequest(app);
//# sourceMappingURL=registerOrg.js.map