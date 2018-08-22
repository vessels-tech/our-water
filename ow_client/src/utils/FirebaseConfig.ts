/**
 * FirebaseConfig is a wrapper around the firebase config
 * which allows us an entrypoint and testable firebase config
 */
import firebase from 'react-native-firebase';
import Config from 'react-native-config';
const config = firebase.config();

export class FirebaseConfig {

  static getAllConfig() {
    return config.fetch(parseInt(Config.REACT_APP_REMOTE_CONFIG_TIMEOUT))
    // return config.fetch(10)
      .then(() => config.activateFetched())
      .then(() => config.getKeysByPrefix())
      .then(allKeys => allKeys.map((key: String) => key.toString()))
      .then((allKeys: Array<string>) => config.getValues(allKeys))
      .then(obj => {
        //TODO: make this a custom FB type
        const data: any = {};
        Object.keys(obj).forEach(key => {
          data[key] = obj[key].val();
        });

        return data;
      });
  }

  // static getValue(key) {
  //   //TODO: get the value for the key...
  // }
}