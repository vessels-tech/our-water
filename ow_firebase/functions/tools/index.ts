const request = require('request-promise-native');
import { possibleTranslationsForOrg, TranslationOrg, translationsForTranslationOrg, TranslationFiles, functionReplacer } from 'ow_translations';
import { MyWellResourceTypes } from './mywellConfig';


export const arg: any = (argList => {
  const myArg = {}
  let a, opt, thisOpt, curOpt;
  for (a = 0; a < argList.length; a++) {

    thisOpt = argList[a].trim();
    opt = thisOpt.replace(/^\-+/, '');

    if (opt === thisOpt) {
      // argument value
      if (curOpt) myArg[curOpt] = opt;
      curOpt = null;
    }
    else {
      // argument name
      curOpt = opt;
      myArg[curOpt] = true;
    }
  }
  return myArg;
})(process.argv);

export async function getToken(admin: any): Promise<string> {
  return admin.auth().createCustomToken('12345')
  .then((token: string) => {
    
    const options = {
      json: true,
      url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${process.env.WEB_API_KEY}`,
      method: 'POST',
      body: {
        token,
        returnSecureToken: true
      },
    };
    return request(options)
  })
  .then(response => response.idToken)
  // .catch((error: Error) => {
  //   console.log("Error creating custom token:", error.message);
  //   return Promise.reject(error);
  // });
}

export async function getAuthHeader(admin: any): Promise<{Authorization: string}> {
  const token = await getToken(admin);

  return {
    Authorization: `Bearer ${token}`
  };
}

const { JWT } = require('google-auth-library');

/**
 * getAdminAccessToken
 * 
 * Gets the admin access token for using firebase admin tools.
 */
export async function getAdminAccessToken(key: any): Promise<string> {
  const client = new JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/firebase.remoteconfig'],
    null,
  );

  try {
    const result =  await client.authorize();
    console.log(result);
    return result.access_token;
  } catch (err) {
    return Promise.reject(err);
  }
}


/**
 * getBackupAccessToken
 * 
 * Gets the access token for triggering a backup
 */
export async function getBackupAccessToken(backupKey: any): Promise<string> {
  const scopes = [
    'https://www.googleapis.com/auth/datastore', 
    'https://www.googleapis.com/auth/cloud-platform'
  ];

  //TODO: this may need a different key

  const client = new JWT(
    backupKey.client_email,
    null,
    backupKey.private_key,
    scopes,
    null,
  );

  try {
    const result = await client.authorize();
    console.log(result);
    return result.access_token;
  } catch (err) {
    return Promise.reject(err);
  }
}


/**
 * getRemoteConfig
 * 
 * Gets the current remote config settings
 * 
 * curl --compressed -D headers -H "Authorization: Bearer token" -X GET https://firebaseremoteconfig.googleapis.com/v1/projects/my-project-id/remoteConfig -o filename
 * 
 * returns a tuple: 0-> etag 1 -> config
 */
export async function getRemoteConfig(projectId: string, token: string): Promise<[string, any]> {
  let etag, currentConfig;

  const etagRequestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept-Encoding': 'gzip',
    },
    uri: `https://firebaseremoteconfig.googleapis.com/v1/projects/${projectId}/remoteConfig`,
    simple: false,
    resolveWithFullResponse: true,
  }

  const options = {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
    uri: `https://firebaseremoteconfig.googleapis.com/v1/projects/${projectId}/remoteConfig`,
  };

  /* 
    API only returns etag with the gzip encoding.
    we make two requests to make this whole thing easier
  */
  return request(options)
  .then(_currentConfig => {
    currentConfig = _currentConfig;
    return request(etagRequestOptions);
  })
  .then(rawResponse => {
    etag = rawResponse.headers.etag;
    return [ etag, currentConfig];
  })
  .catch(err => {
    console.log('getRemoteConfig: Error', err.message);
    return Promise.reject(err);
  });
}


/**
 * saveNewConfig
 * 
 * Save the new config to firebase
 * curl --compressed -H "Content-Type: application/json; UTF8" -H "If-Match: last-returned-etag" -H "Authorization: Bearer token" -X PUT https://firebaseremoteconfig.googleapis.com/v1/projects/my-project-id/remoteConfig -d @filename
 */
export async function saveNewConfig(token: string, etag: string, projectId: string, config: any): Promise<any> {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; UTF8',
      'If-Match': etag,
      Authorization: `Bearer ${token}`,
    },
    uri: `https://firebaseremoteconfig.googleapis.com/v1/projects/${projectId}/remoteConfig`,
    body: JSON.stringify(config),
  };


  return request(options)
  .then(response => {
    console.log(response);
    return response;
  })
  .catch(err => {
    console.log(err.message);
    return Promise.reject(err);
  });
}

//TODO: adapt these to also have 
function buildParameter(deflt: any, description: string, conditions: string[], values: any[]) {
  const wrapValue = (value: any) => {
    if (typeof value === 'boolean') {
      return `${value}`;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value;
  }

  const conditionalValues = {};
  conditions.forEach((cdn: string, idx: number) => {
    const value = wrapValue(values[idx])
    conditionalValues[cdn] = { value };
  });
  return {
    "defaultValue": {
      "value": wrapValue(deflt),
    },
    conditionalValues,
  description,
  }
}

/**
 * getNewConfig
 * 
 * Build and return the new remote config
 */
export async function getNewConfig(): Promise<any> {
  const { conditionKeys, conditions } = require('./remoteConfigConditions');

  console.log('conditions are', conditionKeys);

  const mywellTranslationOptionsJSON = JSON.stringify(possibleTranslationsForOrg(TranslationOrg.mywell), null, 2);
  const mywellTranslationsJSON = JSON.stringify(translationsForTranslationOrg(TranslationOrg.mywell), functionReplacer, 2);
  const ggmnTranslationsOptionsJSON = JSON.stringify(possibleTranslationsForOrg(TranslationOrg.ggmn), null, 2);
  const ggmnTranslationsJSON = JSON.stringify(translationsForTranslationOrg(TranslationOrg.ggmn), functionReplacer, 2);

  
  const parameters = {
    applicationName: buildParameter(
      'MyWell', 
      'the application name',
      conditionKeys, 
      ['GGMN', 'GGMN DEV', 'MyWell']
    ),
    baseApiType: buildParameter(
      'MyWellApi', 
      '', 
      conditionKeys, 
      ['GGMNApi', 'GGMNApi', 'MyWellApi']
    ),
    firebaseBaseUrl: buildParameter(
      `${process.env.firebase_base_url}`, 
      'The base url', 
      conditionKeys, 
      ['GGMN', 'GGMN', `${process.env.firebase_base_url}`]
    ),
    ggmnBaseUrl: buildParameter(
      'https://ggmn.lizard.net', 
      '', 
      conditionKeys, 
      ['https://ggmn.lizard.net', 'https://ggmn.lizard.net', '']
    ),
    showConnectToButton: buildParameter(
      'false', 
      'should should the connect to button?', 
      conditionKeys, 
      ['true', 'true', 'false']
    ),
    showSyncButton: buildParameter(
      'false',
      'should should the sync to button?',
      conditionKeys,
      ['true', 'true', 'false']
    ),
    showPendingButton: buildParameter(
      'true',
      'should should the pending button?',
      conditionKeys,
      ['false', 'false', 'true']
    ),
    mywellBaseUrl: buildParameter(
      'https://mywell-server.vessels.tech',
      '',
      conditionKeys, 
      ['', '', 'https://mywell-server.vessels.tech']
    ),
    map_shouldLoadAllResources: buildParameter(
      true, 
      '',
      conditionKeys, 
      [false, false, true]
    ),
    newReading_enableImageUpload: buildParameter(
      true, 
      'the application name', 
      conditionKeys, 
      [false, false, true]
    ),
    homeScreen: buildParameter(
      'Simple',
      'the home screen style. Simple or Map', 
      conditionKeys, 
      ['Map', 'Map', 'Simple']
    ),
    resourceDetail_showSubtitle: buildParameter(
      true, 
      'Should the resrouce detail section have a subtitle?', 
      conditionKeys, 
      [true, true, false]
    ),
    resourceDetail_allowEditing: buildParameter(
      false, 
      'Are users allowed to edit resources?', 
      conditionKeys, 
      [true, true, false]
    ),
    resourceDetail_allowDelete: buildParameter(
      false, 
      'Are users allowed to delete resources?', 
      conditionKeys, 
      [true, true, false]
    ),
    resourceDetail_editReadings: buildParameter(
      true, 
      'Are users allowed to edit readings?', 
      conditionKeys, 
      [true, true, true]
    ),
    favouriteResourceList_showGetStartedButtons: buildParameter(
      true, 
      'Should the favourite resource list have a get started hint if empty?', 
      conditionKeys, 
      [false, false, true]
    ),
    editResource_hasResourceName: buildParameter(
      false,
      'When creating a new resource, can the user edit the name?',
      conditionKeys, 
      [true, true, false]
    ),
    editResource_showOwerName: buildParameter(
      true,
      'When creating a new resource, can the user set the owner name?',
      conditionKeys, 
      [false, false, true]
    ),
    editResource_availableTypes: buildParameter(
      [ 'well', 'raingauge', 'quality', 'checkdam'],
      'When creating a new resource, what types of resource can be created?',
      conditionKeys,
      [
        ['well'],
        ['well'],
        ['well', 'raingauge', 'quality', 'checkdam'],
      ]
    ),
    editResource_defaultTypes: buildParameter(
      MyWellResourceTypes,
      'The default resource timeseries types', 
      conditionKeys, 
      [
        //GGMN
        {
          well: [
            { name: 'GWmMSL', parameter: 'GWmMSL', readings: [], unitOfMeasure: 'm' },
            { name: 'GWmBGS', parameter: 'GWmBGS', readings: [], unitOfMeasure: 'm' },
          ]
        }, 
        //GGMN
        {
          well: [
            { name: 'GWmMSL', parameter: 'GWmMSL', readings: [], unitOfMeasure: 'm' },
            { name: 'GWmBGS', parameter: 'GWmBGS', readings: [], unitOfMeasure: 'm' },
          ]
        }, 
        //MyWell
        MyWellResourceTypes
      ]),
    editResource_allowCustomId: buildParameter(
      false, 
      'When creating a resource, is the user allowed to enter a custom id?', 
      conditionKeys, 
      [true, true, false]
    ),
    editResource_hasWaterColumnHeight: buildParameter(true, "When creating/editing a resource, should the user specify water column height?", conditionKeys, [true, true, true]),
    favouriteResource_scrollDirection: buildParameter(
      'Vertical', 
      'What direction does the favourite resource section scroll in?', 
      conditionKeys, 
      ['Horizontal', 'Horizontal', 'Vertical']
    ),
    usesShortId: buildParameter(
      true, 
      'the application name', 
      conditionKeys, 
      ['GGMN', 'GGMN', 'MyWell']
    ),
    allowsUserRegistration: buildParameter(
      true, 
      'Should we allow users to sign up?', 
      conditionKeys, 
      [false, false, true]
    ),
    translationOptions: buildParameter(
      mywellTranslationOptionsJSON,
      'The translation options',
      conditionKeys,
      [
        ggmnTranslationsOptionsJSON,
        ggmnTranslationsOptionsJSON,
        mywellTranslationOptionsJSON,
      ]
    ),
    translations: buildParameter(
      mywellTranslationsJSON,
      'The translations',
      conditionKeys,
      [
        ggmnTranslationsJSON,
        ggmnTranslationsJSON,
        mywellTranslationsJSON,
      ]
    ),
    ggmn_ignoreReading: buildParameter(
      JSON.stringify({ date: "2017-01-01T01:11:01Z", value: 0 }, null, 2),
      'A reading in GGMN that should be ignored by the graphs',
      conditionKeys,
      [
        JSON.stringify({ date: "2017-01-01T01:11:01Z", value: 0 }, null, 2),
        JSON.stringify({ date: "2017-01-01T01:11:01Z", value: 0 }, null, 2),
        JSON.stringify({ date: "2017-01-01T01:11:01Z", value: 0 }, null, 2),
      ]),
    map_regionChangeReloadDebounceTimeMs: buildParameter(
      '1000',
      'MS wait time after user has dragged map, but before reloading resources',
      conditionKeys,
      [
        '500',
        '500',
        '1000',
      ]
    ),
    showMapInSidebar: buildParameter(false, 'Should we display the map in the sidebar?', conditionKeys, [false, false, false]),
    resourceDetail_shouldShowTable: buildParameter(true, 'Show the readings table?', conditionKeys, [false, false, true]),
    resourceDetail_shouldShowQRCode: buildParameter(true, 'Show the QR code in ResourceDetailSection?', conditionKeys, [false, false, true]),
    favouriteResource_showPendingResources: buildParameter(true, 'Show the pending resources in the Favourites?', conditionKeys, [false, false, true]),
    availableGroupTypes: buildParameter(
      JSON.stringify({
        pincode: { id: 'pincode', required: true, order: 1 },
        country: { id: 'country', required: true, order: 0 },
      }), 
      "The Available group types. Required is currently ignored.",
      conditionKeys, [
        JSON.stringify({}),
        JSON.stringify({}),
        JSON.stringify({
          pincode: { id: 'pincode', required: true, order: 1 },
          country: { id: 'country', required: true, order: 0 },
        }),
      ]
    ),
    shouldUseV1Search: buildParameter(false, 'Use V1 Search?', conditionKeys, [true, true, false]),
    resourceDetail_allowDownload: buildParameter(true, "Allow user to download readings from the resourceDetail?", conditionKeys, [false, false, true]),
    readingDownloadUrl: buildParameter(
      `${process.env.firebase_base_url}/public/mywell/downloadReadings`, 
      "Download readings for resourceId url", 
      conditionKeys, 
      ["", "", `${process.env.firebase_base_url}/public/mywell/downloadReadings`
    ]),
    resourceDetail_graphButtons: buildParameter(
        JSON.stringify([
          { text: '3Y', value: 'THREE_YEARS' },
          { text: '1Y', value: 'ONE_YEAR' },
          { text: '3M', value: 'THREE_MONTHS' },
        ]),
        'the graph and table buttons',
        conditionKeys, [
          JSON.stringify([
            { text: '1Y', value: 'ONE_YEAR' },
            { text: '3M', value: 'THREE_MONTHS' },
            { text: '2W', value: 'TWO_WEEKS' },
            { text: 'EXTENT', value: 'EXTENT' },
          ]),
          JSON.stringify([
            { text: '1Y', value: 'ONE_YEAR' },
            { text: '3M', value: 'THREE_MONTHS' },
            { text: '2W', value: 'TWO_WEEKS' },
            { text: 'EXTENT', value: 'EXTENT' },
          ]),
          JSON.stringify([
            { text: '3Y', value: 'THREE_YEARS' },
            { text: '1Y', value: 'ONE_YEAR' },
            { text: '3M', value: 'THREE_MONTHS' },
          ]),
        ]
    ),
    resourceDetail_graphUsesStrictDate: buildParameter(true, "Does the graph only display strict dates?", conditionKeys, [false, false, true]),
  };

  return Promise.resolve({
    conditions,
    parameters,
  });
}
