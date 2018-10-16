
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
        onPress: () => {
          EventEmitter.emit(SearchButtonPressedEvent, 'search');
        }
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
    }
    case (HomeScreenType.Simple): {
      Navigation.startTabBasedApp({
        tabs: [
          {
            label: 'Home', 
            screen: 'screen.App', // unique ID registered with Navigation.registerScreen
            icon: require('./assets/other_pin.png'), // local image asset for the tab icon unselected state (optional on iOS)
            // selectedIcon: require('../img/one_selected.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
            title: 'Screen One', // title of the screen as appears in the nav bar (optional)
          },
          {
            label: 'Scan', // tab label as appears under the icon in iOS (optional)
            screen: 'screen.App', // unique ID registered with Navigation.registerScreen
            icon: require('./assets/other_pin.png'), // local image asset for the tab icon unselected state (optional on iOS)
            // selectedIcon: require('../img/one_selected.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
            title: 'Screen Two', // title of the screen as appears in the nav bar (optional)
          },
          {
            label: 'Map', // tab label as appears under the icon in iOS (optional)
            screen: 'screen.App', // unique ID registered with Navigation.registerScreen
            icon: require('./assets/other_pin.png'), // local image asset for the tab icon unselected state (optional on iOS)
            // selectedIcon: require('../img/one_selected.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
            title: 'Screen Three', // title of the screen as appears in the nav bar (optional)
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
    }
  }
})
.catch((err: Error) => console.error(err));