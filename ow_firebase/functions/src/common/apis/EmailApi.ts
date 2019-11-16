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
import { User } from "ow_common/lib/model";

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
  public static async sendUserDigestEmail(email, users: Array<User>): Promise<SomeResult<void>> {
    const date = (new Date()).toString();
    const subject = `MyWell user digest for: ${date}`

    const mailOptions: any = {
      from: `${APP_NAME} <admin@vessels.tech>`,
      to: email,
      subject,
      html: this.getUserDigestTemplate(users)
    };

    if (!shouldSendEmails && testEmailWhitelist.indexOf(email) === -1) {
      console.log(`Not sending emails as shouldSendEmails is false, and ${email} is not in the whitelist.`);

      return Promise.resolve(makeSuccess(undefined));
    }
    console.log(`Sending email to ${email}`);

    return mailTransport.sendMail(mailOptions)
      .then(() => makeSuccess(undefined))
      .catch((err: Error) => makeError(err.message));
  }

  // TODO: unit test
  public static getUserDigestTemplate(users: Array<User>): string {
    const date = (new Date()).toString();
    if (users.length === 0) {
      return `No new user signups for ${date}`
    }

    const signInCount = users.length; //todo figure out filters etc.

    //TODO: change the html if there are no users
    const html = `Here's your MyWell User digest for: ${date}

A total of ${signInCount} users signed up for the first time:
${users.map(user => `  - ${user.id}`)}

    `

    return html
  }

  /**
   * @function sendUserDigestEmail
   * 
   * @description Send a "New users/user activity" email
   * 
   * @param email - email address to send to
   * @param subject - The subject line of the email
   * @param user - A list of the users who signed up since the last time this email was sent. Note: the email
   *     will still be sent if the users array is empty
   */
  // TODO: Integration test!
  public static async sendUserSignupEmail(email, user: User): Promise<SomeResult<void>> {
    const date = (new Date()).toString();
    const subject = `MyWell user digest for: ${date}`

    const mailOptions: any = {
      from: `${APP_NAME} <admin@vessels.tech>`,
      to: email,
      subject,
      html: this.getUserSignupTemplate(user)
    };

    if (!shouldSendEmails && testEmailWhitelist.indexOf(email) === -1) {
      console.log(`Not sending emails as shouldSendEmails is false, and ${email} is not in the whitelist.`);

      return Promise.resolve(makeSuccess(undefined));
    }
    console.log(`Sending email to ${email}`);

    return mailTransport.sendMail(mailOptions)
      .then(() => makeSuccess(undefined))
      .catch((err: Error) => makeError(err.message));
  }

  // TODO: unit test
  public static getUserSignupTemplate(user: User): string {

    const html = `A new user has signed up for MyWell:
    Name: ${user.name || 'n/a'}
    Mobile: ${user.mobile || 'n/a'}
    Email: ${user.email || 'n/a'}`

    return html
  }


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