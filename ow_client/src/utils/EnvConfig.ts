import Config from 'react-native-config';
import { TranslationOrg } from 'ow_translations/Types';


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

function getOrgId(value: any): TranslationOrg {
  if (value === 'ggmn') {
    return TranslationOrg.ggmn;
  }
  
  if (value === 'mywell') {
    return TranslationOrg.mywell;
  }

  throw new Error(`Couldn't find org from environment variable: ${value}`);
}


export const EnableLogging = getBoolean(Config.ENABLE_LOGGING);
export const OrgId: TranslationOrg = getOrgId(Config.REACT_APP_ORG_ID)
