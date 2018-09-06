import { Navigation } from 'react-native-navigation';

import App from '../App';
import NewReadingScreen from './NewReadingScreen';
import ResourceDetailScreen from './ResourceDetailScreen';
import SettingsScreen from './SettingsScreen';
import EditResourceScreen from './EditResourceScreen';
import SearchScreen from './SearchScreen';
import ConnectToServiceScreen from './menu/ConnectToServiceScreen';
import GGMNReadingScreen from './GGMNReadingScreen';


export function registerScreens() {
  Navigation.registerComponent('example.FirstTabScreen', () => App);
  Navigation.registerComponent('screen.ResourceDetailScreen', () => ResourceDetailScreen);
  Navigation.registerComponent('screen.MenuScreen', () => SettingsScreen);
  Navigation.registerComponent('screen.EditResourceScreen', () => EditResourceScreen);
  Navigation.registerComponent('screen.SearchScreen', () => SearchScreen);
  
  Navigation.registerComponent('screen.menu.ConnectToServiceScreen', () => ConnectToServiceScreen);


  //TODO: if we want, we can register different (but similar) compoments based on the version of OW
  Navigation.registerComponent('screen.NewReadingScreen', () => NewReadingScreen);
  // Navigation.registerComponent('screen.NewReadingScreen', () => GGMNReadingScreen);
}