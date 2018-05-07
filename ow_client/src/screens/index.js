import { Navigation } from 'react-native-navigation';

import App from '../App';
import NewReadingScreen from './NewReadingScreen';
import ResourceDetailScreen from './ResourceDetailScreen';

export function registerScreens() {
  Navigation.registerComponent('example.FirstTabScreen', () => App);
  Navigation.registerComponent('screen.NewReadingScreen', () => NewReadingScreen);
  Navigation.registerComponent('screen.ResourceDetailScreen', () => ResourceDetailScreen);
}