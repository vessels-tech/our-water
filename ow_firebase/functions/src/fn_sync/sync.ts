import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import { gzipSync } from 'zlib';
import { deepStrictEqual } from 'assert';
import { resource } from '..';

const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin')

import { SyncMethodValidation, SyncMethod } from '../common/enums/SyncMethod';
import { Sync } from '../common/models/Sync';
import { SyncRun } from '../common/models/SyncRun';
import LegacyMyWellDatasource from '../common/models/Datasources/LegacyMyWellDatasource';
import { METHODS } from 'http';
import Datasource from '../common/models/Datasources/Datasource';
import { DatasourceType } from '../common/enums/DatasourceType';
import { FileDatasource } from '../common/models/Datasources/FileDatasource';
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

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
          
          //TODO: legacy options only
          url: Joi.string(),

          //TODO: file options:
          fileUrl: Joi.string(),
          dataType: Joi.string(),
          fileFormat: Joi.string(),
          options: Joi.object(),
        }).required(),
        type: Joi.string().required(),
        selectedDatatypes: Joi.array().items(Joi.string()).required()
      } 
    }
  }

  const initDatasourceWithOptions = (datasource): Datasource => {
    switch(datasource.type) {
      case DatasourceType.LegacyMyWellDatasource:
        return new LegacyMyWellDatasource(datasource.url);
        
      case DatasourceType.FileDatasource:
        const {fileUrl, dataType, fileFormat, options} = datasource;
        return new FileDatasource(fileUrl, dataType, fileFormat, options);

      default:
        throw new Error(`Tried to initialize Datasource of unknown type: ${datasource.type}`)
    }
  };

  app.post('/:orgId', validate(createSyncValidation), (req, res, next) => {
    const { orgId } = req.params;
    const { isOneTime, datasource, type, selectedDatatypes } = req.body.data;

    const ds = initDatasourceWithOptions(datasource);
    const sync: Sync = new Sync(isOneTime, ds, orgId, [SyncMethod.validate], selectedDatatypes);
    
    return sync.create({fs})
    .then((createdSync: Sync) => {
      return res.json({syncId: createdSync.id});
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
  });


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
     query: {
       method: SyncMethodValidation.required()
     }
   }

  app.get('/:orgId/run/:syncId', validate(runSyncValidation), (req, res, next) => {
    const {orgId, syncId} = req.params;
    const {method} = req.query;

    return Sync.getSync({orgId, id: syncId, fs})
    .then((sync: Sync) => {

      //TODO: put in proper email addresses
      const run: SyncRun = new SyncRun(orgId, syncId, method, ['lewis@vesselstech.com']);
      return run.create({fs});
    })
    .then((run: SyncRun) => {
      //run the sync, and return the id of the run.
      //We don't return the result of this promise. User can look up the results later on
      run.run({fs})
      .catch(err => console.error(`Error running syncRun of id ${run.id}. Message: ${err.message}`));
    
      return res.json({ syncRunId: run.id });
    })
    .catch(err => {
      console.log('error in runSync:', err);
      next(err);
    });
   });

   
  return functions.https.onRequest(app);
};