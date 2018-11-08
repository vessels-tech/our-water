"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const utils_1 = require("./utils");
const envConfig = functions.config();
exports.mywellLegacyAccessToken = envConfig.config.mywell_legacy_access_token;
exports.outboundEmailAddress = envConfig.config.outbound_email_address;
exports.outboundEmailPassword = envConfig.config.outbound_email_password;
exports.shouldSendEmails = utils_1.getBoolean(envConfig.config.should_send_emails);
exports.testEmailWhitelist = utils_1.asList(envConfig.config.test_email_whitelist);
//# sourceMappingURL=env.js.map