const nodemailer = require("nodemailer");
const Mail = require("nodemailer/lib/mailer");
const emailModel = require("../models/email.model");
const moment = require("moment");
const { AuthCodes } = require("../models/authcodes.model");

//setting email transport here
const emailTransport = nodemailer.createTransport({
    host: process.env.mailHost,
    port: process.env.mailPort,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.mailUser, // generated ethereal user
        pass: process.env.mailPass, // generated ethereal password
    },
	tls: {rejectUnauthorized:false} // this is just for contigency
});

class EmailController {

    static async sendSignupEmail(email, lastname){
        try {
	        // get then code
	        const code = await AuthCodes.generateCode("account activation", email);
	        // get email template
	        const htmlEmail = emailModel.getAccountVerificationTemplate(email, "", lastname, code);
	        // let mailOptions:Mail.Options = {
			/**
			 * @type {Mail.Options}
			 */
	        const mailOptions = {
	            priority: "high",
	            from: `"CoopNex" <${process.env.mailUser}>`,
	            to: `"${lastname}" <${email}>`,
	            subject: "Email Verification",
	            html: htmlEmail,
	            sender: "Coopy",
				
	        }
	
	        return new Promise((resolve, reject)=>{
	            emailTransport.sendMail(mailOptions, (err, info)=>{
	                if(err){
                        console.error(err);
	                    reject(new Error(`Email delivery failed: ${err.message}`));
	                } else {
	                    resolve(true);
	                }
	            });
	        });
        } catch (error) {
            console.error(error);
			// do nothing
        }

    }

    static async sendPasswordChangeEmail(email, lastname){
        try {
	        // get then code
	        const code = await AuthCodes.generateCode("password change", email);
	        // get email template
	        const htmlEmail = emailModel.getPasswordChangeTemplate(email, "", lastname, code);
	        
	        const mailOptions = {
	            priority: "high",
	            from: `"CoopNex" <${process.env.mailUser}>`,
	            to: `"${lastname}" <${email}>`,
	            subject: "Password Change Verification",
	            html: htmlEmail,
	            sender: "Coopy",
	        }
	
	        return await new Promise((resolve, reject)=>{
	            emailTransport.sendMail(mailOptions, (err, info)=>{
	                if(err){
	                    console.error('Email Error', err);
                        reject(new Error(`Email delivery failed ${err.message}`));
	                } else {
						console.error(info);
	                    resolve(true);
	                }
	            });
	        });
        } catch (error) {
            console.error(error);
            // do nothing
        }
    }

}

module.exports = {EmailController};