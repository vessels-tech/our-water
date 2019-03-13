import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import ErrorHandler from '../../common/ErrorHandler';
import { generateQRCode, getWholeQR } from '../../common/apis/QRCode';
import { writeFileAsync, enableLogging } from '../../common/utils';
import { ResultType, unsafeUnwrap } from 'ow_common/lib/utils/AppProviderTypes';
import { ReadingApi, ExportApi, ExportFormat } from 'ow_common/lib/api';
import * as moment from 'moment';
import { firestore } from '../../common/apis/FirebaseAdmin';
import FirebaseApi from '../../common/apis/FirebaseApi';

const bodyParser = require('body-parser');
const Joi = require('joi');
const fs = require('fs');
require('express-async-errors');

module.exports = (functions) => {
  const app = express();
  app.use(bodyParser.json());
  enableLogging(app);


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
    const fbApi = new FirebaseApi(firestore);

    const shortId = unsafeUnwrap(await fbApi.createShortId(orgId, id));
    const buffer = unsafeUnwrap(await getWholeQR(orgId, shortId.shortId, id));

    res.json(buffer.toString('base64'));
  });


  app.get('/:orgId/downloadQrCode', validate(generateQRCodeValidation), async (req, res) => {
    const { id } = req.query;
    const { orgId } = req.params;

    const fbApi = new FirebaseApi(firestore);

    const shortId = unsafeUnwrap(await fbApi.createShortId(orgId, id));
    const buffer = unsafeUnwrap(await getWholeQR(orgId, shortId.shortId, id));
    const file = `/tmp/qr_${id}.png`;
    fs.writeFileSync(file, buffer);

    res.download(file);
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
    const { orgId } = req.params;
    const readingApi = new ReadingApi(firestore, orgId);

    resourceIds = resourceIds.split(',');
    if (resourceIds.length > 50) {
      throw new Error("Too many resourceIds. Max is 50");
    }

    const readings = unsafeUnwrap(await readingApi.getReadingsForResources(resourceIds, { limit: 100 }));
    if (readings.readings.length === 0) {
      const error = new Error(`No readings found for ids: ${resourceIds}`);
      return res.status(404).send(error);
    }
    const readingsData = ExportApi.readingsToExport(readings.readings, ExportFormat.CSV);

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
