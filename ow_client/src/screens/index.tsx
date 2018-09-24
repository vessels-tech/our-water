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

import { createStore, applyMiddleware } from 'redux';
import OWApp from '../reducers';
import { Provider } from 'react-redux';
import * as appActions from '../actions/index';


import thunkMiddleware from 'redux-thunk';
//@ts-ignore
import { createLogger } from 'redux-logger';

const loggerMiddleware = createLogger();

export function registerScreens(config: ConfigFactory) {

  const store = createStore(OWApp,
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware,
    )
  );

  //TODO: we should log the user in here!
  store.dispatch(appActions.silentLogin(config.appApi))

  Navigation.registerComponent('example.FirstTabScreen', () => App, store, Provider);
  Navigation.registerComponent('screen.MenuScreen', () => SettingsScreen, store, Provider);
  Navigation.registerComponent('screen.EditResourceScreen', () => EditResourceScreen, store, Provider);
  Navigation.registerComponent('screen.SearchScreen', () => SearchScreenWithContext, store, Provider);
  Navigation.registerComponent('screen.menu.ConnectToServiceScreen', () => ConnectToServiceScreen, store, Provider);
  Navigation.registerComponent('screen.NewReadingScreen', () => NewReadingScreen, store, Provider);
}