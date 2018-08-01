import * as functions from 'firebase-functions';

const envConfig = functions.config();
export const mywellLegacyAccessToken = envConfig.config.mywell_legacy_access_token;
