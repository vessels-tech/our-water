"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Email API is a utility for sending emails
 */
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const env_1 = require("../env");
const nodemailer = require("nodemailer");
const mailTransport = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
        user: env_1.outboundEmailAddress,
        pass: env_1.outboundEmailPassword
    }
});
const APP_NAME = "GGMN";
class EmailApi {
    /**
     * @function sendUserDigestEmail
     *
     * @description Send a "New users/user activity" email
     *
     * @param email - email address to send to
     * @param subject - The subject line of the email
     * @param users - A list of the users who signed up since the last time this email was sent. Note: the email
     *     will still be sent if the users array is empty
     */
    // TODO: Integration test!
    static sendUserDigestEmail(email, users) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date().toString();
            const subject = `MyWell user digest for: ${date}`;
            const mailOptions = {
                from: `${APP_NAME} <admin@vessels.tech>`,
                to: email,
                subject,
                html: this.getUserDigestTemplate(users)
            };
            if (!env_1.shouldSendEmails && env_1.testEmailWhitelist.indexOf(email) === -1) {
                console.log(`Not sending emails as shouldSendEmails is false, and ${email} is not in the whitelist.`);
                return Promise.resolve(AppProviderTypes_1.makeSuccess(undefined));
            }
            console.log(`Sending email to ${email}`);
            return mailTransport
                .sendMail(mailOptions)
                .then(() => AppProviderTypes_1.makeSuccess(undefined))
                .catch((err) => AppProviderTypes_1.makeError(err.message));
        });
    }
    // TODO: unit test
    static getUserDigestTemplate(users) {
        const date = new Date().toString();
        if (users.length === 0) {
            return `No new user signups for ${date}`;
        }
        const signInCount = users.length; //todo figure out filters etc.
        //TODO: change the html if there are no users
        const html = `<p>Here's your MyWell User digest for: ${date}</p>
                  <p>A total of ${signInCount} users signed up for the first time:</p>
                  ${users.map(user => `<p>Name: ${user.name}<br />
                                          Email: ${user.email}<br />
                                          Phone: ${user.mobile}
                                       </p>`)}
                  </p>
                 `;
        return html;
    }
    static sendResourceEmail(email, subject, message, attachments) {
        const mailOptions = {
            from: `${APP_NAME} <admin@vessels.tech>`,
            to: email,
            subject,
            html: message,
            attachments
        };
        // The user subscribed to the newsletter.
        // mailOptions.subject = `Welcome to ${APP_NAME}!`;
        // mailOptions.text = `Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
        if (!env_1.shouldSendEmails && env_1.testEmailWhitelist.indexOf(email) === -1) {
            console.log(`Not sending emails as shouldSendEmails is false, and ${email} is not in the whitelist.`);
            return Promise.resolve(AppProviderTypes_1.makeSuccess(undefined));
        }
        console.log(`Sending email to ${email}`);
        return mailTransport
            .sendMail(mailOptions)
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