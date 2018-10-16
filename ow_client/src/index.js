
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import { textDark, primaryText } from './utils/Colors';
import { defaultNavigatorStyle } from './utils';
import { ConfigFactory, EnvConfig } from './config/ConfigFactory';
import { FirebaseConfig } from './config/FirebaseConfig';
import Config from 'react-native-config';
import GGMNDevConfig from './config/GGMNDevConfig';
import MyWellDevConfig from './config/MyWellDevConfig';
import NetworkApi from './api/NetworkApi';
import { TranslationFile, TranslationEnum } from 'ow_translations/Types';
import * as EnvironmentConfig from './utils/EnvConfig';
import SearchButton from './components/common/SearchButton';
import { SearchButtonPressedEvent } from './utils/Events';
import EventEmitter from "react-native-eventemitter";
import { AppRegistry } from 'react-native';
import TestApp from './TestApp';

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

  config = new ConfigFactory(_remoteConfig, envConfig, networkApi);
  console.log("registering screens");
  return registerScreens(config);
})
.then(() => {
  Navigation.registerComponent('example.SearchButton', () => SearchButton);
  console.log("starting app!");

  //TODO: call dispatch stuff after start app?

  // AppRegistry.registerComponent('TestApp', () => TestApp);

  // Navigation.startTabBasedApp({
  //   tabs: [
  //     {
  //       label: 'One', // tab label as appears under the icon in iOS (optional)
  //       screen: 'example.FirstTabScreen', // unique ID registered with Navigation.registerScreen
  //       icon: require('./assets/blue_marker.png'), // local image asset for the tab icon unselected state (optional on iOS)
  //     },
  //   ],
  //   appStyle: {
  //     orientation: 'portrait', // Sets a specific orientation to the entire app. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait
  //   },
  //   passProps: { config }, // simple serializable object that will pass as props to all top screens (optional)
  //   animationType: 'slide-down' // optional, add transition animation to root change: 'none', 'slide-down', 'fade'
  // });



  //Look into slowness issues: https://github.com/react-navigation/react-navigation/issues/608
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'example.FirstTabScreen',
      title: config.getApplicationName(),
      navigatorStyle: defaultNavigatorStyle,
      navigatorButtons: {
        leftButtons: [{
          title: 'MENU',
          passProps: {},
          id: 'sideMenu',
          disabled: false,
          disableIconTint: true,
          buttonColor: primaryText,
          buttonFontSize: 14,
          buttonFontWeight: '600'
        }],
        rightButtons: [{
          component: 'example.SearchButton',
          passProps: {
            text: 'Search',
            onPress: () => {
              EventEmitter.emit(SearchButtonPressedEvent, 'search');
            }
          },
          id: 'search',
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
  });

  console.log("done registering main component");
})
.catch((err: Error) => console.error(err));