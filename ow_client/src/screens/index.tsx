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
import Provider from '../utils/ContextStore';
import SearchScreen from './SearchScreen';
import { AsyncStorage } from "react-native"
import AppWithProvider from '../App';
import AppWithContext from '../App';

const store = {
  isConnected: true,
};

// const persist = {
//   // storage: {
//   //   getItem: async (key: string) => (JSON.stringify({isConnected: false})),
//   //   setItem: (key: string, value: any) => {
//   //     console.log('Setting item:', key, value);
//   //   },
//   //   removeItem: (key: string) => {console.log("removing item", key)}
//   // },
//   storage: AsyncStorage,
//   statesToPersist(savedStore: any) {
//     console.log("statesToPersist", savedStore)
//     return { ...savedStore };
//   }
// }

const wrapComponentWithProvider = (Comp: any) => (props: any) => {
  return (
    <AppProvider config={props.config}>
      <Comp {...props}/>
    </AppProvider>
  );
}

export function registerScreens(config: ConfigFactory) {
  console.log("register screens");
  //@ts-ignore
  Navigation.registerComponent('example.FirstTabScreen', () => wrapComponentWithProvider(AppWithContext));
  // Navigation.registerComponent('example.FirstTabScreen', (config) => AppWithProvider({config}));
  Navigation.registerComponent('screen.ResourceDetailScreen', () => ResourceDetailScreen);
  Navigation.registerComponent('screen.MenuScreen', () => SettingsScreen);
  Navigation.registerComponent('screen.EditResourceScreen', () => EditResourceScreen);
  //@ts-ignore
  // Navigation.registerComponent('screen.SearchScreen', () => wrapComponentWithProvider(SearchScreen));
  Navigation.registerComponent('screen.SearchScreen', () => wrapComponentWithProvider(SearchScreenWithContext));
  
  Navigation.registerComponent('screen.menu.ConnectToServiceScreen', () => ConnectToServiceScreen);


  //TODO: if we want, we can register different (but similar) compoments based on the version of OW
  Navigation.registerComponent('screen.NewReadingScreen', () => NewReadingScreen);
  // Navigation.registerComponent('screen.NewReadingScreen', () => GGMNReadingScreen);
}