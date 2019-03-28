import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import ErrorHandler from '../../common/ErrorHandler';

import { validateFirebaseIdToken, validateUserIsAdmin } from '../../middleware';
import { enableLogging } from '../../common/utils';
import FirebaseApi from '../../common/apis/FirebaseApi';
import { firestore } from '../../common/apis/FirebaseAdmin';
import { ResultType, unsafeUnwrap } from 'ow_common/lib/utils/AppProviderTypes';
import { UserApi, ReadingApi } from 'ow_common/lib/api';
import UserType from 'ow_common/lib/enums/UserType';
import UserStatus from 'ow_common/lib/enums/UserStatus';


const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin')
require('express-async-errors');

module.exports = (functions) => {
  const app = express();
  app.use(bodyParser.json());
  enableLogging(app);
  app.use(validateFirebaseIdToken);
  app.use(validateUserIsAdmin);


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
      status: Joi.string().valid(UserStatus.Approved, UserStatus.Rejected),
      shouldSync: Joi.boolean(),
    },
  }

  app.patch('/:orgId/:userId/status', validate(changeUserStatusValidation), async (req, res) => {
    const { orgId, userId } = req.params;
    const { status } = req.body;
    const shouldSync = req.body.shouldSync || false;
    const fbApi = new FirebaseApi(firestore);
    const userApi = new UserApi(firestore, orgId);


    //TODO: how to make sure only Admin can call this endpoint? 
    //Can we add that as a rule to the Firestore rules?

    const statusResult = await userApi.changeUserStatus(userId, status);
    if (statusResult.type === ResultType.ERROR) {
      throw new Error(statusResult.message);
    }

    if (status === "Approved" && shouldSync) {
      const syncResult = await fbApi.syncPendingForUser(orgId, userId);
      if (syncResult.type === ResultType.ERROR) {
        throw new Error(syncResult.message);
      }
    }

    res.status(204).send("true");
  });

  //       status: Joi.string().valid(UserStatus.Approved, UserStatus.Rejected),

  /**
   * ChangeUserType
   * PATCH /:orgId/:userId/type
   * 
   * Change the user's type to either User or Admin
   */
  const changeUserTypeValidation = {
    options: {
      allowUnknownBody: false,
    },
    body: {
      type: Joi.string().valid(Object.keys(UserType)),
    },
  }

  app.patch('/:orgId/:userId/type', validate(changeUserTypeValidation), async (req, res) => {
    const { orgId, userId } = req.params;
    const { type } = req.body;

    //TODO: how to make sure only Admin can call this endpoint? 
    //Can we add that as a rule to the Firestore rules?
    const userApi = new UserApi(firestore, orgId);
    const statusResult = await userApi.changeUserType(userId, type);
    if (statusResult.type === ResultType.ERROR) {
      throw new Error(statusResult.message);
    }

    res.status(204).send("true");
  });


  /**
   * Bulk upload readings
   */
  const bulkUploadReadingsValidation = {
    options: { allowUnknownBody: false },
    query: { validateOnly: Joi.boolean().default(false) },
    body: {
      readings: Joi.array().min(1).required(),
    }
  }

  app.post('/:orgId/:userId/bulk_upload_readings', validate(bulkUploadReadingsValidation), async (req, res) => {
    const { orgId, userId } = req.params;
    const { readings } = req.body;
    const { validateOnly } = req.query;

    const fbApi = new FirebaseApi(firestore);
    const readingApi = new ReadingApi(firestore, orgId);

    //Strip off the first row
    readings.shift();

    //Perform a reading validation, if validateOnly, then just return this result
    const validateResult = unsafeUnwrap(await fbApi.validateBulkUploadReadings(orgId, userId, readings));
    if (validateOnly) {
      return res.json(validateResult);
    }

    //Bulk upload the validated readings
    const bulkUploadResult = unsafeUnwrap(await readingApi.bulkUploadReadings(validateResult.validated, 250));
    return res.json(bulkUploadResult);
  });

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions .runWith({
      timeoutSeconds: 150,
      memory: '256MB',
    })
    .https
    .onRequest(app);
};
