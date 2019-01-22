
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import { primaryText, primaryDark, secondaryLight, secondaryDark, primaryLight, secondaryText, bgMed } from './utils/Colors';
import { defaultNavigatorStyle } from './utils';
import { ConfigFactory, EnvConfig } from './config/ConfigFactory';
import { FirebaseConfig } from './config/FirebaseConfig';
import Config from 'react-native-config';
import GGMNDevConfig from './config/GGMNDevConfig';
import MyWellDevConfig from './config/MyWellDevConfig';
import NetworkApi from './api/NetworkApi';
import * as EnvironmentConfig from './utils/EnvConfig';
import SearchButton from './components/common/SearchButton';
import { SearchButtonPressedEvent, SearchEventValue } from './utils/Events';
//@ts-ignore
import EventEmitter from "react-native-eventemitter";
import { AppRegistry } from 'react-native';
import TestApp from './TestApp';
import { HomeScreenType } from './enums';

// This fixes set issues with react native
// ref: https://github.com/facebook/react-native/issues/3223
require('core-js/es6/array')

let config: ConfigFactory;
const orgId = EnvironmentConfig.OrgId;

Promise.resolve(true)
.then(() => {
  if (Config.SHOULD_USE_LOCAL_CONFIG === 'true') {
    console.log("USING LOCAL CONFIG");
    switch (Config.CONFIG_TYPE) {
      case 'GGMNDevConfig':
        return GGMNDevConfig;
      default:
        return MyWellDevConfig;
    }
  }
  return FirebaseConfig.getAllConfig();
})
.catch(err => {
  console.log("Error getting remote config", err);
  console.log("Defaulting to local config.");
  
  switch (Config.CONFIG_TYPE) {
    case 'GGMNDevConfig':
      return GGMNDevConfig;
    default:
      return MyWellDevConfig;
  }
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
  console.log("GGMN Registering app component")
  // AppRegistry.registerComponent('App', () => TestApp);
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
      console.log("GGMN STARTING SINGLE SCREEN APP");
      Navigation.startSingleScreenApp({
        screen: {
          screen: 'screen.App',
          title: config.getApplicationName(),
          navigatorStyle: defaultNavigatorStyle,
          navigatorButtons,
        },
        drawer,
        animationType: 'fade',
        passProps: { config },
      });

      break;
    }
    case (HomeScreenType.Simple): {
      //@ts-ignore
      Navigation.startTabBasedApp({
        tabs: [
          {
            // label: 'Home', 
            screen: 'screen.App',
            icon: require('./assets/home.png'),
            title: config.getApplicationName(),
            navigatorButtons,
            navigatorStyle: defaultNavigatorStyle,
          },
          {
            // label: 'Scan',
            screen: 'screen.ScanScreen',
            icon: require('./assets/scan.png'),
            title: config.getApplicationName(),
            navigatorButtons,
            navigatorStyle: defaultNavigatorStyle,
          },
          {
            // label: 'Map',
            screen: 'screen.SimpleMapScreen',
            icon: require('./assets/map.png'),
            title: config.getApplicationName(),
            navigatorButtons,
            navigatorStyle: defaultNavigatorStyle,
          }
        ],
        tabsStyle: { 
          tabBarButtonColor: primaryText,
          tabBarSelectedButtonColor: primaryDark,
          tabBarBackgroundColor: '#551A8B', // optional, change the background color of the tab bar
          initialTabIndex: 1, // optional, the default selected bottom tab. Default: 0. On Android, add this to appStyle
        },
        appStyle: {
          // Here for android
          tabBarButtonColor: bgMed,
          tabBarSelectedButtonColor: primaryDark,
          orientation: 'portrait',
          bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
          bottomTabBadgeBackgroundColor: 'green', // Optional, change badge background color. Android only
        },
        drawer,
        passProps: {config},
        animationType: 'fade'
      });
    break;
    }
  }
})
.catch((err: Error) => console.log('Error Launching App:', err));