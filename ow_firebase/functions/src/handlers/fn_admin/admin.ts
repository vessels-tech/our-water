import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import ErrorHandler from '../../common/ErrorHandler';


//@ts-ignore
import * as morgan from 'morgan';
//@ts-ignore
import * as morganBody from 'morgan-body';
import { validateFirebaseIdToken } from '../../middleware';
import { generateQRCode } from '../../common/apis/QRCode';
import { ResultType } from '../../common/types/AppProviderTypes';
import { writeFileAsync } from '../../common/utils';
import FirebaseApi from '../../common/apis/FirebaseApi';
import { firestore } from '../../common/apis/FirebaseAdmin';

const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin')
require('express-async-errors');

module.exports = (functions) => {
  const app = express();
  app.use(bodyParser.json());

  if (process.env.VERBOSE_LOG === 'false') {
    console.log('Using simple log');
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  } else {
    console.log('Using verbose log');
    morganBody(app);
  }

  //TODO: figure out how to implement basic ACLS
  //we don't want to validate these endpoints for now.
  // app.use(validateFirebaseIdToken);


  /**
   * GenerateQRCode
   * 
   * Generate a QR code for a given id.
   * 
   */

  const generateQRCodeValidation = {
    options: {
      allowUnknownBody: false,
    },
    query: {
      id: Joi.string().required(),
    }
  }

  app.get('/:orgId/qrCode', validate(generateQRCodeValidation), async (req, res) => {
    const { id } = req.query;
    const { orgId } = req.params;

    const result = await generateQRCode(orgId, id);
    if (result.type === ResultType.ERROR) {
      throw new Error(result.message);
    }

    res.json(result.result);
  });

  
  app.get('/:orgId/downloadQrCode', validate(generateQRCodeValidation), async (req, res) => {
    const { id } = req.query;
    const { orgId } = req.params;

    const qrResult = await generateQRCode(orgId, id);
    if (qrResult.type === ResultType.ERROR) {
      throw new Error(qrResult.message);
    }

    const base64Data = qrResult.result.replace(/^data:image\/png;base64,/, "");
    const file = `/tmp/qr_${id}.png`;
    await writeFileAsync(file, base64Data, 'base64');

    res.download(file);
  });

  /**
   * ChangeUserStatus
   * PATCH /:orgId/:userId/status
   * 
   * Change the user's status to either Approved or Rejected.
   * If ther user's new status is 'Approved', and has pending resources or readings, they will be saved and deleted
   */
  const changeUserStatusValidation = {
    options: {
      allowUnknownBody: false,
    },
    body: {
      status: Joi.string().valid('Approved', 'Rejected'),
    },
  }

  app.patch('/:orgId/:userId/status', validate(changeUserStatusValidation), async (req, res) => {
    const { orgId, userId } = req.params;
    const { status } = req.body;
    const fbApi = new FirebaseApi(firestore);

    const statusResult = await fbApi.changeUserStatus(orgId, userId, status);
    if (statusResult.type === ResultType.ERROR) {
      throw new Error(statusResult.message);
    }

    if (status === "Approved") {
      const syncResult = await fbApi.syncPendingForUser(orgId, userId);
      if (syncResult.type === ResultType.ERROR) {
        throw new Error(syncResult.message);
      }
    }

    res.status(204).send("true");
  });

  /**
   * SyncUserData
   * POST /:orgId/:userId/sync
   * 
   * Syncronises the user's pendingResources and pendingReadings, and cleans them up
   * The user MUST be approved before calling this method. 
   *
   */
  //TODO: secure this endpoint
  app.post('/:orgId/:userId/sync', async (req, res) => {
    const { orgId, userId } = req.params;
    const fbApi = new FirebaseApi(firestore);

    //TODO: check that the user is approved, throw a 400 if not
    // const user = fbApi.getUser(orgId, userId);

    const syncResult = await fbApi.syncPendingForUser(orgId, userId);
    if (syncResult.type === ResultType.ERROR) {
      throw new Error(syncResult.message);
    }

    res.status(204).send("true");
  });

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
};
