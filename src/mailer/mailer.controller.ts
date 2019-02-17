import { SentMessageInfo, createTransport } from 'nodemailer';
import * as mg from 'nodemailer-mailgun-transport';

import { MailGunner } from '../interfaces/mailer';

class Mailer {
  mgAuth: mg.Options;
  MailGunner: MailGunner;

  constructor() {
    this.mgAuth = {
      auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.EMAIL_DOMAIN
      }
    };

    this.MailGunner = createTransport(mg(this.mgAuth));
  }

  public sendEmail(): Promise<SentMessageInfo> {
    return new Promise<SentMessageInfo>((resolve, reject) => {
      this.MailGunner.sendMail(
        {
          from: 'no-reply@example.com',
          to: 'email@luc.gg', // An array if you have multiple recipients.
          subject: 'test',
          template: {
            name: 'emails/email.hbs',
            engine: 'handlebars',
            context: null
          }
        },
        (err: Error, info: SentMessageInfo) => {
          if (err) {
            reject(err);
          } else {
            resolve(info);
          }
        }
      );
    });
  }
}

export default new Mailer();
