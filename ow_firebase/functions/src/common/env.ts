import * as functions from 'firebase-functions';


//TODO: move these back to utils, for some reason TS doesn't like them being here.
function getBoolean(value: any) {
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

function asList(value: string): string[] {
  return value.split(',');
}

const envConfig = functions.config();

export const mywellLegacyAccessToken = envConfig.config.mywell_legacy_access_token;
export const outboundEmailAddress = envConfig.config.outbound_email_address;
export const outboundEmailPassword = envConfig.config.outbound_email_password;
export const shouldSendEmails = getBoolean(envConfig.config.should_send_emails);
export const testEmailWhitelist = asList(envConfig.config.test_email_whitelist);