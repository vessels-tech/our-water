"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
exports.digestEmailDestination = exports.shouldBackupFirebaseOnCron = exports.projectId = exports.verboseLog = exports.temporaryAdminUserId = exports.temporaryAdminAccessToken = exports.backupBucketName = exports.backupServiceAccountKeyFilename = exports.testEmailWhitelist = exports.shouldSendEmails = exports.outboundEmailPassword = exports.outboundEmailAddress = exports.mywellLegacyAccessToken = void 0;
=======
exports.firebaseToken = exports.storageBucket = exports.shouldSendEmails = exports.digestEmailDestination = exports.projectId = exports.verboseLog = exports.temporaryAdminUserId = exports.temporaryAdminAccessToken = exports.backupBucketName = exports.backupServiceAccountKeyFilename = exports.testEmailWhitelist = exports.outboundEmailPassword = exports.outboundEmailAddress = exports.mywellLegacyAccessToken = void 0;
>>>>>>> mywell/development
const functions = require("firebase-functions");
//TODO: move these back to utils, for some reason TS doesn't like them being here.
function getBoolean(value) {
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
function asList(value) {
    return value.split(",");
}
const envConfig = functions.config();
exports.mywellLegacyAccessToken = envConfig.config.mywell_legacy_access_token;
exports.outboundEmailAddress = envConfig.config.outbound_email_address;
exports.outboundEmailPassword = envConfig.config.outbound_email_password;
// export const shouldSendEmails = getBoolean(envConfig.config.should_send_emails);
exports.testEmailWhitelist = asList(envConfig.config.test_email_whitelist);
exports.backupServiceAccountKeyFilename = envConfig.config.backup_service_account_key_filename;
exports.backupBucketName = envConfig.config.backup_bucket_name;
exports.temporaryAdminAccessToken = envConfig.config.temporary_admin_access_token;
exports.temporaryAdminUserId = envConfig.config.temporary_admin_user_id;
exports.verboseLog = getBoolean(envConfig.config.verbose_log);
exports.projectId = envConfig.config.project_id;
<<<<<<< HEAD
exports.shouldBackupFirebaseOnCron = getBoolean(envConfig.config.should_backup_firebase_on_cron);
exports.digestEmailDestination = asList(envConfig.config.digest_email_destination);
=======
// export const digestEmailDestination = asList(envConfig.config.digest_email_destination) // todo: kevin
exports.digestEmailDestination = ["kevindoveton@me.com"];
exports.shouldSendEmails = true;
exports.storageBucket = `${exports.projectId}.appspot.com`;
exports.firebaseToken = "15367152749123896"; //This isn't too precious, our files are public anyway
>>>>>>> mywell/development
//# sourceMappingURL=env.js.map