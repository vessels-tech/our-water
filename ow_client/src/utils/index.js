import { Alert } from 'react-native';
import moment from 'moment';
import QueryString from 'query-string';



/**
 * Get a unique hash based on the resourceId, pincode, and date
 */
const getHashForReading = (reading) => {
  return `r:${reading.date}|${reading.resourceId}|${reading.pincode}`;
}

const rejectRequestWithError = (status) => {
  const error = new Error(`Request failed with status ${status}`);
  error.status = status;
  return Promise.reject(error);
}

const showAlert = (title, message) => {
  Alert.alert(title, message,
    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
    { cancelable: false }
  );
}

const appendUrlParameters = (url, qs) => {
  return `${url}?${QueryString.stringify(qs)}`;
}

const formatCoords = (fbCoords) => {
  return {
    latitude: fbCoords._latitude,
    longitude: fbCoords._longitude,
  };
}

const getLocation = () => {
  console.log(navigator.geolocation);

  return new Promise((resolve, reject) => {
    return navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 5000});
  });
}

const pinColorForResourceType = (resourceType) => {

  switch(resourceType) {
    case 'well':
      return "#2CCCE4";
    case 'raingauge':
      return "#37D67A";
    case 'checkdam':
      return "#FF6767";
  }
}

const getSelectedResourceFromCoords = (resources, coords) => {
  const filtered = resources.filter(res => {
    return coords.latitude === res.coords._latitude && 
      coords.longitude === res.coords._longitude;
  });

  if (filtered.length === 0) {
    console.warn("Could not find any resource at coords");
    return null;
  }

  if (filtered.length > 1) {
    console.log("Found more than 1 resource for coords. returning just the first");
  }

  return filtered[0];
}

const navigateTo = (props, screen, title, passProps) => {
  props.navigator.push({
    screen,
    title,
    passProps,
    navigatorStyle: {}, // override the navigator style for the screen, see "Styling the navigator" below (optional)
    navigatorButtons: {}, // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
    animationType: 'slide-horizontal'
  });
}

const getMinAndMaxReadingDates = (momentFormat) => {
  const today = moment();
  const twoWeeksAgo = moment().subtract(14, 'days');

  return {
    minDate: twoWeeksAgo.format(momentFormat),
    maxDate: today.format(momentFormat),
  }
}

const displayAlert = ({title, message, buttons}) => {

  Alert.alert(title, message, buttons,
    { cancelable: false }
  );
}

/**
 * Create a bounding box from lat, lng and distance multiplier
 * distance must be a float between 0-1
 * @param {*} param0 
 */
const boundingBoxForCoords = ({latitude, longitude, distance}) => {
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
  "#FF6767",
  "#8AD7B4",
  "#F5A623",
  "#B8E986",
];

const randomPrettyColorForId = (resourceId) => {
  const idNumber = Math.abs(hashCode(resourceId))
  const index = idNumber % prettyColors.length - 1;

  return prettyColors[index];
}

const hashCode = (str) => {
  var hash = 0;
  if (str.length == 0) return hash;
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

const getShortId = (str) => {
  return Math.abs(hashCode(str));
}

export {
  appendUrlParameters,
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
