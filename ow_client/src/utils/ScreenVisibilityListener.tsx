//@ts-ignore
import { Navigation } from 'react-native-navigation';
import { crashlyticsLog } from '.';
import { EmitterSubscription } from 'react-native';


export class ScreenVisibilityListener {
  listener?: EmitterSubscription;

  register() {
    if (typeof this.listener === 'undefined') {
      this.listener = Navigation.events().registerComponentDidAppearListener((payload) => {
        
      });
    }
  }

  unregister() {
    if (typeof this.listener !== 'undefined') {
      this.listener.remove();
      this.listener = undefined;
    }
  }
}