import * as gulp from 'gulp';
import { getAdminAccessToken, getRemoteConfig, getNewConfig, saveNewConfig } from '.';
import { admin } from '../src/test/TestFirebase';
const request = require('request-promise-native');
import { TranslationOrg, translationsForTranslationOrg, possibleTranslationsForOrg, functionReplacer, translationFromJSON} from 'ow_translations';

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