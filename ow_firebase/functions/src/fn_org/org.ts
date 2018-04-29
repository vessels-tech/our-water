import * as validate from 'express-validation';
import * as express from 'express';

const bodyParser = require('body-parser');
const Joi = require('joi');

module.exports = (functions, admin) => {
  const app = express();
  app.use(bodyParser.json());
  const fs = admin.firestore();


  // const defaultErrorHandler = require('../common/defaultErrorHandler');

  //TODO: fix this error handler
  // app.use(defaultErrorHandler);

  app.get('/', (req, res) => res.send("TODO"));


  const createOrgValidation = {
    options: {
      allowUnknownBody: false,
    },
    body: {
      name: Joi.string().required(),
      url: Joi.string().hostname(),
    }
  };

  app.post('/', validate(createOrgValidation), (req, res) => {

    return fs.collection('org').add(req.body)
    .then(result => {
      return res.json({orgId: result.id});
    });
  });

  return functions.https.onRequest(app);
}