
// import { AppRegistry } from 'react-native';
// import App from './App';

// AppRegistry.registerComponent('OurWater', () => App);


import { Navigation } from 'react-native-navigation';
import { registerScreens } from './src/screens';
import { bgLight, primary, textDark, bgDark, bgMed, bgDark2 } from './src/utils/Colors';
import { defaultNavigatorStyle } from './src/utils';


registerScreens(); // this is where you register all of your app's screens

// start the app
console.log("registered screens, startSingleScreenApp");
Navigation.startSingleScreenApp({
  screen: {
    screen: 'example.FirstTabScreen', // unique ID registered with Navigation.registerScreen
    title: 'OurWater', // title of the screen as appears in the nav bar (optional)
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
});