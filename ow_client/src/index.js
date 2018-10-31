
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import { primaryText } from './utils/Colors';
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
import { SearchButtonPressedEvent, SearchEventValue } from './utils/Events';
//@ts-ignore
import EventEmitter from "react-native-eventemitter";
import { AppRegistry } from 'react-native';
import TestApp from './TestApp';
import { HomeScreenType } from './enums';

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
  return registerScreens(config);
})
.then(() => {
  AppRegistry.registerComponent('App', () => TestApp);

  Navigation.registerComponent('example.SearchButton', () => SearchButton);

  const navigatorButtons = {
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
      },
      id: 'search',
    }],
  };

  const drawer = {
    left: {
      screen: 'screen.MenuScreen',
      disableOpenGesture: true,
      fixedWidth: 800,
      passProps: {
        config
      }
    }
  };


  switch(config.getHomeScreenType()) {
    case (HomeScreenType.Map): {
      Navigation.startSingleScreenApp({
        screen: {
          screen: 'screen.App',
          title: config.getApplicationName(),
          navigatorStyle: defaultNavigatorStyle,
          navigatorButtons,
        },
        drawer,
        animationType: 'fade',
        passProps: {
          config,
        },
      });

      break;
    }
    case (HomeScreenType.Simple): {
      //@ts-ignore
      Navigation.startTabBasedApp({
        tabs: [
          {
            label: 'Home', 
            screen: 'screen.App',
            icon: require('./assets/other_pin.png'),
            title: config.getApplicationName(),
            navigatorButtons,
            navigatorStyle: defaultNavigatorStyle,
          },
          {
            label: 'Scan',
            screen: 'screen.ScanScreen',
            icon: require('./assets/other_pin.png'),
            title: config.getApplicationName(),
            navigatorButtons,
            navigatorStyle: defaultNavigatorStyle,
          },
          {
            label: 'Map',
            screen: 'screen.SimpleMapScreen',
            icon: require('./assets/other_pin.png'),
            title: config.getApplicationName(),
            navigatorButtons,
            navigatorStyle: defaultNavigatorStyle,
          }
        ],
        tabsStyle: { // optional, add this if you want to style the tab bar beyond the defaults
          tabBarButtonColor: '#ffff00', // optional, change the color of the tab icons and text (also unselected). On Android, add this to appStyle
          tabBarSelectedButtonColor: '#ff9900', // optional, change the color of the selected tab icon and text (only selected). On Android, add this to appStyle
          tabBarBackgroundColor: '#551A8B', // optional, change the background color of the tab bar
          initialTabIndex: 1, // optional, the default selected bottom tab. Default: 0. On Android, add this to appStyle
        },
        appStyle: {
          orientation: 'portrait', // Sets a specific orientation to the entire app. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait'
        },
        drawer,
        passProps: {config},
        animationType: 'fade'
      });
    break;
    }
  }
})
.catch((err: Error) => console.error(err));