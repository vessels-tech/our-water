
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import { textDark } from './utils/Colors';
import { defaultNavigatorStyle } from './utils';
import { ConfigFactory } from './utils/ConfigFactory';
import { FirebaseConfig } from './utils/FirebaseConfig';
import Config from 'react-native-config';

let config: ConfigFactory;

console.log("WTF?");

Promise.resolve(true)
//Get the fb config first
//TODO: fix this...
.then(() => FirebaseConfig.getAllConfig())
.then(_remoteConfig => {
  console.log("got config");
  config = new ConfigFactory(_remoteConfig, Config);
  // config = new ConfigFactory({});
  registerScreens();
  console.log("registered screens");
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