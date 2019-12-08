import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import { primaryDark, secondaryLight, secondaryDark, primaryLight, secondaryText, bgMed } from './utils/Colors';
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
import { primaryText } from './utils/NewColors';

// This fixes set issues with react native
// ref: https://github.com/facebook/react-native/issues/3223
require('core-js/es6/array');

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
.then(async () => {
  // AppRegistry.registerComponent('App', () => TestApp);
  Navigation.registerComponent('example.SearchButton', () => SearchButton);

  const navigatorButtons = {
    leftButtons: [{
      title: 'MENU',
      passProps: {},
      id: 'sideMenu',
      disabled: false,
      disableIconTint: true,
      buttonColor: primaryText.high,
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
      // fixedWidth: 800,
      passProps: {
        config
      }
    }
  };

  Navigation.setDefaultOptions({
    layout: {
      orientation: ['portrait']
    }
  })

  const [menuIcon, searchIcon] = await Promise.all([
    MaterialIcons.getImageSource('menu', 25),
    MaterialIcons.getImageSource('search', 25),
  ]);

  switch(config.getHomeScreenType()) {
    case (HomeScreenType.Map): {
      // Navigation.startSingleScreenApp({
      //   screen: {
      //     screen: 'screen.App',
      //     title: config.getApplicationName(),
      //     navigatorStyle: defaultNavigatorStyle,
      //     navigatorButtons,
      //   },
      //   drawer,
      //   animationType: 'fade',
      //   passProps: { config },
      // });

      break;
    }
    case (HomeScreenType.Simple): {
      console.log(('simple'))
      Navigation.setRoot({
        root: {
          sideMenu: {
            options: {
              topBar: {
                leftButtons: [
                  { id: 'sideMenu', icon: menuIcon }]
              }
            },
            left: {
              component: {
                name: 'screen.MenuScreen',
                passProps: { config },
                options: {
                  topBar: { title: 'MENU' }
                }
              }
            },
            center: {
              stack: {
                id: 'Stack',
                children: [{
                  component: {
                    name: 'screen.App',
                    passProps: { config }
                  }
                }],
                options: {
                  topBar: {
                    // leftButtons: [{
                    //   id: 'sideMenu'
                    // }],
                    title: {
                      text: config.getApplicationName(),
                    },
                  },
                }
              }
            }
          }
        }
      });
      // Navigation.startSingleScreenApp({
      //   screen: {
      //     screen: 'screen.App',
      //     title: config.getApplicationName(),
      //     navigatorStyle: defaultNavigatorStyle,
      //     navigatorButtons,
      //   },
      //   drawer,
      //   animationType: 'fade',
      //   passProps: { config },
      //   appStyle: {
      //     tabBarButtonColor: bgMed,
      //     tabBarSelectedButtonColor: primaryDark,
      //     orientation: 'portrait',
      //     bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
      //     bottomTabBadgeBackgroundColor: 'green', // Optional, change badge background color. Android only
      //   },
      // });
      
    break;
    }
    default: 
      throw new Error(`Unknown home screen type: ${config.getHomeScreenType()}`);
  }
})
.catch((err: Error) => console.log('Error Launching App:', err));