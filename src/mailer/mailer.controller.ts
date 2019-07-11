import { SentMessageInfo, createTransport } from "nodemailer";
import * as mg from "nodemailer-mailgun-transport";

import { MailGunner } from "../interfaces/mailer";

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

	public async sendEmail(
		from: string,
		to: string | [string],
		subject: string,
		template: string,
		context: any = null
	): Promise<SentMessageInfo> {
		return await this.MailGunner.sendMail({
			from,
			to, // An array if you have multiple recipients.
			subject,
			template: {
				name: template,
				engine: "handlebars",
				context
			}
		});
	}
}

export default new Mailer();
