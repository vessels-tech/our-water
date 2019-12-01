import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import * as moment from 'moment';
import { Storage } from '@google-cloud/storage'

const keyFilename = "./my-private-api-key-file.json"; //replace this with api key file
const projectId = "our-water"
const bucketName = `${projectId}.appspot.com`;
const gcs = new Storage({ projectId });
const bucket = gcs.bucket(bucketName);

const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

import { SyncMethodValidation, SyncMethod } from '../../common/enums/SyncMethod';
import { Sync } from '../../common/models/Sync';
import { SyncRun } from '../../common/models/SyncRun';
import LegacyMyWellDatasource from '../../common/models/Datasources/LegacyMyWellDatasource';
import Datasource from '../../common/models/Datasources/Datasource';
import { DatasourceType } from '../../common/enums/DatasourceType';
import { FileDatasource } from '../../common/models/Datasources/FileDatasource';
import FileDatasourceOptions from '../../common/models/FileDatasourceOptions';
import { createSyncValidation } from './validate';

import { firestore } from '../../common/apis/FirebaseAdmin';
import { enableLogging } from '../../common/utils';

module.exports = (functions) => {
  const app = express();

  app.use(fileUpload());
  app.use(bodyParser.json());
  enableLogging(app);

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
   * GET Syncs
   * 
   * Gets all the syncs for an orgId
   */
  app.get('/:orgId', async (req, res, next) => {
    const { orgId } = req.params;
    let syncsJson;

    try {
      const syncs = await Sync.getSyncs(orgId, firestore);
      syncsJson = syncs.map(sync => sync.serialize());
    } catch (err) {
      next(err);
      return;
    }

    return res.json({ data: syncsJson });
  });

  /**
   * GET syncRunsForSync
   * 
   * Gets the sync runs for a given sync run
   */
  app.get('/:orgId/syncRuns/:syncId', async (req, res, next) => {
    const { orgId, syncId } = req.params;

    let syncRunsJson;
    try {
      const syncRuns = await SyncRun.getSyncRuns({orgId, syncId, firestore});
      syncRunsJson = syncRuns.map(syncRun => syncRun.serialize());
    } catch(err) {
      next(err);
      return;
    }

    return res.json({data: syncRunsJson});
  });

  /**
   * DELETE sync
   * 
   * Delete the sync for an id
   */
  app.delete('/:orgId/:id', async (req, res, next) => {
    const { orgId, id } = req.params;

    try {
      const sync = await Sync.getSync({orgId, id, firestore});
      sync.delete({firestore});
    } catch(err) {
      next(err);
      return;
    }
    return res.json({data:true});
  });


  /**
   * createSync
   * 
   * Creates a new sync with the given settings
   */ 
  const initDatasourceWithOptions = (datasource): Datasource => {
    console.log("datasource", datasource);
    switch(datasource.type) {
      case DatasourceType.LegacyMyWellDatasource:
        return new LegacyMyWellDatasource(datasource.url, datasource.selectedDatatypes);
        
      case DatasourceType.FileDatasource:
        const {fileUrl, dataType, fileFormat, options} = datasource;

        return new FileDatasource(fileUrl, dataType, fileFormat, FileDatasourceOptions.deserialize(options));

      default:
        throw new Error(`Tried to initialize Datasource of unknown type: ${datasource.type}`)
    }
  };

  app.post('/:orgId', validate(createSyncValidation), (req, res, next) => {
    const { orgId } = req.params;
    const { isOneTime, datasource, frequency} = req.body.data;

    const ds = initDatasourceWithOptions(datasource);
    const sync: Sync = new Sync(isOneTime, ds, orgId, [SyncMethod.validate], frequency);
    
    return sync.create({firestore})
    .then((createdSync: Sync) => {
      return res.json({data:{syncId: createdSync.id}});
    })
    .catch(err => {
      console.log(err);
      next(err);
      return;
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

  //TODO: this should probably be get, but httpsCallable seems to only want to do POST
  //refer to this: https://github.com/firebase/firebase-js-sdk/blob/d59b72493fc89ff89c8a17bf142f58517de4c566/packages/functions/src/api/service.ts
  app.post('/:orgId/run/:syncId', validate(runSyncValidation), (req, res, next) => {
    const {orgId, syncId} = req.params;
    const {method} = req.query;

    console.log("getting sync", orgId, syncId);
    return Sync.getSync({orgId, id: syncId, firestore})
    .then((sync: Sync) => {
      if (sync.isOneTime && moment(sync.lastSyncDate).unix() !== 0) {
        throw new Error(`Cannot run sync twice. Sync is marked as one time only`);
      }

      //TODO: put in proper email addresses
      const run: SyncRun = new SyncRun(orgId, syncId, method, ['lewis@vesselstech.com']);
      return run.create({firestore});
    })
    .then((run: SyncRun) => {
      //Resolve before we actually process the run
      res.json({data: {syncRunId: run.id}});

      return run.run({firestore})
        .catch(err => console.error(`Error running syncRun of id ${run.id}. Message: ${err.message}`));
    })
    .catch(err => {
      console.log('error in runSync:', err);
      next(err);
      return;
    });
   });


  /**
   * POST uploadFile
   * /:orgId/upload
   */
  app.post('/:orgId/upload', (req, res, next) => {
    const { orgId } = req.params;

    if (!req['files']) {
      return res.status(400).send('No files were uploaded.');
    }

    if (!req['files'].readingsFile) {
      return res.status(400).send('file with param readingsFile is required');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    const readingsFile = req['files'].readingsFile;

    //Save to local first:
    const localFilename = `/tmp/${moment().toISOString()}_${readingsFile.name}`;
    const destination = `${orgId}/sync/${readingsFile.name}`;
    return readingsFile.mv(localFilename)
    .then(() => {
      //Upload from file to bucket
      return bucket.upload(localFilename, {
        destination,
        public: true,
        metadata: {
          contentType: readingsFile.mimetype,
        },
      })
    })    
    .then(sn => res.json({ fileUrl: `http://storage.googleapis.com/${bucketName}/${destination}`}))
    .catch(err => {
      console.log('POST uploadFile err', err);
      next(err);
      
      return;
    });
  });

  return functions.runWith({
    timeoutSeconds: 540,
    memory: '256MB',
  })
    .https
    .onRequest(app);
};