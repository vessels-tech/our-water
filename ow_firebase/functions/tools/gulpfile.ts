import * as gulp from 'gulp';
import { getAdminAccessToken, getRemoteConfig, getNewConfig, saveNewConfig } from '.';
import { admin } from '../src/test/TestFirebase';
const request = require('request-promise-native');
import { TranslationOrg, translationsForTranslationOrg, possibleTranslationsForOrg } from 'ow_translations';

const PROJECT_ID = 'our-water';


gulp.task('test_translation_parsing', async () => {

  const mywellTranslationOptions = possibleTranslationsForOrg(TranslationOrg.mywell);
  const mywellTranslations = translationsForTranslationOrg(TranslationOrg.mywell);
  const ggmnTranslationsOptions = possibleTranslationsForOrg(TranslationOrg.mywell);
  const ggmnTranslations = translationsForTranslationOrg(TranslationOrg.ggmn);

  const mywellTranslationOptionsJSON = JSON.stringify(mywellTranslationOptions, null, 2);
  const mywellTranslationsJSON = JSON.stringify(mywellTranslations, functionReplacer, 2);
  const ggmnTranslationsOptionsJSON = JSON.stringify(ggmnTranslationsOptions, null, 2);
  const ggmnTranslationsJSON = JSON.stringify(ggmnTranslations, functionReplacer, 2);

  const mywellTranslation = translationFromJSON(mywellTranslationsJSON);
  const ggmnTranslation = translationFromJSON(ggmnTranslationsJSON);
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