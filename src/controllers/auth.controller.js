const { User } = require("../models/user.model");
const { Auth } = require("../models/auth.model");
const {countrycurrency} = require("../helper");
const { EmailController } = require("./email.controller");
const { AuthCodes } = require("../models/authcodes.model");
const { Coop } = require("../models/business.model");
const uaParser = require("ua-parser-js");
const uuid = require("uuid");
const { hash } = require("bcryptjs");
const { Wallet } = require("../models/wallet.model");
const { Feedback } = require("../models/feedback.model");
const { renameSync } = require("fs");


class AuthController {
    // Authentication middleware function
    /**
     * @returns {User}
    **/
    static async requireLogin (request, response, next) {//doner
        const token = request.headers.authorization;
        if (!token) {
            return response.status(401).json({
            error: 'Authorization token not found'
            });
        }

        //confirm login
        var uap = uaParser(request.headers['user-agent']);
        const tokenData = {};
        tokenData.device_signature = uap.ua;
        tokenData.device_name = `${uap.os.name}-${uap.os.version}`;
        tokenData.browser = `${uap.browser.name}`;
        tokenData.token = token;
        
        try {
            const user = await Auth.authenticateTokenAccess(tokenData);
            request.user = user;
            next();
        } catch (error) {
            return response.status(401).json({
                status: "error",
                success: false,
                message: error.message
            })
        }
    };


    // Authentication middleware function
    /**
     * @returns {Coop}
    **/
    static async requireCoopAdmin (request, response, next) {//doner
        const coopid = request.coopid;
        if (!coopid) {
            return response.status(400).json({
            error: 'Coop ID is missing'
            });
        }
        
        
        try {
            const coop = await Coop.findById(coopid);
            const user = request.user;
            // check if user is an admin/exco of this coop
            if(await coop.getUserRole(user.id) === 'chairman'){
                request.coop = coop;
                next();
            } else {
                throw new Error("Not authorized")
            }
        } catch (error) {
            return response.status(401).json({
                status: "error",
                success: false,
                message: error.message
            })
        }
    };

    static async newUser(request, response){//doner
        var userData = request.body.userData;
        if(!userData.email || userData.email.length < 0){
            return response.status(400).json({status:"error", success:false, message:"Email address is missing"});
        } else if(!userData.password || userData.password.length < 8){
            return response.status(400).json({status:"error", success:false, message:"Phone number is missing or too short"});
        } else if(!userData.firstname || userData.firstname.length < 3){
            return response.status(400).json({status:"error", success:false, message:"Firstname is missing or too short"});
        } else if(!userData.lastname || userData.lastname.length < 3){
            return response.status(400).json({status:"error", success:false, message:"Lastname is missing or too short"});
        } else if(!userData.phone || userData.phone.length < 11){
            return response.status(400).json({status:"error", success:false, message:"Phone number is missing or too short"});
        } else if(!userData.country || !countrycurrency.supportedCountries.includes(userData.country.toLowerCase())){
            return response.status(400).json({status:"error", success:false, message:"unsupported country"});
        }
        try {
            //cascade user
            const userId = uuid.v4().replace("-","").slice(0, 15).toUpperCase();
	        const user =  new User(userId, userData.firstname, userData.lastname, userData.email, userData.password);
            await user.setPassword(userData.password);
	        user.phone = userData.phone;
	        user.country = userData.country;
	        user.status = "awaiting_confirmation";

            console.log("submitted: "+userData.password);
	
	        //saving user
	        await user.save();
	        
	        //send otp email to user
	        await EmailController.sendSignupEmail(user.email, user.lastName);

            //return response
	        return response.status(200).json({
	            status:true,
	            success:true,
	            message: "Signup successful. We have sent you a confirmation email."
	        });
        } catch (error) {
            console.error(error);
            return response.status(400).json({
                status:true,
                success:false,
                message:error.message
            });
        }
                    
    }

    static async checkEmail(request, response){//doner
        // console.log(request);
        if(!request.body.email || request.body.email.length < 5){
            return response.status(400).json({status:"error", success:false, message:"Email address is missing"});
        }

        try{
            const user = await User.findByEmail(request.body.email);
            
            return response.status(200).json({
                status:true,
                success:false,
                message:"Email already exists"
            });
        } catch(error) {
            if(error.message === `User with email ${request.body.email} not found`){
                return response.status(200).json({
                    status:true,
                    success:true,
                    message: `Email ${request.body.email} is available`
                });
            } else {
                console.log(error);
                return response.status(200).json({
                    status:"error",
                    success:true,
                    message: error.message
                });
            }
        }
    }

    static async verifyOTP(request, response){ //doner
        // console.log(request);
        if(!request.body.email || request.body.email.length < 5){
            return response.status(400).json({status:"error", success:false, message:"Email address is missing or invalid"});
        } else if(!request.body.otp || request.body.otp.length < 4){
            return response.status(400).json({status:"error", success:false, message:"OTP is missing or too short"});
        }
        
        try{
            request.body.email = request.body.email.trim();
            request.body.otp = request.body.otp.trim();
            const codeVerified = await AuthCodes.verifyCode(request.body.email, request.body.otp);
            if(codeVerified !== true) throw new Error("Incorrect Code");

            const user = await User.findByEmail(request.body.email);
            user.status = 'active';

            // creating wallet for user
            const walletRef = uuid.v4().replace("/-/g","").slice(0, 15).toUpperCase();
            const userWallet = new Wallet(walletRef, user.id, 0, "NGN", "active");
            await userWallet.save();

            await user.save();

            const loginData = {};
            var uap = uaParser(request.headers['user-agent']);
            loginData.email = user.email;
            loginData.device_signature = await hash(uap.ua, 2);
            loginData.device_name = `${uap.os.name}-${uap.os.version}`;
            loginData.browser = `${uap.browser.name}`;

            const token = await Auth.authorizeUser(user.id, loginData);
            
            //mark code as used
            await AuthCodes.markCodeUsed(request.body.email, request.body.otp);
            
            return response.status(200).json({
                status:true,
                success:true,
                data: token,
                message:"OTP validated successfully"
            });
                
        } catch(error) {
            return response.status(200).json({
                status:"error",
                success:false,
                message: error.message
            });
        }
    }

    static async checkPhone(request, response){
        return response.status(200).json({
            status:true,
            success:false,
            data:"phone"
        });
    }

    static async login(request, response){ //doner
        // console.log(request);
        var loginData = request.body.userData
        if(!loginData.email || loginData.email.length < 5){
            return response.status(400).json({status:"error", success:false, message:"Email address is missing"});
        } else if(!loginData.password || loginData.password.length < 5){
            return response.status(400).json({status:"error", success:false, message:"Incorrect email or password"});
        }

        var uap = uaParser(request.headers['user-agent']);
        loginData.device_signature = await hash(uap.ua, 2);
        loginData.device_name = `${uap.os.name}-${uap.os.version}`;
        loginData.browser = `${uap.browser.name}`;
        
        
        try {
            const userId = await Auth.authenticateUser(loginData.email, loginData.password);
            const user = await User.findById(userId);
            
            //confirm is user active or waiting activation
            // if(user.status === "awaiting_confirmation"){
            //     //resend verification email
            //     EmailController.sendSignupEmail(user.email, user.lastname).catch((reason)=>{console.log(reason.message);});
            //     throw new Error("User account not confirmed yet. We have sent you another confirmation email");
            // }
            if(user.status !== 'active'){
                throw new Error("Account is not active. Verify email or Please contact support.")
            }

            //get token for this login
            const loginToken = await Auth.authorizeUser(userId, loginData);

            return response.status(200).json({
                status:true,
                success:true,
                data: {token:loginToken},
                message: "Login successful"
            });
        } catch (error) {
            console.error(error);
            return response.status(200).json({
                status:true,
                success:false,
                message:error.message
            });
        }
    }

    static async logout(request, response){ //doner
        const token = request.headers.authorization || "";
        try{
            //confirm login
            const user = request.user;
            if(!user) throw new Error("You need to log in.");

            await Auth.unAuthorizeUser(user.id, token);
            return response.status(200).json({
                status:true,
                success:true,
                message: 'logout is successful'
            });
        } catch(error) {
            console.error(error);
            return response.status(200).json({
                status:'error',
                success:false,
                message: error.message
            });
        };
    }


    //password handling
    static async requestPasswordChange(request, response){ //doner
        var userData = request.body;
        if(!userData.email || userData.email.length < 5){
            return response.status(400).json({status:"error", success:false, message:"Email address is missing"});
        }
        
        try{
            //get user
            /**
             * @type {User}
             */
            const user = await User.findByEmail(userData.email);
            //send otp email to user
            await EmailController.sendPasswordChangeEmail(user.email, user.lastName);
            return response.status(200).json({
                status:true,
                success:true,
                message: "An OTP has been sent to your email"
            });
        } catch(error) {
            console.error(error);
            return response.status(200).json({
                status:"error",
                success:false,
                message:error.message
            });
        }
    }

    static async changePassword(request, response){ //doner
        // console.log(request.body);
        var passwordDetails = request.body
        if(!passwordDetails.email || passwordDetails.email.length < 5){
            return response.status(400).json({status:"error", success:false, message:"Email address is missing or invalid"});
        } else if(!passwordDetails.otp || passwordDetails.otp.length < 4){
            return response.status(400).json({status:"error", success:false, message:"OTP is missing or too short"});
        } else if(!passwordDetails.newpassword || passwordDetails.newpassword.length < 6){
            return response.status(400).json({status:"error", success:false, message:"Password is missing or too short"});
        }
        
        try{
            const codeVerified = await AuthCodes.verifyCode(passwordDetails.email, passwordDetails.otp);
            if(codeVerified !== true) throw new Error("Incorrect Code");
            //activate user account
            const user = await User.findByEmail(passwordDetails.email);
            await user.setPassword(passwordDetails.newpassword);
            await user.save();
            
            await AuthCodes.markCodeUsed(request.body.email, request.body.otp);

            return response.status(200).json({
                status:true,
                success:true,
                message:"Password changed successfully."
            });
        } catch(error){
            //log the error;
            console.error(error);
            return response.status(200).json({
                status:"error",
                success:false,
                message:error.message
            });
        }
    }


    
    // Account verification
    static async requestEmailCode(request, response){ //doner
        var userData = request.body;
        if(!userData.email || userData.email.length < 5){
            return response.status(200).json({status:"error", success:false, message:"Email address is missing"});
        }
        
        try{
            //get user
            /**
             * @type {User}
             */
            const user = await User.findByEmail(userData.email);
            if(!(user.status === "awaiting activation" || user.status === "awaiting_activation" || user.status === "waiting activation" || user.status === "waiting_confirmation" || user.status === "awaiting_confirmation")){
                throw new Error('Email confirmation not needed for this user')
            }
            //send otp email to user
            await EmailController.sendSignupEmail(user.email, user.lastName);
            return response.status(200).json({
                status:true,
                success:true,
                message: "An OTP has been sent to your email"
            });
        } catch(error) {
            console.error(error);
            return response.status(200).json({
                status:"error",
                success:false,
                message:error.message
            });
        }
    }

    static async verifyEmailCode(request, response){ //doner
        // console.log(request.body);
        var passwordDetails = request.body
        if(!passwordDetails.email || passwordDetails.email.length < 5){
            return response.status(200).json({status:"error", success:false, message:"Email address is missing or invalid"});
        } else if(!passwordDetails.code || passwordDetails.code.length < 4){
            return response.status(200).json({status:"error", success:false, message:"OTP is missing or too short"});
        }

        try{
            const codeVerified = await AuthCodes.verifyCode(passwordDetails.email, passwordDetails.code);
            if(codeVerified !== true) throw new Error("Incorrect Code");
            //activate user account
            const user = await User.findByEmail(passwordDetails.email);

            // check if user was awaiting activation and activate
            if(user.status === "awaiting activation" || user.status === "awaiting_activation" || user.status === "waiting activation" || user.status === "waiting_confirmation" || user.status === "awaiting_confirmation"){

                // creating wallet for user
                const walletRef = uuid.v4().replace("/-/g","").slice(0, 15).toUpperCase();
                const userWallet = new Wallet(walletRef, user.id, 0, "NGN", "active");
                await userWallet.save();
                
                // saving wallet
                await userWallet.save();
                
                user.status = "active";
                await user.save();
            } else {
                throw new Error("Email confirmation not needed for this user")
            }

            await AuthCodes.markCodeUsed(passwordDetails.email, passwordDetails.code);

            return response.status(200).json({
                status:true,
                success:true,
                message:"Email verified successfully."
            });
        } catch(error){
            //log the error;
            console.error(error);
            return response.status(200).json({
                status:"error",
                success:false,
                message:error.message
            });
        }
    }


    // Feedback
    
    static async createFeedback(request, response){//doner
        const feedbackData = request.body;
        if(feedbackData == undefined){
            return response.status(200).json({status:"error", success:false, message:"Incomplete info submitted"});
        } else if(!feedbackData.name || feedbackData.name.length < 3){
            return response.status(200).json({status:"error", success:false, message:"Please enter a valid"});
        } else if(!feedbackData.email || feedbackData.email.length < 5) {
            return response.status(200).json({status:"error", success:false, message:"Please enter a valid email address"});
        } else if(!feedbackData.pageurl || feedbackData.pageurl.length < 3) {
            return response.status(200).json({status:"error", success:false, message:"Page url is missing"});
        } else if(!feedbackData.message || feedbackData.message.length < 10) {
            return response.status(200).json({status:"error", success:false, message:"Message is missing or too short"});
        }

        //setting defaults
        if(!feedbackData.pagename || feedbackData.pagename.length < 3) {
            feedbackData.pagename = "";
        }
        
        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");
            
            // handle files uploaded
            if(request.file){
                const attachmentFile = request.file;
                const newDest = `${process.env.cdnDir}attachments/`; // please use absolute path reference here
                const newFilename = `${attachmentFile.filename}.png`;
                renameSync(attachmentFile.path, `${newDest}${newFilename}`);
                var attachment = newFilename;
            } else {
                var attachment = ""
            }

            const reference = uuid.v4().replace("-","").slice(0, 12).toUpperCase();
            const feedback = new Feedback(reference, feedbackData.name, feedbackData.email, feedbackData.pagename, feedbackData.pageurl, feedbackData.message, attachment, 'active');

            await feedback.save();

            return response.status(200).json({
                status:true,
                success:true,
                message: "Feedback submitted successfully. We value it and will work towards it."
            });
        
        } catch (error) {
            console.error(error);
            return response.status(200).json({
                status:true,
                success:false,
                message:error.message
            });
        }
    }
}


module.exports = {AuthController};