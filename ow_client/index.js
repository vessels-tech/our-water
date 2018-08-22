
// import { AppRegistry } from 'react-native';
// import App from './App';

// AppRegistry.registerComponent('OurWater', () => App);
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './src/screens';
import { bgLight, primary, textDark, bgDark, bgMed, bgDark2 } from './src/utils/Colors';
import { defaultNavigatorStyle } from './src/utils';
import { ConfigFactory } from './src/utils/ConfigFactory';
import { FirebaseConfig } from './src/utils/FirebaseConfig';

let config;
console.log("FirebaseConfig", FirebaseConfig);

Promise.resolve(true)
.then(() => FirebaseConfig.getAllConfig())
.then(_config => {
    config = new ConfigFactory(_config);
    registerScreens(config); // this is where you register all of your app's screens
    console.log("config is", config);
})
.then(() => {
  // start the app
  console.log("registered screens, startSingleScreenApp");
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
      }
    },
    animationType: 'fade'
  })
});