import Config from 'react-native-config';
import { TranslationOrg } from 'ow_translations';


function getBoolean(value: any) {
  switch (value) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return true;
    default:
      return false;
  }
}

/**
 * Get the orgId from the environment variable
 * 
 * This is a little crappy, as it returns a TranslationOrg,
 * but simplifies things for now
 */
function getOrgId(value: any): TranslationOrg {
  if (value === 'ggmn') {
    return TranslationOrg.ggmn;
  }
  
  if (value === 'mywell' || value === 'test_20180810T105542') {
    return TranslationOrg.mywell;
  }

  throw new Error(`Couldn't find org from environment variable: ${value}`);
}


export const EnableLogging = getBoolean(Config.ENABLE_LOGGING);
export const EnableRenderLogging = getBoolean(Config.ENABLE_RENDER_LOGGING);
export const EnableReduxLogging = getBoolean(Config.ENABLE_REDUX_LOGGING)
export const OrgId: TranslationOrg = getOrgId(Config.REACT_APP_ORG_ID)
export const RemoteConfigDeveloperMode = getBoolean(Config.REMOTE_CONFIG_DEVELOPER_MODE)
export const EnableCaching = getBoolean(Config.ENABLE_CACHE)
