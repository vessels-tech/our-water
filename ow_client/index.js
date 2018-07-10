
// import { AppRegistry } from 'react-native';
// import App from './App';

// AppRegistry.registerComponent('OurWater', () => App);


import { Navigation } from 'react-native-navigation';
import { registerScreens } from './src/screens';

registerScreens(); // this is where you register all of your app's screens

// start the app
Navigation.startSingleScreenApp({
  screen: {
    screen: 'example.FirstTabScreen', // unique ID registered with Navigation.registerScreen
    // title: 'Welcome', // title of the screen as appears in the nav bar (optional)
    navigatorStyle: {
      navBarHidden: true,
    }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
    navigatorButtons: {} // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
  },
  drawer: {
    left: {
      screen: 'screen.MenuScreen',
      disableOpenGesture: true,
      fixedWidth: 750,
    }
  }
});