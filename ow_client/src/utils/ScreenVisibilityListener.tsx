//@ts-ignore
import { Navigation } from 'react-native-navigation';
import { crashlyticsLog } from '.';


export class ScreenVisibilityListener {
  listener: any;

  constructor() {
    // const screenEventListener = Navigation.events().registerComponentDidAppearListener(({ componentId, componentName, passProps }) => {

    // });
    // this.listener = new RNNScreenVisibilityListener({
    //   didAppear: ({screen, startTime, endTime, commandType}: any) => {
    //     crashlyticsLog(`screenVisibility: Screen ${screen} displayed in ${endTime - startTime} millis after [${commandType}]`);
    //   }
    // });
  }

  register() {
    if (this.listener){
    this.listener.register();}
  }

  unregister() {
    if (this.listener) {
      this.listener.unregister();
      this.listener = null;
    }
  }
}