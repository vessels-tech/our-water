"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Email API is a utility for sending emails
 */
const AppProviderTypes_1 = require("../types/AppProviderTypes");
const env_1 = require("../env");
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
//TODO: configure a zoho address for ourwater@vessels.tech here: https://stackoverflow.com/questions/45772221/nodemailer-with-zoho-mail
const mailTransport = nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 465,
    secure: true,
    auth: {
        user: env_1.outboundEmailAddress,
        pass: env_1.outboundEmailPassword,
    },
});
const APP_NAME = 'GGMN';
class EmailApi {
    static sendResourceEmail(email, message, attachments) {
        //TODO: add attachments in the form of a zip file.
        const mailOptions = {
            from: `${APP_NAME} <noreply@vessels.tech>`,
            to: email,
            attachments,
        };
        // The user subscribed to the newsletter.
        mailOptions.subject = `Welcome to ${APP_NAME}!`;
        mailOptions.text = `Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
        if (!env_1.shouldSendEmails && env_1.testEmailWhitelist.indexOf(email) === -1) {
            console.log(`Not sending emails as shouldSendEmails is false, and ${email} is not in the whitelist.`);
            return Promise.resolve(AppProviderTypes_1.makeSuccess(undefined));
        }
        console.log(`Sending email to ${email}`);
        return mailTransport.sendMail(mailOptions)
            .then(() => {
            return AppProviderTypes_1.makeSuccess(undefined);
        })
            .catch((err) => {
            return AppProviderTypes_1.makeError(err.message);
        });
    }
}
exports.default = EmailApi;
//# sourceMappingURL=EmailApi.js.map