import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import ErrorHandler from '../../common/ErrorHandler';


//@ts-ignore
import * as morgan from 'morgan';
//@ts-ignore
import * as morganBody from 'morgan-body';
import { generateQRCode } from '../../common/apis/QRCode';
import { writeFileAsync } from '../../common/utils';
import { ResultType } from 'ow_common/lib/utils/AppProviderTypes';

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

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
};
