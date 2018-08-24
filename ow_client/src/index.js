
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import { textDark } from './utils/Colors';
import { defaultNavigatorStyle } from './utils';
import { ConfigFactory } from './config/ConfigFactory';
import { FirebaseConfig } from './config/FirebaseConfig';
import Config from 'react-native-config';
import GGMNDevConfig from './config/GGMNDevConfig';
import NetworkApi from './api/NetworkApi';

let config: ConfigFactory;

Promise.resolve(true)
.then(() => {
  if (Config.SHOULD_USE_LOCAL_CONFIG === 'true') {
    console.log("using local config instead of FB remote config");
    return GGMNDevConfig;
  }
  return FirebaseConfig.getAllConfig();
})
.then(async (_remoteConfig) => {
  const networkApi = await NetworkApi.createAndInit();
  config = new ConfigFactory(_remoteConfig, Config, networkApi);
  registerScreens();
})
.then(() => {
  console.log("config is:", config);
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'example.FirstTabScreen', // unique ID registered with Navigation.registerScreen
      title: config.getApplicationName(), // title of the screen as appears in the nav bar (optional)
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
          title: 'SEARCH',
          passProps: {},
          id: 'search',
          disabled: false, 
          disableIconTint: true, 
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
      //config will be available on all props.config?
      config,
    },
  })
})
.catch((err: Error) => console.error(err));