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

import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist'
import OWApp, { initialState } from '../reducers';
import { Provider } from 'react-redux';
import * as appActions from '../actions/index';
import thunkMiddleware from 'redux-thunk';
//@ts-ignore
import { createLogger } from 'redux-logger';
import { UserType, MobileUser } from '../typings/UserTypes';
import { OWUser } from '../typings/models/OurWater';
import { ResultType, makeError, makeSuccess } from '../typings/AppProviderTypes';
import SyncScreen from './menu/SyncScreen';
import { EnableLogging, EnableReduxLogging, EnableCaching } from '../utils/EnvConfig';
import SelectLanguageModal from './menu/SelectLanguageModal';
import ScanScreen from './ScanScreen';
import SimpleMapScreen from './SimpleMapScreen';
import SimpleResourceScreen from './SimpleResourceScreen';
import SimpleResourceDetailScreen from './SimpleResourceDetailScreen';
import TakePictureScreen from './TakePictureScreen';
import GroundwaterSyncScreen from './GroundwaterSyncScreen';
import { PendingReading } from '../typings/models/PendingReading';
import { PendingResource } from '../typings/models/PendingResource';
import SignInScreen from './menu/SignInScreen';
import { RNFirebase } from 'react-native-firebase';
import { AnonymousUser } from '../typings/api/FirebaseApi';
import EditReadingsScreen from './EditReadingsScreen';
// @ts-ignore
import * as AsyncStorage from 'rn-async-storage';
import { AnyAction } from '../actions/AnyAction';
import { ActionType } from '../actions/ActionType';
import { maybeLog } from '../utils';
import PendingScreen from './menu/PendingScreen';
import { ExternalServiceApiType } from '../api/ExternalServiceApi';
import AboutScreen from './menu/AboutScreen';
import ModalImageScreen from './ModalImageScreen';


let loggerMiddleware: any = null;
if (EnableReduxLogging) {
  console.log("REDUX LOGGING ENABLED")
  loggerMiddleware = createLogger();
} else {
  console.log("REDUX LOGGING DISABLED");
}


//TODO: figure out if user has changed and remove old subscriptions
const setUpUserSubscriptions = (store: any, config: ConfigFactory, userId: string) => {
  /* Subscribe to firebase updates */
  const unsubscribe = config.userApi.subscribeToUser(userId, (user: OWUser) => {
    store.dispatch(appActions.getUserResponse({ type: ResultType.SUCCESS, result: user }))
  });
  store.dispatch(appActions.passOnUserSubscription(unsubscribe));

  config.appApi.subscribeToPendingReadings(userId, (readings: PendingReading[]) => {
    store.dispatch(appActions.getBulkPendingReadings({ type: ResultType.SUCCESS, result: readings }))
  });

  config.appApi.subscribeToPendingResources(userId, (resources: PendingResource[]) => {
    store.dispatch(appActions.getPendingResourcesResponse({ type: ResultType.SUCCESS, result: resources }))
  });
}

export async function getCached(id: string): Promise<any | null> {
  if (!EnableCaching) {
    maybeLog("Tried getCached but EnableCaching is false.");
    return Promise.resolve(null);
  }

  try {
    const json = await AsyncStorage.getItem(id);
    if (!json) {
      return null;
    }

    const parsed = JSON.parse(json);
    return parsed;
  } catch(err) {
    maybeLog("getCached, " + err.message);
    return null;
  }
}

export async function registerScreens(config: ConfigFactory) {
  const persistMiddleware = () => {
    return (next: any) => (action: AnyAction) => {
      const returnValue = next(action);

      if (action.type === ActionType.GET_RESOURCES_RESPONSE) {
        if (action.result.type === ResultType.SUCCESS) {
          const state = store.getState();
          AsyncStorage.setItem('ourwater_resources', JSON.stringify(state.resources));
          AsyncStorage.setItem('ourwater_resourcesCache_2', JSON.stringify(state.resourcesCache));
        }
      }

      if (action.type === ActionType.GET_SHORT_ID_RESPONSE) {
        if (action.result.type === ResultType.SUCCESS) {
          const state = store.getState();
          AsyncStorage.setItem('ourwater_shortIdCache', JSON.stringify(state.shortIdCache))
          AsyncStorage.setItem('ourwater_shortIdMeta', JSON.stringify(state.shortIdMeta))
        }
      }

      return returnValue;
    }
  }

  let resources = await getCached('ourwater_resources');
  let resourcesCache = await getCached('ourwater_resourcesCache_2');
  let shortIdCache = await getCached('ourwater_shortIdCache');
  let shortIdMeta = await getCached('ourwater_shortIdMeta');

  let middleware;
  if (loggerMiddleware) {
    middleware = applyMiddleware(persistMiddleware, thunkMiddleware, loggerMiddleware);
  } else {
    middleware = applyMiddleware(persistMiddleware, thunkMiddleware);
  }

  if (resources) {
    initialState.resources = resources;
  }

  if (resourcesCache) {
    initialState.resourcesCache = resourcesCache;
  }

  if (shortIdCache) {
    initialState.shortIdCache = shortIdCache;
  }

  if (shortIdMeta) {
    initialState.shortIdMeta = shortIdMeta;
  }

  const store = createStore(
    OWApp,
    initialState,
    compose(
      middleware,
    ),
  );

  //Update the translations to use the remote config
  store.dispatch(appActions.updatedTranslation(config.getTranslationFiles(), config.getTranslationOptions()));

  //Listen for a user
  const authUnsubscribe = config.userApi.onAuthStateChanged(async (rnFirebaseUser: null | RNFirebase.User) => {
    if (!rnFirebaseUser) {
      await store.dispatch(appActions.silentLogin(config.appApi));
      return;
    }

    //Get the token
    let token;
    try {
      token = await rnFirebaseUser.getIdToken();
    } catch (err) {
      store.dispatch(appActions.loginCallback(makeError<MobileUser | AnonymousUser>('Could not get token for user')))
      return;
    }


    //Build the user
    let user: AnonymousUser | MobileUser;
    if (rnFirebaseUser.isAnonymous) {
      user = {
        type: UserType.USER,
        userId: rnFirebaseUser.uid,
        token,
      }
    } else {
      user = {
        type: UserType.MOBILE_USER,
        userId: rnFirebaseUser.uid,
        token,
        mobile: rnFirebaseUser.phoneNumber,
      }
    }

    setUpUserSubscriptions(store, config, user.userId);
    store.dispatch(appActions.loginCallback(makeSuccess<AnonymousUser | MobileUser>(user)))
  });

  // @ts-ignore
  // store.dispatch(appActions.getGeolocation());

  if (config.externalServiceApi.externalServiceApiType === ExternalServiceApiType.Has) {
    await store.dispatch(appActions.getExternalLoginDetails(config.externalServiceApi));
  }

  console.log("registering navigation components");
  Navigation.registerComponent('screen.App', withReduxStoreWrapper(App, store));
  Navigation.registerComponent('screen.MenuScreen', withReduxStoreWrapper(SettingsScreen, store));
  Navigation.registerComponent('screen.SearchScreen', withReduxStoreWrapper(SearchScreenWithContext, store));
  Navigation.registerComponent('screen.menu.EditResourceScreen', withReduxStoreWrapper(EditResourceScreen, store));
  Navigation.registerComponent('screen.menu.ConnectToServiceScreen', withReduxStoreWrapper(ConnectToServiceScreen, store));
  Navigation.registerComponent('screen.menu.SyncScreen', withReduxStoreWrapper(SyncScreen, store));
  Navigation.registerComponent('screen.menu.SignInScreen', withReduxStoreWrapper(SignInScreen, store));
  Navigation.registerComponent('screen.NewReadingScreen', withReduxStoreWrapper(NewReadingScreen, store));
  Navigation.registerComponent('modal.SelectLanguageModal', withReduxStoreWrapper(SelectLanguageModal, store));
  Navigation.registerComponent('screen.ScanScreen', withReduxStoreWrapper(ScanScreen, store));
  Navigation.registerComponent('screen.SimpleMapScreen', withReduxStoreWrapper(SimpleMapScreen, store));
  Navigation.registerComponent('screen.SimpleResourceScreen', withReduxStoreWrapper(SimpleResourceScreen, store));
  Navigation.registerComponent('screen.SimpleResourceDetailScreen', withReduxStoreWrapper(SimpleResourceDetailScreen, store));
  Navigation.registerComponent('modal.TakePictureScreen', withReduxStoreWrapper(TakePictureScreen, store));
  Navigation.registerComponent('screen.GroundwaterSyncScreen', withReduxStoreWrapper(GroundwaterSyncScreen, store));
  Navigation.registerComponent('screen.EditReadingsScreen', withReduxStoreWrapper(EditReadingsScreen, store));
  Navigation.registerComponent('screen.PendingScreen', withReduxStoreWrapper(PendingScreen, store));
  Navigation.registerComponent('AboutScreen', withReduxStoreWrapper(AboutScreen, store));
  Navigation.registerComponent('ModalImageScreen', withReduxStoreWrapper(ModalImageScreen, store));

  return store;
}


const withReduxStoreWrapper = (ReduxScreen: any, reduxStore: any) => () => (props: any) => (
  <Provider store={reduxStore}>
    <ReduxScreen {...props} />
  </Provider>
);

export default withReduxStoreWrapper;
