import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import { gzipSync } from 'zlib';
import { deepStrictEqual } from 'assert';
import { resource } from '..';

const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin')

import { SyncMethodValidation } from '../common/enums/SyncMethod';

module.exports = (functions, admin) => {
  const app = express();
  app.use(bodyParser.json());
  const fs = admin.firestore();

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);


  app.use(function (err, req, res, next) {
    console.log("error", err);

    if (err.status) {
      return res.status(err.status).json(err);
    }

    return res.status(500).json({ status: 500, message: err.message });
  });

  /**
   * createSync
   * 
   * Creates a new sync with the given settings
   * 
   * Example:
   


   */
  const createSyncValidation = {
    options: {
      allowUnknownBody: false,
    },
    body: {
      data: {
        isOneTime: Joi.boolean().required(),
        datasource: Joi.object().keys({
          //TODO: add more to this later
          type: Joi.string().required(),
          url: Joi.string().required(),
        }).required(),
        type: Joi.string().required(),
        selectedDatatypes: Joi.ar
      } 
    }
  }


  //TODO: implementation


  /**
   * runSync(orgId, syncId)
   * 
   * runs the sync of the given id.
   * Syncs each have a number of methods:
   * - validate
   * - pushTo
   * - pullFrom
   * 
   * later on
   * - get (returns the given data for the sync)
   * - post (updates the given data for ths sync)
   *
   * //TODO: auth - make admin only
   */

   const runSyncValidation = {
     params: {
       method: SyncMethodValidation.required()
     }
   }

   app.get('/:orgId/run/:syncId', (req, res, next) => {

    //load the sync
    //run the sync,
    //return a runId (org/orgId/sync/syncId/run/runId), that will identify this run
    //that way, this can be run without timeout
    //depending on the type, call getDataFromDatasource, and/or pushData
    //update the date of the sync.


   });
};