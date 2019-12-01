/**
 * Set up Crashlytics to get js errors.
 * 
 * Reference: https://github.com/invertase/react-native-firebase/issues/1052#issuecomment-419963115
 */

//@ts-ignore
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import firebase from 'react-native-firebase'


console.log("Setting up crashlytics");

const crashlytics = firebase.crashlytics();

function errorHandler(error: Error, isFatal: boolean) {
  console.log('Caught Exception', error);

  if (error instanceof Error) {
    crashlytics.log(`${error.stack}`);
    crashlytics.log(`${error.message}`);
    crashlytics.setStringValue('stack', `${error.stack}`)
    crashlytics.recordError(0, `RN Fatal: ${error.message}`)
  } else {
    crashlytics.recordError(0, `RN Fatal: ${error}`)
    crashlytics.log(`${error}`);
  }
}

setJSExceptionHandler(errorHandler, true);
setNativeExceptionHandler(errorHandler, false, true);


/* global global */
// const defaultHandler = ErrorUtils.getGlobalHandler()
// const crashlytics = firebase.crashlytics()

// console.log("Setting up global error handlers");

// ErrorUtils.setGlobalHandler((...args) => {
//   const error = args[0] || 'Unknown'
//   console.log('Crashlytics error sent', error);

//   if (error instanceof Error) {
//     crashlytics.setStringValue('stack', `${error.stack}`)
//     crashlytics.recordError(0, `RN Fatal: ${error.message}`)
//   } else {
//     // Have never gotten this log so far. Might not be necessary.
//     crashlytics.recordError(0, `RN Fatal: ${error}`)
//   }

//   defaultHandler.apply(this, args);
// });