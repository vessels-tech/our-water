import * as gulp from 'gulp';
import { getAdminAccessToken, getRemoteConfig, getNewConfig, saveNewConfig } from '.';
import { admin, firestore } from '../src/test/TestFirebase';
const request = require('request-promise-native');
import { TranslationOrg, translationsForTranslationOrg, possibleTranslationsForOrg, functionReplacer, translationFromJSON} from 'ow_translations';
import FirebaseApi, { BoundingBox, PageParams } from '../src/common/apis/FirebaseApi';
import { ResultType } from '../src/common/types/AppProviderTypes';
import { Reading } from '../src/common/models/Reading';
import { readingToCSV, readingHeading } from './csv';

var fs = require('fs');
const fbApi = new FirebaseApi(firestore);

const PROJECT_ID = 'our-water';


gulp.task('test_translation_parsing', async () => {

  const mywellTranslationOptionsJSON = JSON.stringify(possibleTranslationsForOrg(TranslationOrg.mywell), null, 2);
  const mywellTranslationsJSON = JSON.stringify(translationsForTranslationOrg(TranslationOrg.mywell), functionReplacer, 2);
  const ggmnTranslationsOptionsJSON = JSON.stringify(possibleTranslationsForOrg(TranslationOrg.ggmn), null, 2);
  const ggmnTranslationsJSON = JSON.stringify(translationsForTranslationOrg(TranslationOrg.ggmn), functionReplacer, 2);
  
  const mywellTranslation = translationFromJSON(mywellTranslationsJSON);
  const ggmnTranslation = translationFromJSON(ggmnTranslationsJSON);
  
  console.log(mywellTranslation.en_AU.templates.settings_connect_to_pending_title);
  console.log(ggmnTranslation.en_AU.templates.settings_connect_to_pending_title);
});

gulp.task('deploy_remote_config', async () => {
  const accessToken = await getAdminAccessToken()
  const [etag, _] = await getRemoteConfig(PROJECT_ID, accessToken);

  const newConfig = await getNewConfig();
  console.log('New config is', JSON.stringify(newConfig, null, 2));

  const result = await saveNewConfig(accessToken, etag, PROJECT_ID, newConfig);

  console.log("Result is", result);
});

gulp.task('get_remote_config', async () => {
  const accessToken = await getAdminAccessToken()
  const [etag, currentConfig] = await getRemoteConfig(PROJECT_ID, accessToken);

  console.log("etag:", etag);
  console.log("currentConfig:", currentConfig);
});

gulp.task('get_readings_csv', async() => {
  const MAX_PAGES = 100;
  const PAGE_SIZE = 1000;

  //Bottom Left: 24.6605056,74.176801
  //Top Right: 24.4809209,74.2979843
  const bbox: BoundingBox = {
    minLat: 24.4809209,
    maxLat: 24.6605056,
    minLng: 74.176801,
    maxLng: 74.2979843,
  };
  const filename = '/tmp/readings.csv';

  const writer = fs.createWriteStream(filename, {});
  writer.write(readingHeading());

  let pageParams: PageParams = { limit: PAGE_SIZE };
  const readingsResult = await fbApi.readingsWithinBoundingBoxPaginated('mywell', bbox, pageParams);
  if (readingsResult.type === ResultType.ERROR) {
    throw new Error(readingsResult.message);
  }

  readingsResult.result.result.forEach((r: Reading) => writer.write(readingToCSV(r)));

  //Keep getting readings in a paginated fashion
  if (!readingsResult.result.hasNext) {
    console.log("found all readings in first page");
    return;
  }

  let hasNext = true;
  let pageCount = 1
  let totalReadingsCount = readingsResult.result.result.length;
  let startAfter = readingsResult.result.startAfter;
  //Is there a better way than a while loop?
  while (hasNext === true) {
    pageParams = Object.assign(pageParams, { startAfter });
    const next = await fbApi.readingsWithinBoundingBoxPaginated('mywell', bbox, pageParams);

    if (next.type === ResultType.ERROR) {
      console.error("Error loading query with page query", pageParams);
      hasNext = false;
      return;
    }

    totalReadingsCount += next.result.result.length;
    next.result.result.forEach((r: Reading) => writer.write(readingToCSV(r)));

    console.log(`Page: ${pageCount} all readings now has: ${totalReadingsCount} readings.`);
    hasNext = next.result.hasNext;
    startAfter = next.result.startAfter;
    pageCount += 1;

    //Safety Statement
    if (pageCount >= MAX_PAGES) {
      hasNext = false;
      break;
    }
  }
  console.log(`END. Found a total of ${totalReadingsCount} readings in ${pageCount} pages`);
  
  writer.end();
  console.log("wrote file: ", filename);
});