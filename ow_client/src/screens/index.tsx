import * as React from 'react';
import { Navigation } from 'react-native-navigation';

import App from '../App';
import NewReadingScreen from './NewReadingScreen';
import ResourceDetailScreen from './ResourceDetailScreen';
import SettingsScreen from './SettingsScreen';
import EditResourceScreen from './EditResourceScreen';
import SearchScreenWithContext from './SearchScreen';
import ConnectToServiceScreen from './menu/ConnectToServiceScreen';
import GGMNReadingScreen from './GGMNReadingScreen';
import { ConfigFactory } from '../config/ConfigFactory';
import AppProvider, { AppContext } from '../AppProvider';
//@ts-ignore
import Provider from 'react-context-api-store';

const store = {
  isConnected: false,
};


const wrapComponentWithProvider = (Comp: any) => (props: any) => {

  return (
    <Provider store={store}>
      <Comp {...props}/>
    </Provider>
  );
}

export function registerScreens(config: ConfigFactory) {
  //@ts-ignore
  Navigation.registerComponent('example.FirstTabScreen', () => wrapComponentWithProvider(App), store, Provider);
  Navigation.registerComponent('screen.ResourceDetailScreen', () => ResourceDetailScreen);
  Navigation.registerComponent('screen.MenuScreen', () => SettingsScreen);
  Navigation.registerComponent('screen.EditResourceScreen', () => EditResourceScreen);
  //@ts-ignore
  Navigation.registerComponent('screen.SearchScreen', () => SearchScreenWithContext, undefined, AppContext.Provider);
  
  Navigation.registerComponent('screen.menu.ConnectToServiceScreen', () => ConnectToServiceScreen);


  //TODO: if we want, we can register different (but similar) compoments based on the version of OW
  Navigation.registerComponent('screen.NewReadingScreen', () => NewReadingScreen);
  // Navigation.registerComponent('screen.NewReadingScreen', () => GGMNReadingScreen);
}