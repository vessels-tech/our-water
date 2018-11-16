/**
 * Email API is a utility for sending emails
 */
import { SomeResult, ResultType, makeSuccess, makeError } from "../types/AppProviderTypes";
import {
  outboundEmailAddress,
  outboundEmailPassword,
  shouldSendEmails,
  testEmailWhitelist,
} from '../env';

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

//TODO: configure a zoho address for ourwater@vessels.tech here: https://stackoverflow.com/questions/45772221/nodemailer-with-zoho-mail
const mailTransport = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: outboundEmailAddress,
    pass: outboundEmailPassword,
  },
});

const APP_NAME = 'GGMN';

export default class EmailApi {
  public static sendResourceEmail(email, message, attachments): Promise<SomeResult<void>> {
    //TODO: add attachments in the form of a zip file.

    const mailOptions: any = {
      from: `${APP_NAME} <admin@vessels.tech>`,
      to: email,
      attachments,
    };

    // The user subscribed to the newsletter.
    mailOptions.subject = `Welcome to ${APP_NAME}!`;
    mailOptions.text = `Welcome to ${APP_NAME}. I hope you will enjoy our service.`;

    if (!shouldSendEmails && testEmailWhitelist.indexOf(email) === -1) {
      console.log(`Not sending emails as shouldSendEmails is false, and ${email} is not in the whitelist.`);

      return Promise.resolve(makeSuccess(undefined));
    }
    console.log(`Sending email to ${email}`);

    return mailTransport.sendMail(mailOptions)
    .then(() => {
      return makeSuccess(undefined);
    })
    .catch((err: Error) => {
      return makeError(err.message);
    });
  }


  

}