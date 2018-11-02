import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import * as moment from 'moment';
//@ts-ignore
import * as morgan from 'morgan';
//@ts-ignore
import * as morganBody from 'morgan-body';
import ErrorHandler from '../common/ErrorHandler';
import FirebaseApi from '../common/apis/FirebaseApi';
import { ResultType } from '../common/types/AppProviderTypes';
// import FirebaseApi from '../common/apis/FirebaseApi';

require('express-async-errors');

const bodyParser = require('body-parser');
const Joi = require('joi');

module.exports = (functions: any) => {
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
 * createShortId
 * 
 * @description 
 * Creates a shortId for a resource. If the shortId already exists,
 * it returns the existing one.
 * 
 * 
 * POST /:orgId/shortId
 * body: { resourceId: string }
 */

  const createShortIdValidation = {
    body: {
      resourceId: Joi.string().required()
    }
  }

  //TODO: Secure this endpoint
  app.post('/:orgId', validate(createShortIdValidation), async (req, res) => {
    const { orgId } = req.params;
    const { resourceId } = req.body;

    const result = await FirebaseApi.createShortId(orgId, resourceId);
    if (result.type === ResultType.ERROR) {
      throw new Error(result.message);
    }

    res.json(result.result.serialize());
  });


  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);


  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
}