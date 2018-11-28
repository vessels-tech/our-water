"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Email API is a utility for sending emails
 */
const AppProviderTypes_1 = require("../types/AppProviderTypes");
const env_1 = require("../env");
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const mailTransport = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
        user: env_1.outboundEmailAddress,
        pass: env_1.outboundEmailPassword,
    },
});
const APP_NAME = 'GGMN';
class EmailApi {
    static sendResourceEmail(email, subject, message, attachments) {
        const mailOptions = {
            from: `${APP_NAME} <admin@vessels.tech>`,
            to: email,
            subject,
            text: message,
            attachments,
        };
        // The user subscribed to the newsletter.
        // mailOptions.subject = `Welcome to ${APP_NAME}!`;
        // mailOptions.text = `Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
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