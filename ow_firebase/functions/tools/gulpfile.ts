import * as gulp from 'gulp';
import { getAdminAccessToken, getRemoteConfig, getNewConfig, saveNewConfig } from '.';
import { admin } from '../src/test/TestFirebase';
const request = require('request-promise-native');

const PROJECT_ID = 'our-water';


gulp.task('deploy_remote_config', async() => {
  const accessToken = await getAdminAccessToken()
  const [etag, currentConfig] = await getRemoteConfig(PROJECT_ID, accessToken);

  // console.log("etag:", etag);
  // console.log("currentConfig:", currentConfig);
  const newConfig = await getNewConfig();
  console.log('New config is', JSON.stringify(newConfig, null, 2));

  const result = await saveNewConfig(accessToken, etag, PROJECT_ID, newConfig);

  // console.log("Result is", result);


});