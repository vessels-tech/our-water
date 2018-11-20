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
  app.use(validateFirebaseIdToken);


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

  app.get('/:orgId/qrCode', validate(), async (req, res, next) => {
    const { id } = req.query;
    const { orgId } = req.params;

    const result = await generateQRCode(orgId, id);
    if (result.type === ResultType.ERROR) {
      throw new Error(result.message);
    }

    res.json(result.result);
  });

  




  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
};
