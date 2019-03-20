import { Alert, Linking, ToastAndroid } from 'react-native';
import * as React from 'react';
import * as moment from 'moment';
import { stringify } from 'query-string';
// import { bgLight, primaryLight, primaryText, primaryDark, primary, prettyColors } from './Colors';
import { Location, LocationType } from '../typings/Location';
import { BasicCoords, TimeseriesRange, Reading, TimeseriesRangeReadings, OWGeoPoint } from '../typings/models/OurWater';
import { ResourceType } from '../enums';
import { Region } from 'react-native-maps';
import { Avatar } from 'react-native-elements';
import { SomeResult, ResultType, makeError, makeSuccess } from '../typings/AppProviderTypes';
import { EnableLogging, EnableRenderLogging } from './EnvConfig';
import { AnyResource } from '../typings/models/Resource';
import { AnyReading } from '../typings/models/Reading';
import { PendingReading } from '../typings/models/PendingReading';
import { PendingResource } from '../typings/models/PendingResource';
import { AbstractControl } from 'react-reactive-form';
import * as PhoneNumber from 'awesome-phonenumber';
import { MaybeUser, UserType } from '../typings/UserTypes';
import { CacheType, AnyOrPendingReading } from '../reducers';
import { prettyColors, primaryText, primary, surface, surfaceDark, secondary, secondaryLight, primaryLight, statusBarTextColorScheme, statusBarColor, navBarTextColor, secondaryPallette } from './NewColors';
//@ts-ignore
import * as QRCode from 'qrcode';
import { OrgType } from '../typings/models/OrgType';
import { ConfigFactory } from '../config/ConfigFactory';
import firebase from 'react-native-firebase'




/**
 * Convert a region to a bounding box
 * 
 * @returns array, region tuple: [
 *  min Longitude,
 *  min Latitude,
 *  max Longitude,
 *  max Latitude
 * ]
 */
export function calculateBBox(region: Region){
  return [
    region.longitude - region.longitudeDelta/2, // westLng - min lng
    region.latitude - region.latitudeDelta/2, // southLat - min lat
    region.longitude + region.longitudeDelta/2, // eastLng - max lng
    region.latitude + region.latitudeDelta/2// northLat - max lat
  ];
}

/**
 * Naively Parse the response from Fetch api, and handle errors etc.
 * Use this for small requests with well formed responses. Otherwise you 
 * may have to do it manually.
 */
export function deprecated_naiveParseFetchResponse<T>(response: any): Promise<T> {
  if (!response.ok) {
    return rejectRequestWithError(response.status);
  }

  return response.json();
}

export async function naiveParseFetchResponse<T>(response: any): Promise<SomeResult<T>> {
  if (!response.ok) {
    return {
      type: ResultType.ERROR,
      message: 'Network request failed',
    };
  }

  let parsed: T;
  try {
    parsed = await response.json();
  } catch (err) {
    return {
      type: ResultType.ERROR,
      message: 'Error deserializing json from response.',
    }
  }

  return {
    type: ResultType.SUCCESS,
    result: parsed,
  };
}



/**
 * Get the image based on the resource type
 */
export function imageForResourceType(type: ResourceType) {
  switch (type) {
    case ResourceType.checkdam:
      return require('../assets/checkdam_pin.png');
    case ResourceType.raingauge:
      return require('../assets/raingauge_pin.png');
    case ResourceType.well:
      return require('../assets/well_pin.png');
    case ResourceType.custom:
      return require('../assets/other_pin.png')
  }
}

/**
 * Get a unique hash based on the resourceId, pincode, and date
 */
/* tslint:disable-next-line */
export const getHashForReading = (reading: any) => {
  return `r:${reading.date}|${reading.resourceId}|${reading.pincode}`;
}

export const rejectRequestWithError = (status: number) => {
  const error: any = new Error(`Request failed with status ${status}`);
  error['status'] = status;
  return Promise.reject(error);
}

export const showAlert = (title: string, message: string) => {
  Alert.alert(title, message,
    [{ text: 'OK'}],
    { cancelable: false }
  );
}

export const appendUrlParameters = (url: string, qs: any) => {
  if (Object.keys(qs).length === 0) {
    return url;
  }
  return `${url}?${stringify(qs)}`;
}

export const formatCoords = (fbCoords: any) => {
  return {
    latitude: fbCoords._latitude,
    longitude: fbCoords._longitude,
  };
}


/**
 * getLocation
 * 
 * Get's the location or times out.
 * 
 * TD: For some reason, when the user denies location access getCurrentPosition()
 * never returns. So we implement our own timeout using Promise.race()
 */
export const getLocation = (): Promise<SomeResult<Location>> => {
  const timeoutMs = 5000;
  const timeoutPromise = new Promise<SomeResult<Location>>((resolve, reject) => {
    setTimeout(() => {
      resolve(makeError<Location>("Request timed out."));
    }, timeoutMs)
  });

  const getLocationPromise = new Promise<SomeResult<Location>>((resolve, reject) => {
    return navigator.geolocation.getCurrentPosition(
      (p: Position) => {
        const location: Location = {
          type: LocationType.LOCATION,
          coords: p.coords,
        }
        resolve(makeSuccess(location));
      },
      (err: any) => {
        maybeLog("Error loading location", err);
        return resolve(makeError('Error loading location.'));
      },
      {timeout: 5000}
    );
  });

  return Promise.race([
    getLocationPromise,
    timeoutPromise,
  ]);
}

export const pinColorForResourceType = (resourceType: any) => {
  switch(resourceType) {
    case 'well':
      return "#2CCCE4";
    case 'raingauge':
      return "#37D67A";
    case 'checkdam':
      return "#FF6767";
  }
}

export const getSelectedResourceFromCoords = (resources: AnyResource[], coords: BasicCoords): AnyResource | null => {
  const filtered = resources.filter((res: any) => {
    return coords.latitude === res.coords._latitude && 
      coords.longitude === res.coords._longitude;
  });

  if (filtered.length === 0) {
    maybeLog("Could not find any resource at coords");
    return null;
  }

  if (filtered.length > 1) {
    maybeLog("Found more than 1 resource for coords. returning just the first");
  }

  return filtered[0];
}

export const getSelectedPendingResourceFromCoords = (resources: PendingResource[], coords: BasicCoords): PendingResource | null => {
  const filtered = resources.filter((res: PendingResource) => {
    return coords.latitude === res.coords.latitude && 
      coords.longitude === res.coords.longitude;
  });

  if (filtered.length === 0) {
    maybeLog("Could not find any resource at coords");
    return null;
  }

  if (filtered.length > 1) {
    maybeLog("Found more than 1 resource for coords. returning just the first");
  }

  return filtered[0];
}

export const navigateTo = (props: any, screen: any, title: any, passProps: any, animationType = 'slide-horizontal') => {
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
    animationType
  });
}

export const showModal = (props: any, screen: any, title: any, passProps: any) => {
  //TODO: only navigate if we aren't already here!

  props.navigator.toggleDrawer({
    side: 'left', // the side of the drawer since you can have two, 'left' / 'right'
    animated: true, // does the toggle have transition animation or does it happen immediately (optional)
    to: 'closed' // optional, 'open' = open the drawer, 'closed' = close it, missing = the opposite of current state
  });

  // TODO: change left arrow to just x
  props.navigator.showModal({
    screen,
    title,
    passProps,
    navigatorStyle: defaultNavigatorStyle,
  });
}

export const showLighbox = (props: any, screen: any, passProps: any) => {

  props.navigator.showLightBox({
    screen,
    passProps,
    style: {
      backgroundBlur: 'dark', // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
      // backgroundColor: '#ff000080', // tint color for the background, you can specify alpha here (optional)
      tapBackgroundToDismiss: true // dismisses LightBox on background taps (optional)
    }
  });
}

export const getMinAndMaxReadingDates = (momentFormat: string): {minDate: string, maxDate: string} => {
  const today = moment();
  const twoWeeksAgo = moment().subtract(14, 'days');

  return {
    minDate: twoWeeksAgo.format(momentFormat),
    maxDate: today.format(momentFormat),
  }
}

export const displayAlert = (title: string, message: string, buttons: any) => {
  Alert.alert(title, message, buttons,
    { cancelable: false }
  );
}

/**
 * Create a bounding box from lat, lng and distance multiplier
 * distance must be a float between 0-1
 * @param {*} param0 
 */
export const boundingBoxForCoords = (latitude: number, longitude: number , distance: number) => {
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


export const randomPrettyColorForId = (resourceId: string) => {
  const idNumber = Math.abs(hashCode(resourceId))
  const index = (idNumber % prettyColors.length);

  return prettyColors[index];
}

export  const hashCode = (str: string) => {
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

/**
 * Get the short id.
 * This will have to account for different coding schemes
 */
export const getShortId = (str: string): string => {
  // return Math.abs(hashCode(str));
  return str;
}

export const defaultNavigatorStyle = {
  navBarHidden: false,
  navBarTextColor: primaryText.high,
  navBarBackgroundColor: primary,

  statusBarColor: statusBarColor,
  statusBarTextColorScheme: statusBarTextColorScheme,
  
  screenBackgroundColor: surface,
  navBarButtonColor: primaryText.high,
  drawUnderStatusBar: false,
}

export function getGroundwaterAvatar(title?: string) {
  return (
    <Avatar
      containerStyle={{
        backgroundColor: secondaryLight,
        alignSelf: 'center',
      }}
      rounded={true}
      // size="large"
      title={title || "GW"}
      activeOpacity={0.7}
    />
  );
}

export function getReadingAvatar() {
  return (
    <Avatar
      containerStyle={{
        backgroundColor: primaryLight,
        alignSelf: 'center',
      }}
      rounded={true}
      title="R"
      activeOpacity={0.7}
    />
  );
}

export function getPlaceAvatar() {
  return (
    <Avatar
      containerStyle={{
        backgroundColor: primaryLight,
        alignSelf: 'center',
      }}
      rounded={true}
      title="P"
      activeOpacity={0.7}
    />
  );
}

/**
   * Iterate through favourite resources, and find out
   * if this is in the list
   */
export function isFavourite(favouriteResources: AnyResource[], resourceId: string) {
  const ids = favouriteResources.map(r => r.id);
  if (ids.indexOf(resourceId) > -1) {
    return true;
  }

  return false;
}

/**
 * Convert a TimeseriesRange into unix typestamp start and end dates
 */
export function convertRangeToDates(range: TimeseriesRange): { startDate: number, endDate: number } {
  let startDate: number;
  switch (range) {
    case TimeseriesRange.TWO_WEEKS: {
      startDate = moment().subtract(2, 'weeks').valueOf()
      break;
    }
    case TimeseriesRange.THREE_MONTHS: {
      startDate = moment().subtract(3, 'months').valueOf()
      break;
    }
    case TimeseriesRange.ONE_YEAR: {
      startDate = moment().subtract(1, 'year').valueOf()
      break;
    }
    case TimeseriesRange.EXTENT:
    default: {
      //This may not really be the extend, but we have to start somewhere.
      startDate = moment().subtract(10, 'years').valueOf();
    }
  }

  return {
    startDate,
    endDate: moment().valueOf(),
  }
}


/**
 * Initialize an empty Timeseries range reading
 */
export function newTsRangeReadings(): TimeseriesRangeReadings {
  return {
    ONE_YEAR: { meta: { loading: false }, readings: [] },
    THREE_MONTHS: { meta: { loading: false }, readings: [] },
    TWO_WEEKS: { meta: { loading: false }, readings: [] },
    EXTENT: { meta: { loading: false }, readings: [] },
  }
}

/**
 * Helper function to modify deeply nested data inside the metadata for a 
 * timeseries range reading
 */
export function setLoading(timeseriesReadings: CacheType<TimeseriesRangeReadings>, timeseriesId: string, range: TimeseriesRange, loading: boolean) {
  //Set the appropriate meta to loading for the timeseries and timerange
  let tsRangeReadings = timeseriesReadings[timeseriesId];
  if (!tsRangeReadings) {
    tsRangeReadings = newTsRangeReadings();
  }
  const readingsForRange = tsRangeReadings[range];
  readingsForRange.meta = { loading };

  tsRangeReadings[range] = readingsForRange;
  timeseriesReadings[timeseriesId] = tsRangeReadings;

  return timeseriesReadings;
}

export function addReadingsAndStopLoading(readings: AnyReading[], timeseriesReadings: CacheType<TimeseriesRangeReadings>, timeseriesId: string, range: TimeseriesRange) {
  //Set the appropriate meta to loading for the timeseries and timerange
  let tsRangeReadings = timeseriesReadings[timeseriesId];
  if (!tsRangeReadings) {
    tsRangeReadings = newTsRangeReadings();
  }
  const readingsForRange = tsRangeReadings[range];
  readingsForRange.meta = { loading: false };
  readingsForRange.readings = readings,

  tsRangeReadings[range] = readingsForRange;
  timeseriesReadings[timeseriesId] = tsRangeReadings;

  return timeseriesReadings;
}


export function deprecatedGetTimeseriesReadingKey(timeseriesId: string, range: TimeseriesRange): string {
  return `${timeseriesId}+${range}`;
}

export function getTimeseriesReadingKey(resourceId: string, timeseriesName: string, range: TimeseriesRange): string {
  return `${resourceId}+${timeseriesName}+${range}`;
}

/**
 * A simple throttle function
 * @param delay delay time in ms
 * @param cb the original function
 */
export function throttled(delay: number, cb: any) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return cb(...args);
  }
}

// ES6
export function debounced(delay: number, fn: any): any {
  let timerId: any;
  return function (...args: any[]) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  }
}


export function getBoolean(value: any) {
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

export function maybeLog(message: any, object?: any) {
  if (EnableLogging) {
    if (object) {
      console.log(message, object);
      return;
    }
    console.log(message);
  }
}

export function renderLog(message: any, object?: any) {
  if (EnableRenderLogging) {
    if (object) {
      console.log(message, object);
      return;
    }
    console.log(message);
  }
}



export function mergePendingAndSavedReadingsAndSort(pendingReadings: PendingReading[], readings: AnyReading[]): { dateString: string, value: number }[] {
  /* merge together readings, sorted by the creation date */
  const allReadings: { dateString: string, value: number }[] = pendingReadings
    .map(r => ({ dateString: r.date, value: r.value }))
    .concat(readings.map(r => ({ dateString: r.date, value: r.value })));
  allReadings.sort((a, b) => {
    if (a.dateString > b.dateString) {
      return 1;
    }

    if (a.dateString < b.dateString) {
      return -1;
    }

    return 0;
  });

  return allReadings;
}

/**
 * Format a 9 digit shortId to a 9 or dix digit version with dashes
 */
export function formatShortId(shortId: string): SomeResult<string> {
  if (!shortId) {
    return makeError('ShortId is null or undefined');
  }

  if (shortId.length !== 9) {
    return makeError('ShortId must be 9 digits long.');
  }

  const parts = shortId.match(/.{1,3}/g);
  if (!parts || parts.length !== 3) {
    return makeError("String had wrong format");
  }

  if (parts[0] === '000') {
    return makeSuccess(`${parts[1]}-${parts[2]}`);
  }

  return makeSuccess(`${parts[0]}-${parts[1]}-${parts[2]}`);
}

export function formatShortIdOrElse(shortId: string, dflt: string): string {
  if (!shortId) {
    return dflt;
  }

  if (shortId.length !== 9) {
    return dflt;
  }

  const parts = shortId.match(/.{1,3}/g);
  if (!parts || parts.length !== 3) {
    return dflt;
  }

  if (parts[0] === '000') {
    return `${parts[1]}-${parts[2]}`;
  }

  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}


export function getShortIdOrFallback(id: string, cache: CacheType<string>, fallback?: string): string {
  let title = fallback || id;
  if (cache[id]) {
    const maybeShortId = cache[id];
    if (!maybeShortId) {
      return title;
    }

    const titleResult = formatShortId(maybeShortId);
    if (titleResult.type === ResultType.ERROR) {
      return title;
    }

    title = titleResult.result;
  }

  return title;
}


export function phoneNumberValidator(control: AbstractControl) {
  //@ts-ignore
  const pn = new PhoneNumber(control.value);
  if (pn.isValid()){
    return Promise.resolve(null);
  }

  return Promise.resolve({ invalidPhoneNumber: true });
}

export function unwrapUserId(user: MaybeUser) {
  if (user.type === UserType.NO_USER) {
    return '';
  }

  return user.userId;
}

export function splitInternationalNumber(intNumber: string): SomeResult<{regionCode: string, prefix: string, mobile: string}> {
  //@ts-ignore
  const pn = new PhoneNumber(intNumber);
  if (!pn.isValid()) {
    return makeError<{ regionCode: string, prefix: string, mobile: string }>('Number is not valid');
  }

  return makeSuccess({
    regionCode: pn.getRegionCode(),
    prefix: `+${PhoneNumber.getCountryCodeForRegionCode(pn.getRegionCode())}`,
    mobile: pn.getNumber('significant'),
  });
}


/**
 * filterAndSort
 * 
 * Filter the array by the given date range
 */
export function filterAndSort(readings: AnyOrPendingReading[], range: TimeseriesRange ): AnyOrPendingReading[] {
  const { startDate, endDate } = convertRangeToDates(range);

  return readings
    .filter(r => moment(r.date).isBetween(moment(startDate), moment(endDate)))
    .sort((a, b) => {
      if (a.date > b.date) {
        return 1;
      }
      if (a.date < b.date) {
        return -1;
      }

      return 0;
    });
}


//
// Array Utils
// TODO: make into library
//------------------------------------------------------------------------------------------

/**
 * Deduplicate an array of items based on an accessor.
 * 
 * Note: This doesn't appear to preserve order.
 * @returns Array<T> - the modified array
 */
export function dedupArray<T>(array: Array<T>, accessor: (any: T) => string): Array<T> {
  const dedup: CacheType<T> = {};
  array.forEach(r => {
    const id = accessor(r);
    dedup[id] = r;
  });
  return Object.keys(dedup).map(k => dedup[k]);
}


/**
 * Deduplicate an array of items based on an accessor while preserving the order
 * of the elements. It removes the Earlier instances, not later.
 *
 * @returns Array<T> - the modified array
 */
export function dedupArrayPreserveOrder<T>(array: Array<T>, accessor: (any: T) => string): Array<T> {
  const idMap: CacheType<T> = {};
  array.forEach(r => {
    const id = accessor(r);
    idMap[id] = r;
  });

  //First map the array to a list of ids only
  const dupIds = array.map(accessor);

  //Reverse the order of dupIds to keep right-most-items
  const revDupIds = dupIds.reverse()

  //Dedup the Ids (this works from the left only)
  const uniqueArray = revDupIds.filter((id, pos) => revDupIds.indexOf(id) === pos);

  //Map from ids back to array, with left-most duplicates removed
  return uniqueArray.map(id => idMap[id]);
}


/**
 * Split an array of things up based on a given accessor
 */
export function splitArray<T>(original: Array<T>, accessor: (item: T) => string): Array<Array<T>> {
  const keys = dedupArray(original.map(accessor), (k) => k);
  return keys.map(k => original.filter(item => accessor(item) === k));
}

/**
 * Group an array into lists inside a dict.
 * Similar to splitArray, but returns a dict containing the key instead,
 */
export function groupArray<T>(original: Array<T>, accessor: (item: T) => string): CacheType<Array<T>> {
  const dict: CacheType<Array<T>> = {}
  const keys = dedupArray(original.map(accessor), (k) => k);
  keys.forEach(k => {
    dict[k] = original.filter(item => accessor(item) === k);
  });

  return dict;
}

/**
 * Get the highest value from an array
 */
export function arrayHighest<T>(array: Array<T>, accessor: (item: T) => string | number): T {
  return array.reduce((acc, curr) => {
    if (accessor(curr) >= accessor(acc)) {
      return curr;
    }
    return acc;
  }, array[0]);
}

/**
 * Get the highest value from an array
 */
export function arrayLowest<T>(array: Array<T>, accessor: (item: T) => string | number): T {
  return array.reduce((acc, curr) => {
    if (accessor(curr) <= accessor(acc)) {
      return curr;
    }
    return acc;
  }, array[0]);
}

/**
 * Expire earlier elements from array. 
 * This requires array to be FIFO, where new elements are added
 * to the end of the array
 */
export function arrayExpire<T>(array: Array<T>, maxElements: number): Array<T> {
  if (array.length <= maxElements) {
    return array;
  }

  const overCount = array.length - maxElements;
  array.splice(0, overCount);
  return array;
}

/**
 * Expire earlier elements from array.
 * If elements are in the safe region, then we don't expire them.
 * 
 * @param maxElements - approx number of elements we want. Result may be over this number if there are too many
 *   resources in the safeArea
 */
export function arrayExpireRegionAware(array: Array<AnyResource>, maxElements: number, safeArea: Region): Array<AnyResource> {
  if (array.length <= maxElements) {
    return array;
  }

  //Make a list of safe resources:
  const safeResources: AnyResource[] = [];
  array.forEach(r => {
    if (isInRegion(safeArea, r.coords)) {
      safeResources.push(r);
    }
  });

  //delete anything over
  const initialDeleted = arrayExpire(array, maxElements);
  //add back safe resources
  const duplicateArray = initialDeleted.concat(safeResources);
  //Deduplicate
  const deduped = dedupArrayPreserveOrder(duplicateArray, (r) => r.id);
  return deduped;
}


/**
 * Calculates whether or not a given coordinate is in a given region.
 * @param region 
 * @param coords 
 */
export function isInRegion(region: Region, coords: OWGeoPoint) {
  const boundingBox = calculateBBox(region);
  if (coords._latitude < boundingBox[1]) {
    return false;
  }

  if (coords._latitude > boundingBox[3]) {
    return false;
  }

  if (coords._longitude < boundingBox[0]) {
    return false;
  }

  if (coords._longitude > boundingBox[2]) {
    return false;
  }

  return true;
}

export function getMarkerKey(resource: AnyResource | PendingResource) {
  if (resource.pending) {
    return `pending_${resource.id}`
  }

  return `any_${resource.id}`;
}


export function pinColorForOrgAndResource(resource: AnyResource) {
  if (resource.type === OrgType.GGMN) {
    return secondary;
  }

  switch(resource.resourceType) {
    case ResourceType.checkdam:
      return 'yellow';
    case ResourceType.custom:
    case ResourceType.quality:
      return 'grey';
    case ResourceType.raingauge:
      return 'navy';
    case ResourceType.well:
    default:
      return 'orange';

  }
}

/**
 * safeAreaFromPoint
 * 
 * Given a point, calculate an implicit safe area by adding a generous delta.
 */
export function safeAreaFromPoint(coords: OWGeoPoint): Region {

  return {
    latitude: coords._latitude,
    longitude: coords._longitude,
    latitudeDelta: 15,
    longitudeDelta: 10,
  }
}

/**
 * Saftely get things and check if null
 * 
 * @example:
 *   const userId = get(req, ['user', 'uid']);
 */
export const get = (o: any, p: string[]) =>
  p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o);


/**
* getHeadingForTimeseries
* 
* Convert the "default" string to sometime meaningful
* 
* TODO: move to a translation function
*/
export const getHeadingForTimeseries = (resourceType: ResourceType, name: string) => {

  switch (resourceType) {
    case ResourceType.raingauge: return "Rainfall";
    case ResourceType.quality: {
      return capitalizeFirstLetter(name);
    }
    case ResourceType.custom: {
      return capitalizeFirstLetter(name);
    }
    case ResourceType.checkdam:
    case ResourceType.well:
    default: {
      return "Groundwater"
    }
  }
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


/**
 * Attempt to open a url or display an error message
 */
export function openUrlOrToastError(url: string, errorMessage: string) {
  Linking.canOpenURL(url)
    .then(supported => {
      if (!supported) {
        return makeError<void>(errorMessage);
      }
      return makeSuccess<void>(undefined);
    })
    .catch(err => makeError<void>(errorMessage))
    .then(result => {
      if (result.type === ResultType.ERROR) {
        ToastAndroid.show(result.message, ToastAndroid.SHORT);
        return;
      }

      Linking.openURL(url);
    });
}


/**
 * getUnitSuffixForPendingResource
 * 
 * For a pending resource, get the unit suffix.
 * If anything goes wrong, defaults to 'm'
 */
export function getUnitSuffixForPendingResource(r: PendingReading, config: ConfigFactory) {

  if (!r.timeseriesId || !r.resourceType) {
    return "m";
  }

  const defaultTimeseriesList = config.getDefaultTimeseries(r.resourceType);
  if (!defaultTimeseriesList) {
    return "m";
  }

  const defaultTimeseries = defaultTimeseriesList.find(t => t.parameter === r.timeseriesId);
  if (!defaultTimeseries) {
    return 'm';
  }

  return defaultTimeseries.unitOfMeasure;
}


export function crashlyticsLog(message: string) {
  firebase.crashlytics().log(message);
}