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
      .then(allKeys => config.getValues(allKeys))
      .then(obj => {
        const data = {};
        Object.keys(obj).forEach(key => {
          data[key] = obj[key].val();
        });

        return data;
      });
  }

  static getValue(key) {
    //TODO: get the value for the key...
  }
}