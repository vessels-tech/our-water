import * as functions from 'firebase-functions';
import { getBoolean, asList } from './utils';

const envConfig = functions.config();
export const mywellLegacyAccessToken = envConfig.config.mywell_legacy_access_token;

export const outboundEmailAddress = envConfig.config.outbound_email_address;
export const outboundEmailPassword = envConfig.config.outbound_email_password;
export const shouldSendEmails = getBoolean(envConfig.config.should_send_emails);
export const testEmailWhitelist = asList(envConfig.config.test_email_whitelist);
