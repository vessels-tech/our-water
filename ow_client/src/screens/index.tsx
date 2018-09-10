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
import AppWithContext from '../App';


const wrapComponentWithProvider = (Comp: any) => (props: any) => {
  return (
    <AppProvider config={props.config}>
      <Comp {...props}/>
    </AppProvider>
  );
}

export function registerScreens(config: ConfigFactory) {
  console.log("register screens");
  Navigation.registerComponent('example.FirstTabScreen', () => wrapComponentWithProvider(AppWithContext));
  // Navigation.registerComponent('screen.ResourceDetailScreen', () => wrapComponentWithProvider(ResourceDetailScreen));
  Navigation.registerComponent('screen.MenuScreen', () => wrapComponentWithProvider(SettingsScreen));
  Navigation.registerComponent('screen.EditResourceScreen', () => wrapComponentWithProvider(EditResourceScreen));
  Navigation.registerComponent('screen.SearchScreen', () => wrapComponentWithProvider(SearchScreenWithContext));
  Navigation.registerComponent('screen.menu.ConnectToServiceScreen', () => wrapComponentWithProvider(ConnectToServiceScreen));


  //TODO: if we want, we can register different (but similar) compoments based on the version of OW
  Navigation.registerComponent('screen.NewReadingScreen', () => wrapComponentWithProvider(NewReadingScreen));
  // Navigation.registerComponent('screen.NewReadingScreen', () => GGMNReadingScreen);
}