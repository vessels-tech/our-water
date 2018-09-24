import * as React from 'react';
import { Navigation } from 'react-native-navigation';

import NewReadingScreen from './NewReadingScreen';
import SettingsScreen from './SettingsScreen';
import EditResourceScreen from './EditResourceScreen';
import SearchScreenWithContext from './SearchScreen';
import ConnectToServiceScreen from './menu/ConnectToServiceScreen';
import { ConfigFactory } from '../config/ConfigFactory';
import AppProvider, { AppContext } from '../AppProvider';
import App from '../App';

import { createStore } from 'redux';
import OWApp from '../reducers';
import { Provider } from 'react-redux';

const store = createStore(OWApp);

const wrapComponentWithProvider = (Comp: any) => (props: any) => {
  return (
    <AppProvider config={props.config}>
      <Comp {...props}/>
    </AppProvider>
  );
}

export function registerScreens(config: ConfigFactory) {
  console.log("register screens");
  // Navigation.registerComponent('example.FirstTabScreen', () => wrapComponentWithProvider(AppWithContext));
  // Navigation.registerComponent('screen.MenuScreen', () => wrapComponentWithProvider(SettingsScreen));
  // Navigation.registerComponent('screen.EditResourceScreen', () => wrapComponentWithProvider(EditResourceScreen));
  // Navigation.registerComponent('screen.SearchScreen', () => wrapComponentWithProvider(SearchScreenWithContext));
  // Navigation.registerComponent('screen.menu.ConnectToServiceScreen', () => wrapComponentWithProvider(ConnectToServiceScreen));
  // Navigation.registerComponent('screen.NewReadingScreen', () => wrapComponentWithProvider(NewReadingScreen));


  Navigation.registerComponent('example.FirstTabScreen', () => App, store, Provider);
  Navigation.registerComponent('screen.MenuScreen', () => SettingsScreen, store, Provider);
  Navigation.registerComponent('screen.EditResourceScreen', () => EditResourceScreen, store, Provider);
  Navigation.registerComponent('screen.SearchScreen', () => SearchScreenWithContext, store, Provider);
  Navigation.registerComponent('screen.menu.ConnectToServiceScreen', () => ConnectToServiceScreen, store, Provider);
  Navigation.registerComponent('screen.NewReadingScreen', () => NewReadingScreen, store, Provider);
}