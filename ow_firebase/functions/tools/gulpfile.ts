import * as gulp from 'gulp';
import { arg, getAdminAccessToken, getRemoteConfig, getNewConfig, saveNewConfig } from '.';
import { admin, firestore } from '../src/test/TestFirebase';
const request = require('request-promise-native');
import { TranslationOrg, translationsForTranslationOrg, possibleTranslationsForOrg, functionReplacer, translationFromJSON} from 'ow_translations';
import FirebaseApi, { BoundingBox, PageParams } from '../src/common/apis/FirebaseApi';
import { Reading } from '../src/common/models/Reading';
import { readingToCSV, readingHeading } from './csv';
import { ResultType } from 'ow_common/lib/utils/AppProviderTypes';
import Migrator, { MigrationTag } from './Migrator';


const moment = require('moment');

const fs = require('fs');
const fbApi = new FirebaseApi(firestore);
const serviceAccountKeyFile = `../src/test/${process.env.service_account_key_filename}`;
const key = require(serviceAccountKeyFile);
const baseUrl = process.env.REACT_APP_BASE_URL;
const orgId = process.env.REACT_APP_ORG_ID;
const PROJECT_ID = process.env.PROJECT_ID;


gulp.task('test_create_reading', async () => {

  const result = await firestore.collection("org").doc("mywell").collection("reading").doc("12345").create({
    resourceId: "45678"
  });

  console.log("result");

});

gulp.task('run_migrations', async () => {
  const tag: MigrationTag = arg.migrationTag;
  if (!tag) {
    throw new Error(`No Migration tag found. usage: gulp run_migrations --migrationTag <tag>`);
  }

  const params = {
    maxQueryCount: 100,
    limit: 100, //100 * 100 = 10,000 possible resources at most
    batchSize: 250,
  };
  await Migrator.runMigrationForTag(tag, firestore, orgId, params);
});


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
  const accessToken = await getAdminAccessToken(key)
  const [etag, _] = await getRemoteConfig(PROJECT_ID, accessToken);

  const newConfig = await getNewConfig();
  console.log('New config is', JSON.stringify(newConfig, null, 2));

  const result = await saveNewConfig(accessToken, etag, PROJECT_ID, newConfig);

  console.log("Result is", result);
});

gulp.task('get_remote_config', async () => {
  const accessToken = await getAdminAccessToken(key)
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


gulp.task('upload_readings_from_csv', async () => {
  const files = [
    //Place your links to firebase files here.
    // eg: 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/test_1.csv?alt=media&token=66630fd9-09d6-40b3-9d0b-07151f8e8f93'
      // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/test_2.csv?alt=media&token=4d347909-8daf-41c6-8a2e-5340d3bac896',
      
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20V-Well.csv?alt=media&token=f07c5115-5341-4c56-bf62-7bfc798b9eaa',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20V%20Rainfall.csv?alt=media&token=c9138579-ca8a-4920-8aff-84cd67cf3a4a',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20S-Checkdam.csv?alt=media&token=42376502-bf5a-47d7-8466-f3e730e0897a',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20S-Well.csv?alt=media&token=73ac0dad-4694-4f8a-8a5b-8d5243311a9c',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20S-Rainfall.csv?alt=media&token=13316d4f-90f6-4afe-a2ea-7da4c55294fa',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20H-Well.csv?alt=media&token=ad8b5c85-1e8e-4af5-9177-7ab5b5c2d913',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20H-Rainfall.csv?alt=media&token=e6b63576-3df0-4b3a-827e-624480f92495',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20H-checkdam.csv?alt=media&token=00b45ffd-113b-4631-8ac5-0742bd767e22',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20D-Well.csv?alt=media&token=f7738a43-b735-4616-8de9-1468225e53fe',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20D-Rainfall.csv?alt=media&token=1580ad26-3edd-448c-8985-bb0355f6280c',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20D-Checkdam.csv?alt=media&token=d7f24e83-319d-4a41-a947-0f0c5dbb02fe',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20B-Well.csv?alt=media&token=1342615f-67dd-41d0-8cca-4b3ff8a75a77',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20B-Rainfall.csv?alt=media&token=75ece5f8-448e-4bb8-bc7f-8bcbe7198195',
    // 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2018-19.xlsx%20-%20B-Checkdam.csv?alt=media&token=323434e3-970a-4404-a9b3-8f6c84cccc93',
  ];

  //Build the sync requests
  const syncOptions: any[] = files.map(fileUrl => {
    const data = {
      isOneTime: false,
      frequency: 'weekly',
        datasource: {
          type: "FileDatasource",
        fileUrl,
        dataType: 'Reading',
        fileFormat: 'TSV', //ignored for now
        options: {
          includesHeadings: true,
          usesLegacyMyWellIds: true,
        },
        selectedDatatypes: [
          'Reading',
        ]
      },
      type: "unknown",
    };

    const createSyncOptions = {
      method: 'POST',
      uri: `${baseUrl}/sync/${orgId}`,
      json: true,
      body: {
        data
      }
    };

    return createSyncOptions;
  });

  const syncIds = await Promise.all(syncOptions.map(options => request(options)
    .then((response: any) => response.data.syncId)
    .catch(err => console.log(err))
  ));

  const syncRunOptions: any[] = syncIds.map(syncId => ({
    method: 'POST',
    uri: `${baseUrl}/sync/${orgId}/run/${syncId}?method=pullFrom`
  }));

  console.log("Create syncs responses are: ", syncIds);

  //Now run the syncs
  const syncRuns = await Promise.all(syncRunOptions.map(options => request(options)
    .then((response: any) => response)
    .catch(err => console.log(err))
  ));

  console.log("syncRuns", syncRuns);

});

export type LegacyCSVReading = {
  date: string, //date in yyyy/mm/dd
  time: string, //00:00 format
  timeseries: 'default',
  value: number,
  shortId: "",
  id: '',
  legacyPincode: number,
  legacyResourceId: number,
}

export type RawReading = {
  date: string,
  value: number,
  postcode: number
  resourceId: number,
}


const getLegacyReadings = async (postcode: number, resourceId: number): Promise<Array<LegacyCSVReading>> => {
  const legacyAccessToken = "5yXZbG75dfAqCc4BF92gnYEak3AwXTzvxGkSoOyCAfVvIrsphsKFulkG2CzKzLdz";

  const options = {
    method: 'GET',
    uri: `https://mywell-server.vessels.tech/api/readings?filter=%7B%22where%22%3A%7B%22and%22%3A%5B%7B%22postcode%22%3A%22${postcode}%22%7D%2C%7B%22resourceId%22%3A%22${resourceId}%22%7D%5D%7D%7D&access_token=${legacyAccessToken}`,
    json: true
  };

  return request(options)
  .then((rawReadings: Array<RawReading>) => {
    const readings: LegacyCSVReading[] = [];
    rawReadings.forEach(r => {
      const readingMoment = moment.utc(r.date);

      const newReading: LegacyCSVReading = {
        date: readingMoment.format("YYYY/MM/DD"), //date in yyyy/mm/dd
        time: readingMoment.format("mm:HH"), //00:00 format
        timeseries: 'default',
        value: r.value,
        shortId: "",
        id: '',
        legacyPincode: postcode,
        legacyResourceId: resourceId,
      };
      readings.push(newReading);
    });

    return readings;
  });
}

const formatReadingCSV = (reading: LegacyCSVReading): string => {
  return `${reading.date}\t${reading.time}\t${reading.timeseries}\t${reading.value}\t${reading.shortId}\t${reading.id}\t${reading.legacyPincode}\t${reading.legacyResourceId}`;
}

/**
 * Download legacy readings in csv format
 */
gulp.task('download_legacy_readings', async () => {

  const resources: Array<{postcode: number, resourceId: number}> = [
    {postcode:12345, resourceId:1110},
    {postcode:12345, resourceId:1111},
    {postcode:12345, resourceId:1112},
    {postcode:12345, resourceId:1113},
    {postcode:12346, resourceId:1110},
    {postcode:1120, resourceId:1110},
    {postcode:1121, resourceId:1110},
    {postcode:1123, resourceId:1110},
    {postcode:1124, resourceId:1110},
    {postcode:1125, resourceId:1110},
    {postcode:1126, resourceId:1110},
    {postcode:1127, resourceId:1110},
    {postcode:1128, resourceId:1110},
    {postcode:1129, resourceId:1110},
    {postcode:1130, resourceId:1110},
    {postcode:1131, resourceId:1110},
    {postcode:1132, resourceId:1110},
    {postcode:1133, resourceId:1110},
  ];

  let readings: Array<LegacyCSVReading> = [];
  await resources.reduce(async (acc, curr) => {
    return acc
    .then(() => getLegacyReadings(curr.postcode, curr.resourceId))
    .then(newReadings => {
      console.log(`Fetched ${newReadings.length} new readings.`);
      readings = readings.concat(newReadings);
      return Promise.resolve([]);
    })
    .catch(err => {
      console.log(err);
      return Promise.reject(err);
    })
  }, Promise.resolve([]));

  console.log(`Fetched a total of ${readings.length} readings`);

  //TODO: Save into csv files
  readings.forEach(r => {
    console.log(formatReadingCSV(r));
  });
  

});