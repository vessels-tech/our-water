import * as React from 'react';
import { Navigation } from 'react-native-navigation';

import NewReadingScreen from './NewReadingScreen';
import SettingsScreen from './SettingsScreen';
import EditResourceScreen from './menu/EditResourceScreen';
import SearchScreenWithContext from './SearchScreen';
import ConnectToServiceScreen from './menu/ConnectToServiceScreen';
import { ConfigFactory } from '../config/ConfigFactory';
import App from '../App';

import { createStore, applyMiddleware } from 'redux';
import OWApp from '../reducers';
import { Provider } from 'react-redux';
import * as appActions from '../actions/index';
import thunkMiddleware from 'redux-thunk';
//@ts-ignore
import { createLogger } from 'redux-logger';
import { UserType } from '../typings/UserTypes';
import { OWUser, Reading, Resource } from '../typings/models/OurWater';
import { ResultType } from '../typings/AppProviderTypes';
import SyncScreen from './menu/SyncScreen';

const loggerMiddleware = createLogger();

export async function registerScreens(config: ConfigFactory) {

  const store = createStore(OWApp,
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware,
    )
  );

  /* Initial actions */
  await store.dispatch(appActions.silentLogin(config.appApi));
  await store.dispatch(appActions.getGeolocation());
  const user = store.getState().user;
  if (user.type === UserType.USER) {
    await store.dispatch(appActions.getUser(config.userApi, user.userId));
    
    /* Subscribe to firebase updates */
    config.appApi.subscribeToUser(user.userId, (user: OWUser) => {
      console.log("got updated user!", user);
      store.dispatch(appActions.getUserResponse({type: ResultType.SUCCESS, result: user}))
    });

    config.appApi.subscribeToPendingReadings(user.userId, (readings: Reading[]) => {
      store.dispatch(appActions.getPendingReadingsResponse({ type: ResultType.SUCCESS, result: readings }))
    });

    config.appApi.subscribeToPendingResources(user.userId, (resources: Resource[]) => {
      store.dispatch(appActions.getPendingResourcesResponse({ type: ResultType.SUCCESS, result: resources }))
    });
  }

  console.log(config.externalServiceApi);
  if (config.externalServiceApi) {
    await store.dispatch(appActions.getExternalLoginDetails(config.externalServiceApi));
  }

  Navigation.registerComponent('example.FirstTabScreen', () => App, store, Provider);
  Navigation.registerComponent('screen.MenuScreen', () => SettingsScreen, store, Provider);
  Navigation.registerComponent('screen.SearchScreen', () => SearchScreenWithContext, store, Provider);
  Navigation.registerComponent('screen.menu.EditResourceScreen', () => EditResourceScreen, store, Provider);
  Navigation.registerComponent('screen.menu.ConnectToServiceScreen', () => ConnectToServiceScreen, store, Provider);
  Navigation.registerComponent('screen.menu.SyncScreen', () => SyncScreen, store, Provider);
  Navigation.registerComponent('screen.NewReadingScreen', () => NewReadingScreen, store, Provider);
}