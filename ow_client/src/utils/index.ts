import { Alert } from 'react-native';
import moment from 'moment';
import QueryString from 'query-string';
import { textDark, bgDark2, bgLight } from './Colors';
import { Location } from '../typings/Location';



/**
 * Parse the response from Fetch api, and handle errors etc.
 */
export function parseFetchResponse<T>(response: any): Promise<T> {
  if (!response.ok) {
    return rejectRequestWithError(response.status);
  }

  return response.json();
}

/**
 * Get a unique hash based on the resourceId, pincode, and date
 */
/* tslint:disable-next-line */
const getHashForReading = (reading: any) => {
  return `r:${reading.date}|${reading.resourceId}|${reading.pincode}`;
}

const rejectRequestWithError = (status: number) => {
  const error: any = new Error(`Request failed with status ${status}`);
  error['status'] = status;
  return Promise.reject(error);
}

const showAlert = (title: string, message: string) => {
  Alert.alert(title, message,
    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
    { cancelable: false }
  );
}

const appendUrlParameters = (url: string, qs: any) => {
  return `${url}?${QueryString.stringify(qs)}`;
}

const formatCoords = (fbCoords: any) => {
  return {
    latitude: fbCoords._latitude,
    longitude: fbCoords._longitude,
  };
}

const getLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    return navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 5000});
  });
}

const pinColorForResourceType = (resourceType: any) => {

  switch(resourceType) {
    case 'well':
      return "#2CCCE4";
    case 'raingauge':
      return "#37D67A";
    case 'checkdam':
      return "#FF6767";
  }
}

const getSelectedResourceFromCoords = (resources: any, coords: any) => {
  const filtered = resources.filter((res: any) => {
    return coords.latitude === res.coords._latitude && 
      coords.longitude === res.coords._longitude;
  });

  if (filtered.length === 0) {
    console.warn("Could not find any resource at coords");
    return null;
  }

  if (filtered.length > 1) {
    console.warn("Found more than 1 resource for coords. returning just the first");
  }

  return filtered[0];
}

const navigateTo = (props: any, screen: any, title: any, passProps: any) => {
  //TODO: only navigate if we aren't already here!

  props.navigator.toggleDrawer({
    side: 'left', // the side of the drawer since you can have two, 'left' / 'right'
    animated: true, // does the toggle have transition animation or does it happen immediately (optional)
    to: 'closed' // optional, 'open' = open the drawer, 'closed' = close it, missing = the opposite of current state
  });

  props.navigator.push({
    screen,
    title,
    passProps,
    navigatorStyle: defaultNavigatorStyle,
    navigatorButtons: {}, // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
    animationType: 'slide-horizontal'
  });
}

const getMinAndMaxReadingDates = (momentFormat: string) => {
  const today = moment();
  const twoWeeksAgo = moment().subtract(14, 'days');

  return {
    minDate: twoWeeksAgo.format(momentFormat),
    maxDate: today.format(momentFormat),
  }
}

const displayAlert = (title: string, message: string, buttons: any) => {

  Alert.alert(title, message, buttons,
    { cancelable: false }
  );
}

/**
 * Create a bounding box from lat, lng and distance multiplier
 * distance must be a float between 0-1
 * @param {*} param0 
 */
const boundingBoxForCoords = (latitude: number, longitude: number , distance: number) => {
  if (distance < 0 || distance > 1) {
    throw new Error("Distance must be a float between 0 and 1");
  }

  const distanceMultiplier = 100; //TODO: tune this value based on the queries we are getting back once we can see it a map
  const minLat = latitude - distanceMultiplier * distance;
  const minLng = longitude - distanceMultiplier * distance;
  const maxLat = latitude + distanceMultiplier * distance;
  const maxLng = longitude + distanceMultiplier * distance;

  return {
    minLat, minLng, maxLat, maxLng
  };
}

const prettyColors = [
  "#d1c4e9",
  "#e1bee7",
  "#c5cae9",
  "#b2dfdb",
  "#c8e6c9",
  "#dcedc8",
  "#f0f4c3",
  "#fff9c4",
];

const randomPrettyColorForId = (resourceId: string) => {
  const idNumber = Math.abs(hashCode(resourceId))
  const index = (idNumber % prettyColors.length);

  return prettyColors[index];
}

const hashCode = (str: string) => {
  var hash = 0;
  if (str.length === 0) return hash;
  let i: number;
  for (i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

const getShortId = (str: string) => {
  return Math.abs(hashCode(str));
}

const defaultNavigatorStyle = {
  navBarHidden: false,
  navBarTextColor: textDark, // change the text color of the title (remembered across pushes)
  navBarBackgroundColor: bgLight,
  statusBarColor: bgLight,
  statusBarTextColorScheme: 'dark',
  screenBackgroundColor: bgLight,
  //Bottom nav bar, android only
  navigationBarColor: bgDark2,
}

export {
  appendUrlParameters,
  defaultNavigatorStyle,
  getHashForReading,
  rejectRequestWithError,
  showAlert,
  formatCoords,
  pinColorForResourceType,
  getLocation,
  getSelectedResourceFromCoords,
  navigateTo,
  getMinAndMaxReadingDates,
  displayAlert,
  boundingBoxForCoords,
  randomPrettyColorForId,
  getShortId,
};
