/**
 * Email API is a utility for sending emails
 */
import { SomeResult, makeSuccess, makeError } from "ow_common/lib/utils/AppProviderTypes";
import {
  outboundEmailAddress,
  outboundEmailPassword,
  shouldSendEmails,
  testEmailWhitelist,
} from '../env';



const nodemailer = require('nodemailer');

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
  public static sendResourceEmail(email, subject, message, attachments): Promise<SomeResult<void>> {
    const mailOptions: any = {
      from: `${APP_NAME} <admin@vessels.tech>`,
      to: email,
      subject,
      html: message,
      attachments,
    };

    // The user subscribed to the newsletter.
    // mailOptions.subject = `Welcome to ${APP_NAME}!`;
    // mailOptions.text = `Welcome to ${APP_NAME}. I hope you will enjoy our service.`;

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