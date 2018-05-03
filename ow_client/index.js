
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
  // tabs: [
  //   {
  //     label: 'One',
  //     screen: 'example.FirstTabScreen', // this is a registered name for a screen
  //     icon: require('./assets/blue_marker.png'),
  //     // selectedIcon: require('../img/one_selected.png'), // iOS only
  //     title: 'Screen One'
  //   },
    // {
    //   label: 'Two',
    //   screen: 'example.SecondTabScreen',
    //   icon: require('../img/two.png'),
    //   selectedIcon: require('../img/two_selected.png'), // iOS only
    //   title: 'Screen Two'
    // }
  // ]
});