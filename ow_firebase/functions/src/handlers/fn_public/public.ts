import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import ErrorHandler from '../../common/ErrorHandler';
import { getWholeQR } from '../../common/apis/QRCode';
import { writeFileAsync, enableLogging, zipFolderAsync, getPublicDownloadUrl } from '../../common/utils';
import { unsafeUnwrap } from 'ow_common/lib/utils/AppProviderTypes';
import { ReadingApi, ExportApi, ExportFormat } from 'ow_common/lib/api';
import * as moment from 'moment';
import { firestore, storage as fbStorage } from '../../common/apis/FirebaseAdmin';
import FirebaseApi from '../../common/apis/FirebaseApi';
import { storageBucket, firebaseToken } from '../../common/env';


const bodyParser = require('body-parser');
const Joi = require('joi');
const fs = require('fs');
// const fileUpload = require('express-fileupload');
const fileMiddleware = require('express-multipart-file-parser')

// const multer = require('multer')
// const upload = multer({ dest: 'tmp/' })
// const storage = multer.diskStorage({
//   destination: '/tmp/uploads',
//   // filename: function (req, file, cb) {
//   //   cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   // }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 100000000
//   }
// });

require('express-async-errors');

module.exports = (functions) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(fileMiddleware)
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

    const shortId = unsafeUnwrap(await fbApi.createShortId(orgId, <any>id));
    const buffer = unsafeUnwrap(await getWholeQR(orgId, shortId.shortId, <any>id));

    res.json(buffer.toString('base64'));
  });


  app.get('/:orgId/downloadQrCode', validate(generateQRCodeValidation), async (req, res) => {
    const { id } = req.query;
    const { orgId } = req.params;

    const fbApi = new FirebaseApi(firestore);

    const shortId = unsafeUnwrap(await fbApi.createShortId(orgId, <any>id));
    const buffer = unsafeUnwrap(await getWholeQR(orgId, (<any>shortId).shortId, <any>id));
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

    resourceIds = (<any>resourceIds).split(',');
    if (resourceIds.length > 50) {
      throw new Error("Too many resourceIds. Max is 50");
    }

    const readings = unsafeUnwrap(await readingApi.getReadingsForResources(<any>resourceIds, { limit: 100 }));
    if (readings.readings.length === 0) {
      const error = new Error(`No readings found for ids: ${resourceIds}`);
      return res.status(404).send(error);
    }
    const readingsData = ExportApi.readingsToExport(readings.readings, ExportFormat.CSV);

    const file = `/tmp/${moment().toISOString()}.csv`;
    await writeFileAsync(file, readingsData, 'utf-8');

    res.download(file);
  });


  /**
   * Download Readings images for a single resource
   * GET /:orgId/downloadReadingImages
   *
   * eg: /test_12348/downloadReadings?resourceIds=00001
   *
   * Download a list of readings for a given resource.
   * resourceIds must be a comma separated list of resourceIds
   */
  const getReadingImagesValidation = {
    options: {
      allowUnknownBody: false,
    },
    query: {
      resourceId: Joi.string().required(),
    }
  }

  app.get('/:orgId/downloadReadingImages', validate(getReadingImagesValidation), async (req, res) => {
    let { resourceId } = req.query;
    const { orgId } = req.params;
    const readingApi = new ReadingApi(firestore, orgId);

    resourceId = (<any>resourceId).split(',');
    if (resourceId.length > 1) {
      const error = new Error("Can only download reading images for one resource at a time");
      return res.status(400).send(error);
    }

    const momentUnix = moment().unix();
    const dirName = `/tmp/${resourceId[0]}_${momentUnix}`;
    const archiveName = `/tmp/${resourceId[0]}_${momentUnix}.zip`;

    console.log("resourceId is", resourceId);


    const readings = unsafeUnwrap(await readingApi.getReadingsForResources(<any>resourceId, { limit: 200 }));
    if (readings.readings.length === 0) {
      const error = new Error(`No readings found for ids: ${resourceId}`);
      return res.status(404).send(error);
    }

    //Get a zip file containing all images
    const readingImagesBase64: Array<{id: string, base64: string}> = ExportApi.exportReadingImages(readings.readings);
    if (readingImagesBase64.length === 0) {
      const error = new Error(`No images found for readings for resourceId: ${resourceId}`);
      return res.status(404).send(error);
    }

    //Create the dir
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName);
    }

    //Write each image to a file
    await readingImagesBase64.reduce(async (acc, curr) => {
      await acc;

      const file = `${dirName}/${curr.id}.png`;
      //TODO: figure out how to save a png

      return writeFileAsync(file, curr.base64, 'base64');

    }, Promise.resolve({}));

    //Archive the folder
    await zipFolderAsync(dirName, archiveName);

    res.download(archiveName);
  });


  /**
   * getReadingImage
   *
   * View a reading image for a given readingId. Returns a simple webpage
   *
   */
  app.get('/:orgId/image/:readingId', async (req, res) => {
    const { orgId, readingId } = req.params;
    const readingApi = new ReadingApi(firestore, orgId);

    const readingImage = unsafeUnwrap(await readingApi.getReadingImage(readingId));

    res.send(`<img width="300" src="data:image/png;base64, ${readingImage}"/>`);
  });

  /**
 * Upload profile image, and save to firebase
 *
 * image should be called `image`
 */
  app.post('/:orgId/uploadImage', async function (req, res) {
    //@ts-ignore
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    //@ts-ignore
    if (Object.keys(req.files).length > 1) {
      return res.status(400).send('Can only upload 1 file at a time');
    }

    // @ts-ignore
    const fileBuffer = req.files[0].buffer;

    const filename = `${moment().valueOf()}`;
    const localFile = `/tmp/${filename}`;
    const filePath = `resource_profiles/${filename}.png`;
    await fs.writeFileSync(localFile, fileBuffer);
    const bucket = fbStorage.bucket();

    await bucket.upload(localFile, {
      gzip: true,
      destination: filePath,
      public: true,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: firebaseToken
        }
      }
    });

    const publicDownloadUrl = getPublicDownloadUrl(filePath);
    res.send({ url: publicDownloadUrl });
  });



  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
};
