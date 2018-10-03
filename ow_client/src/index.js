
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import { textDark } from './utils/Colors';
import { defaultNavigatorStyle } from './utils';
import { ConfigFactory, EnvConfig } from './config/ConfigFactory';
import { FirebaseConfig } from './config/FirebaseConfig';
import Config from 'react-native-config';
import GGMNDevConfig from './config/GGMNDevConfig';
import MyWellDevConfig from './config/MyWellDevConfig';
import NetworkApi from './api/NetworkApi';
import { TranslationFile, TranslationEnum } from 'ow_translations/Types';
import { translationsForTranslationOrg } from 'ow_translations';
import * as EnvironmentConfig from './utils/EnvConfig';

let config: ConfigFactory;
let translation: TranslationFile;
const orgId = EnvironmentConfig.OrgId;

Promise.resolve(true)
.then(() => {
  if (Config.SHOULD_USE_LOCAL_CONFIG === 'true') {
    switch (Config.CONFIG_TYPE) {
      case 'GGMNDevConfig':
        return GGMNDevConfig;
      default:
        return MyWellDevConfig;
    }
  }
  return FirebaseConfig.getAllConfig();
})
.then(async (_remoteConfig) => {
  const networkApi = await NetworkApi.createAndInit();
  const envConfig: EnvConfig = {
    orgId,
  }
  //TODO: make more type safe
  // const translationFiles = translationsForTranslationOrg(orgId);
  config = new ConfigFactory(_remoteConfig, envConfig, networkApi);

  //Default translation?
  // translation = config.getTranslations(TranslationEnum.en_AU);
  return registerScreens(config);
})
.then(() => {
  const title = 'MyWell'
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'example.FirstTabScreen', // unique ID registered with Navigation.registerScreen
      title: config.getApplicationName(),
      navigatorStyle: defaultNavigatorStyle,
      navigatorButtons: {
        leftButtons: [{
          title: 'MENU',
          passProps: {},
          id: 'sideMenu',
          disabled: false,
          disableIconTint: true,
          buttonColor: textDark,
          buttonFontSize: 14,
          buttonFontWeight: '600'
        }],
        rightButtons: [{
          icon: require('./assets/search/48.png'),
          passProps: {},
          id: 'search',
          disabled: false, 
          disableIconTint: false, 
          buttonColor: textDark, 
          buttonFontSize: 14, 
          buttonFontWeight: '600' 
        }],
      }
    },
    drawer: {
      left: {
        screen: 'screen.MenuScreen',
        disableOpenGesture: true,
        fixedWidth: 800,
        passProps: {
          config
        }
      }
    },
    animationType: 'fade',
    passProps: {
      config,
    },
  })
})
.catch((err: Error) => console.error(err));