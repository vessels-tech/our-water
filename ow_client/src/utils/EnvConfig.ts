
import Config from 'react-native-config';


function getBoolean(value: any) {
  switch (value) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return true;
    default:
      return false;
  }
}


// export const EnableLogging = getBoolean(Config.ENABLE_LOGGING);
export const EnableLogging = true;