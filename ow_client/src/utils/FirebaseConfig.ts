/**
 * FirebaseConfig is a wrapper around the firebase config
 * which allows us an entrypoint and testable firebase config
 */
import firebase from 'react-native-firebase';
import Config from 'react-native-config';
import { RemoteConfig } from './ConfigFactory';
const config = firebase.config();

export class FirebaseConfig {

  static getAllConfig() {
    return config.fetch(parseInt(Config.REACT_APP_REMOTE_CONFIG_TIMEOUT))
    // return config.fetch(10)
      .then(() => config.activateFetched())
      .then(() => config.getKeysByPrefix())
      .then(allKeys => allKeys.map((key: String) => key.toString()))
      .then((allKeys: Array<string>) => config.getValues(allKeys))
      .then((obj: any) => {

        const remoteConfig: RemoteConfig = {
          applicationName: obj.applicationName.val(),
          baseApiType: obj.baseApiType.val(),
          connectToButtonText: obj.connectToButtonText.val(),
          firebaseBaseUrl: obj.firebaseBaseUrl.val(),
          ggmnBaseUrl: obj.ggmnBaseUrl.val(),
          showConnectToButton: obj.showConnectToButton.val(),
          mywellBaseUrl: obj.mywellBaseUrl.val(),
          map_shouldLoadAllResources: obj.map_shouldLoadAllResources.val(),
        }
        return remoteConfig;
      });
  }

  // static getValue(key) {
  //   //TODO: get the value for the key...
  // }
}