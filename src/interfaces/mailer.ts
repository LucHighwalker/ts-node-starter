import { SentMessageInfo } from 'nodemailer';
import Mail = require('nodemailer/lib/mailer');

interface MailOptions extends Mail.Options {
  template: {
    name: string,
    engine: string,
    context: any
  }
}

export interface MailGunner extends Mail {
  sendMail(
    mailOptions: MailOptions,
    callback: (err: Error | null, info: SentMessageInfo) => void
  ): void;
  sendMail(mailOptions: MailOptions): Promise<SentMessageInfo>;
}