//@ts-ignore
import {ScreenVisibilityListener as RNNScreenVisibilityListener} from 'react-native-navigation';
import { crashlyticsLog } from '.';


export class ScreenVisibilityListener {
  listener: RNNScreenVisibilityListener;

  constructor() {
    this.listener = new RNNScreenVisibilityListener({
      didAppear: ({screen, startTime, endTime, commandType}: any) => {
        // console.log('screenVisibility', `Screen ${screen} displayed in ${endTime - startTime} millis after [${commandType}]`);
        crashlyticsLog(`screenVisibility: Screen ${screen} displayed in ${endTime - startTime} millis after [${commandType}]`);
      }
    });
  }

  register() {
    this.listener.register();
  }

  unregister() {
    if (this.listener) {
      this.listener.unregister();
      this.listener = null;
    }
  }
}