const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

//new Email(user, url).sendWelcome();

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.firstName = user.name.split('')[0]; //only first name
		this.url = url;
		this.from = `David Cordero de Jesus <${process.env.EMAIL_FROM}>`;
	}

	newTransport() {
		if(process.env.NODE_ENV === 'production') {
			//Sendgrid
			return nodemailer.createTransport({
				service: 'SendGrid',
				auth: { 
					user: process.env.SENDGRID_USERNAME,
					pass: process.env.SENDGRID_PASSKEY
				}
			})
		}	
		return nodemailer.createTransport({
			// service: 'Gmail', use this instead of host and port if using gmail

			host : process.env.EMAIL_HOST,
			port : process.env.EMAIL_PORT,
			auth : {
				user : process.env.EMAIL_USERNAME,
				pass : process.env.EMAIL_PASSWORD
		}
		});
	}
	async send(template, subject) {
		//send the actual email
		//1) render the html for the email based on a pug template
		const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
			firstName: this.firstName,
			url: this.url,
			subject
		})
		//2) define the email options
		const mailOptions = {
			from    : this.from,
			to      : this.to,
			subject,
			html,
			text: htmlToText.fromString(html)
		};

		//3) create a transport and send email
		await this.newTransport().sendMail(mailOptions);
	}
	async sendWelcome() {
		await this.send('welcome', 'Welcome to the Natours Family!');
	}

	async sendPasswordReset() {
		await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)'
		)
	}
};
// const sendEmail = async (options) => {
// 	//create transporter  - service to send email
// 	const transporter = nodemailer.createTransport({
// 		// service: 'Gmail', use this instead of host and port if using gmail
// 		host : process.env.EMAIL_HOST,
// 		port : process.env.EMAIL_PORT,
// 		auth : {
// 			user : process.env.EMAIL_USERNAME,
// 			pass : process.env.EMAIL_PASSWORD
// 		}
// 		//activate in gmail "less secure app" option  sendgrid or mailgun is what he suggests
// 	});
// 	// define email options
// 	const mailOptions = {
// 		from    : 'David Cordero de Jesus <decorde@yahoo.com>', //change to my email that will be my coding email
// 		to      : options.email,
// 		subject : options.subject,
// 		text    : options.message
// 		//html:
// 	};
// 	// send email with nodemailer
// 	await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
