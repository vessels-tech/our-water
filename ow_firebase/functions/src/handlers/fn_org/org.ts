import * as validate from 'express-validation';
import * as express from 'express';
import { firestore } from '../../common/apis/FirebaseAdmin';
import { enableLogging } from '../../common/utils';

const bodyParser = require('body-parser');
const Joi = require('joi');



module.exports = (functions) => {
  const app = express();
  app.use(bodyParser.json());
  enableLogging(app);

  app.get('/', (req, res) => {
    console.log("TODO")
    res.json(['test_12345', 'mywell', 'igrac']);
  });

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

    return firestore.collection('org').add(req.body)
    .then(result => {
      return res.json({orgId: result.id});
    });
  });

  return functions.https.onRequest(app);
}