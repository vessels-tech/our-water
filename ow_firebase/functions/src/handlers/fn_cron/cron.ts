
import * as functions from 'firebase-functions';
const request = require('request-promise-native');


import { firestore } from '../../common/apis/FirebaseAdmin';
import { Sync } from '../../common/models/Sync';
import CronUtils from './CronUtils';
import { SyncFrequency } from '../../common/enums/SyncFrequency';

// import { getBackupAccessToken } from '../../../tools';

const hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
  console.log("This job is ran every hour!");

  //TODO: where do we get the orgId from? Can't we just run all syncs for all orgs???
  // const syncs: [Sync] = CronUtils.getSyncsForFrequency(orgId, fs, SyncFrequency.Hourly);

  //TODO: lookup all syncs that need to be run every hour
  //Trigger new sync runs

  return true;
});

/**
 * 
 

 const projectId = 'PROJECT_ID'
  const getAccessToken = new Promise(function (resolve, reject) {
    const scopes = ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform']
    const key = require(`./${projectId}.json`)
    const jwtClient = new google.auth.JWT(
      key.client_email,
      undefined,
      key.private_key,
      scopes,
      undefined
    )
    const authorization = new Promise(function (resolve, reject) {
      return jwtClient.authorize().then((value) => {
        return resolve(value)
      })
    })
    return authorization.then(function (value) {
      return resolve(value.access_token)
    })
  })
  return getAccessToken.then(function (accessToken) {
    const url = `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default):exportDocuments`
    return rp.post(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      json: true,
      body: {
        outputUriPrefix: `gs://${projectId}-backups`
      }
    })
  })


 */

const daily_job = functions.pubsub.topic('daily-tick').onPublish(async (event) => {
  console.log("This job is ran every day!")

  //TODO: perform backup
  const accessToken = "12345";
  // const accessToken = await getBackupAccessToken();
  const url = `https://firestore.googleapis.com/v1beta1/projects/our-water/databases/(default):exportDocuments`
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    json: true,
    body: {
      outputUriPrefix: `gs://our-water-backup`,
    }
  };

  return request.post(url, options);
});

const weekly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
  console.log("This job is ran evasdasdery week")

  return true;
});

export {
  hourly_job,
  daily_job,
  weekly_job
}