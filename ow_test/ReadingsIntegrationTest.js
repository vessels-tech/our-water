/**
 * Create readings in OurWater
 * 
 * We're mainly writing this to help debug the GeoPoint issue we're having with firebase
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const settings = {/* your settings... */ timestampsInSnapshots: true };

admin.initializeApp();
const fs = admin.firestore();
fs.settings(settings);


const assert = require('assert');
const request = require('request-promise-native');
const sleep = require('thread-sleep');

const baseUrl = process.env.BASE_URL;
const orgId = process.env.ORG_ID;
const mywellLegacyAccessToken = process.env.MYWELL_LEGACY_ACCESS_TOKEN;
const mywellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;

