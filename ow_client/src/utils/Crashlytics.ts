/**
 * Set up Crashlytics to get js errors.
 * 
 * Reference: https://github.com/invertase/react-native-firebase/issues/1052#issuecomment-419963115
 */

import firebase from 'react-native-firebase'

/* global global */
//@ts-ignore
const defaultHandler = global.ErrorUtils.getGlobalHandler()
const crashlytics = firebase.crashlytics()

//@ts-ignore
global.ErrorUtils.setGlobalHandler((...args) => {
  const error = args[0] || 'Unknown'
  console.log('Crashlytics error sent', error);

  if (error instanceof Error) {
    crashlytics.setStringValue('stack', `${error.stack}`)
    crashlytics.recordError(0, `RN Fatal: ${error.message}`)
  } else {
    // Have never gotten this log so far. Might not be necessary.
    crashlytics.recordError(0, `RN Fatal: ${error}`)
  }

  defaultHandler.apply(this, args);
});