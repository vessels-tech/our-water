import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import ErrorHandler from '../../common/ErrorHandler';

import { validateFirebaseIdToken, validateUserIsAdmin } from '../../middleware';
import { enableLogging, writeFileAsync } from '../../common/utils';
import FirebaseApi from '../../common/apis/FirebaseApi';
import { firestore } from '../../common/apis/FirebaseAdmin';
import { ResultType, unsafeUnwrap } from 'ow_common/lib/utils/AppProviderTypes';
import { UserApi, ReadingApi, ExportApi, ExportFormat } from 'ow_common/lib/api';
import UserType from 'ow_common/lib/enums/UserType';
import UserStatus from 'ow_common/lib/enums/UserStatus';
import * as moment from 'moment';


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
    },
  }

  app.patch('/:orgId/:userId/status', validate(changeUserStatusValidation), async (req, res) => {
    const { orgId, userId } = req.params;
    const { status } = req.body;
    const fbApi = new FirebaseApi(firestore);
    const userApi = new UserApi(firestore, orgId);


    //TODO: how to make sure only Admin can call this endpoint? 
    //Can we add that as a rule to the Firestore rules?

    const statusResult = await userApi.changeUserStatus(userId, status);
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
   * Download Readings for Resources
   * GET /:orgId/downloadReadings
   * 
   * eg: /test_12348/downloadReadings?resourceIds=00001%2C00002%2C00003
   * 
   * Download a list of readings for a given resource. 
   * resourceIds must be a comma separated list of resourceIds
   */
  const getReadingsValidation = {
    options: {
      allowUnknownBody: false,
    },
    query: {
      resourceIds: Joi.string().required(),
    }
  }
  app.get('/:orgId/downloadReadings', validate(getReadingsValidation), async (req, res) => {
    
    let { resourceIds } = req.query;
    console.log("Getting readings:", resourceIds);
    const { orgId } = req.params;
    const readingApi = new ReadingApi (firestore, orgId);

    resourceIds = resourceIds.split(',');
    if (resourceIds.length > 50) {
      throw new Error("Too many resourceIds. Max is 50");
    }

    const readings = unsafeUnwrap(await readingApi.getReadingsForResources(resourceIds, {limit: 100}));
    if (readings.readings.length === 0) {
      const error = new Error(`No readings found for ids: ${resourceIds}`);
      return res.status(404).send(error);
    }
    const readingsData = ExportApi.readingsToExport(readings.readings, ExportFormat.CSV);
    console.log("readings data is", readingsData);

    const file = `/tmp/${moment().toString()}.csv`;
    await writeFileAsync(file, readingsData, 'utf-8');
    
    res.download(file);
  });

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
};
