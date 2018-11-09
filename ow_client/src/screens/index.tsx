import * as React from 'react';
import { Navigation } from 'react-native-navigation';

import NewReadingScreen from './NewReadingScreen';
import SettingsScreen from './SettingsScreen';
import EditResourceScreen from './menu/EditResourceScreen';
import SearchScreenWithContext from './SearchScreen';
import ConnectToServiceScreen from './menu/ConnectToServiceScreen';
import { ConfigFactory } from '../config/ConfigFactory';
import App from '../App';
import TestApp from '../TestApp';

import { createStore, applyMiddleware } from 'redux';
import OWApp from '../reducers';
import { Provider } from 'react-redux';
import * as appActions from '../actions/index';
import thunkMiddleware from 'redux-thunk';
//@ts-ignore
import { createLogger } from 'redux-logger';
import { UserType } from '../typings/UserTypes';
import { OWUser } from '../typings/models/OurWater';
import { ResultType } from '../typings/AppProviderTypes';
import SyncScreen from './menu/SyncScreen';
import { EnableLogging } from '../utils/EnvConfig';
import SelectLanguageModal from './menu/SelectLanguageModal';
import ScanScreen from './ScanScreen';
import SimpleMapScreen from './SimpleMapScreen';
import SimpleResourceScreen from './SimpleResourceScreen';
import SimpleResourceDetailScreen from './SimpleResourceDetailScreen';
import TakePictureScreen from './TakePictureScreen';
import GroundwaterSyncScreen from './GroundwaterSyncScreen';
import { PendingReading } from '../typings/models/PendingReading';
import { PendingResource } from '../typings/models/PendingResource';


let loggerMiddleware: any = null;
if (EnableLogging) {
  console.log("LOGGING ENABLED")
  loggerMiddleware = createLogger();
} else {
  console.log("LOGGING DISABLED");
}

export async function registerScreens(config: ConfigFactory) {

  const middleware = loggerMiddleware ? applyMiddleware(thunkMiddleware,loggerMiddleware)
   : applyMiddleware(thunkMiddleware);
  const store = createStore(OWApp, middleware);

  /* Initial actions
    TODO: move these to after the initial App load?
  */
  await store.dispatch(appActions.silentLogin(config.appApi));
  //TODO: I don't know how to fix this.
  //@ts-ignore
  const locationResult = await store.dispatch(appActions.getGeolocation());
  const user = store.getState().user;
  console.log("got user?", user);
  if (user.type === UserType.USER) {
    await store.dispatch(appActions.getUser(config.userApi, user.userId));
    
    /* Subscribe to firebase updates */
    config.userApi.subscribeToUser(user.userId, (user: OWUser) => {
      store.dispatch(appActions.getUserResponse({type: ResultType.SUCCESS, result: user}))
    });

    config.appApi.subscribeToPendingReadings(user.userId, (readings: PendingReading[]) => {
      store.dispatch(appActions.getPendingReadingsResponse({ type: ResultType.SUCCESS, result: readings }))
    });

    config.appApi.subscribeToPendingResources(user.userId, (resources: PendingResource[]) => {
      store.dispatch(appActions.getPendingResourcesResponse({ type: ResultType.SUCCESS, result: resources }))
    });
  }

  if (config.externalServiceApi) {
    await store.dispatch(appActions.getExternalLoginDetails(config.externalServiceApi));
  }

  Navigation.registerComponent('screen.App', () => App, store, Provider);
  Navigation.registerComponent('screen.MenuScreen', () => SettingsScreen, store, Provider);
  Navigation.registerComponent('screen.SearchScreen', () => SearchScreenWithContext, store, Provider);
  Navigation.registerComponent('screen.menu.EditResourceScreen', () => EditResourceScreen, store, Provider);
  Navigation.registerComponent('screen.menu.ConnectToServiceScreen', () => ConnectToServiceScreen, store, Provider);
  Navigation.registerComponent('screen.menu.SyncScreen', () => SyncScreen, store, Provider);
  Navigation.registerComponent('screen.NewReadingScreen', () => NewReadingScreen, store, Provider);
  Navigation.registerComponent('modal.SelectLanguageModal', () => SelectLanguageModal, store, Provider);

  Navigation.registerComponent('screen.ScanScreen', () => ScanScreen, store, Provider);
  Navigation.registerComponent('screen.SimpleMapScreen', () => SimpleMapScreen, store, Provider);
  Navigation.registerComponent('screen.SimpleResourceScreen', () => SimpleResourceScreen, store, Provider);
  Navigation.registerComponent('screen.SimpleResourceDetailScreen', () => SimpleResourceDetailScreen, store, Provider);
  Navigation.registerComponent('modal.TakePictureScreen', () => TakePictureScreen, store, Provider);
  Navigation.registerComponent('screen.GroundwaterSyncScreen', () => GroundwaterSyncScreen, store, Provider);

  return store;
}