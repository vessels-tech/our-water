import { Alert } from 'react-native';
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
    console.warn("Found more than 1 resource for coords. returning just the first");
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

export {
  appendUrlParameters,
  getHashForReading,
  rejectRequestWithError,
  showAlert,
  formatCoords,
  pinColorForResourceType,
  getLocation,
  getSelectedResourceFromCoords,
  navigateTo
};
