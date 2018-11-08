"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Email API is a utility for sending emails
 */
const AppProviderTypes_1 = require("../types/AppProviderTypes");
const env_1 = require("../env");
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
//TODO: configure a zoho address for ourwater@vessels.tech here: https://stackoverflow.com/questions/45772221/nodemailer-with-zoho-mail
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env_1.outboundEmailAddress,
        pass: env_1.outboundEmailPassword,
    },
});
const APP_NAME = 'GGMN';
function sendResourceEmail(email, message, attachments) {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO: add attachments in the form of a zip file.
        const mailOptions = {
            from: `${APP_NAME} <noreply@firebase.com>`,
            to: email,
        };
        // The user subscribed to the newsletter.
        mailOptions.subject = `Welcome to ${APP_NAME}!`;
        mailOptions.text = `Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
        if (!env_1.shouldSendEmails && env_1.testEmailWhitelist.indexOf(email) === -1) {
            console.log(`Not sending emails as shouldSendEmails is false, and ${email} is not in the whitelist.`);
            return Promise.resolve(AppProviderTypes_1.makeSuccess(undefined));
        }
        return mailTransport.sendMail(mailOptions)
            .then(() => {
            return AppProviderTypes_1.makeSuccess(undefined);
        })
            .catch((err) => {
            return AppProviderTypes_1.makeError(err.message);
        });
    });
}
exports.sendResourceEmail = sendResourceEmail;
//# sourceMappingURL=EmailApi.js.map