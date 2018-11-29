const request = require('request-promise-native');
import { BaseApiType, ResourceType } from "ow_types";
import { possibleTranslationsForOrg, TranslationOrg, translationsForTranslationOrg } from 'ow_translations';


export async function getToken(admin: any): Promise<string> {
  return admin.auth().createCustomToken('12345')
  .then(function (customToken) {

    const options = {
      json: true,
      url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${process.env.WEB_API_KEY}`,
      method: 'POST',
      body: {
        token: customToken,
        returnSecureToken: true
      },
    };
    return request(options)
  })
  .then(response => {
    return response.idToken;
  })
  .catch(function (error) {
    console.log("Error creating custom token:", error);
  });
}

export async function getAuthHeader(admin: any): Promise<{Authorization: string}> {
  const token = await getToken(admin);

  return {
    Authorization: `Bearer ${token}`
  };
}

const { JWT } = require('google-auth-library');
const key = require('../src/test/.serviceAccountKey.json');

/**
 * getAdminAccessToken
 * 
 * Gets the admin access token for using firebase admin tools.
 */
export async function getAdminAccessToken(): Promise<string> {
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
    // console.log('rawResponse', rawResponse.headers);
    // const parsedResponse = rawResponse.toJSON();
    // const etag = rawResponse.headers.etag;
    // return [ etag, parsedResponse];
  })
  .then(rawResponse => {
     // console.log('rawResponse', rawResponse.headers);
    // const parsedResponse = rawResponse.toJSON();
    etag = rawResponse.headers.etag;
    return [ etag, currentConfig];
  })
  .catch(err => {
    console.log('Error', err.message);
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
  const conditionKeys = ['ggmn_android', 'mywell_android'];

  const mywellTranslationOptions = possibleTranslationsForOrg(TranslationOrg.mywell);
  const mywellTranslations = translationsForTranslationOrg(TranslationOrg.mywell);
  const ggmnTranslationsOptions = possibleTranslationsForOrg(TranslationOrg.mywell);
  const ggmnTranslations = translationsForTranslationOrg(TranslationOrg.ggmn);

  const mywellTranslationOptionsJSON = JSON.stringify(mywellTranslationOptions, null, 2);
  const mywellTranslationsJSON = JSON.stringify(mywellTranslations, functionReplacer, 2);
  const ggmnTranslationsOptionsJSON = JSON.stringify(ggmnTranslationsOptions, null, 2);
  const ggmnTranslationsJSON = JSON.stringify(ggmnTranslations, functionReplacer, 2);

  const conditions = [
    {
      "name": "ggmn_android",
      "expression": "app.id == '1:276292750755:android:b9afcac37667ce3e' && device.os == 'android'",
      "tagColor": "BROWN"
    },
    {
      "name": "mywell_android",
      "expression": "app.id == '1:276292750755:android:e99123f734af0faa' && device.os == 'android'",
      "tagColor": "GREEN"
    }
  ];
  const parameters = {
    applicationName: buildParameter(
      'MyWell', 
      'the application name',
      conditionKeys, 
      ['GGMN', 'MyWell']
    ),
    baseApiType: buildParameter(
      'MyWellApi', 
      '', 
      conditionKeys, 
      ['GGMNApi', 'MyWellApi']
    ),
    firebaseBaseUrl: buildParameter(
      'localhost:5000', 
      '', 
      conditionKeys, 
      ['GGMN', 'localhost:5000']
    ),
    ggmnBaseUrl: buildParameter(
      'https://ggmn.lizard.net', 
      '', 
      conditionKeys, 
      ['https://ggmn.lizard.net', '']
    ),
    showConnectToButton: buildParameter(
      'false', 
      'should should the connect to button?', 
      conditionKeys, 
      ['true', 'false']
    ),
    mywellBaseUrl: buildParameter(
      'https://mywell-server.vessels.tech',
      '',
      conditionKeys, 
      ['', 'https://mywell-server.vessels.tech']
    ),
    map_shouldLoadAllResources: buildParameter(
      true, 
      '',
      conditionKeys, 
      [false, true]
    ),
    newReading_enableImageUpload: buildParameter(
      true, 
      'the application name', 
      conditionKeys, 
      [false, true]
    ),
    homeScreen: buildParameter(
      'Simple',
      'the home screen style. Simple or Map', 
      conditionKeys, 
      ['Map', 'Simple']
    ),
    resourceDetail_showSubtitle: buildParameter(
      true, 
      'Should the resrouce detail section have a subtitle?', 
      conditionKeys, 
      [true, false]
    ),
    resourceDetail_allowEditing: buildParameter(
      false, 
      'Are users allowed to edit resources?', 
      conditionKeys, 
      [true, false]
    ),
    resourceDetail_allowDelete: buildParameter(
      false, 
      'Are users allowed to delete resources?', 
      conditionKeys, 
      [true, false]
    ),
    resourceDetail_editReadings: buildParameter(
      false, 
      'Are users allowed to edit readings?', 
      conditionKeys, 
      [true, false]
    ),
    favouriteResourceList_showGetStartedButtons: buildParameter(
      true, 
      'Should the favourite resource list have a get started hint if empty?', 
      conditionKeys, 
      [false, true]
    ),
    editResource_hasResourceName: buildParameter(
      false,
      'When creating a new resource, can the user edit the name?',
      conditionKeys, 
      [true, false]
    ),
    editResource_showOwerName: buildParameter(
      true,
      'When creating a new resource, can the user set the owner name?',
      conditionKeys, 
      [false, true]
    ),
    editResource_availableTypes: buildParameter(
      [ 'well', 'raingauge', 'quality', 'checkdam'],
      'When creating a new resource, what types of resource can be created?',
      conditionKeys,
      [
        ['well'],
        ['well', 'raingauge', 'quality', 'checkdam'],
      ]
    ),
    editResource_defaultTypes: buildParameter(
      {
        well: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
        raingauge: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
        quality: [
          { name: 'salinity', parameter: 'salinity', readings: [] },
          { name: 'ph', parameter: 'ph', readings: [] },
          { name: 'nitrogen', parameter: 'nitrogen', readings: [] },
        ],
        checkdam: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
      }
      , 
      'The default resource timeseries types', 
      conditionKeys, 
      [
        //GGMN
        {
          well: [
            { name: 'GWmMSL', parameter: 'GWmMSL', readings: [] },
            { name: 'GWmBGS', parameter: 'GWmBGS', readings: [] },
          ]
        }, 
        //MyWell
        {
          well: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
          raingauge: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
          quality: [
            { name: 'salinity', parameter: 'salinity', readings: [] },
            { name: 'ph', parameter: 'ph', readings: [] },
            { name: 'nitrogen', parameter: 'nitrogen', readings: [] },
          ],
          checkdam: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
        }
      ]),
    editResource_allowCustomId: buildParameter(
      false, 
      'When creating a resource, is the user allowed to enter a custom id?', 
      conditionKeys, 
      [true, false]
    ),
    favouriteResource_scrollDirection: buildParameter(
      'Vertical', 
      'What direction does the favourite resource section scroll in?', 
      conditionKeys, 
      ['Horizontal', 'Vertical']
    ),
    usesShortId: buildParameter(
      true, 
      'the application name', 
      conditionKeys, 
      ['GGMN', 'MyWell']
    ),
    allowsUserRegistration: buildParameter(
      true, 
      'Should we allow users to sign up?', 
      conditionKeys, 
      [false, true]
    ),
    translationOptions: buildParameter(
      mywellTranslationOptionsJSON,
      'The translation options',
      conditionKeys,
      [
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
        mywellTranslationsJSON,
      ]
    ),
  };

  return Promise.resolve({
    conditions,
    parameters,
  });
}



export const functionReplacer = (name, val) => {
  if (typeof val === 'function') {
    const entire = val.toString();
    const arg = entire.slice(entire.indexOf("(") + 1, entire.indexOf(")"));
    const body = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));

    return {
      type: 'function',
      arguments: arg,
      body,
    };
  }

  return val;
}