const { User } = require("../models/client.model");
const { Auth } = require("../models/auth.model");
const { EmailController } = require("./email.controller");
const { AuthCodes } = require("../models/authcodes.model");
const { Business } = require("../models/business.model");
const uaParser = require("ua-parser-js");
const uuid = require("uuid");
const { hash } = require("bcryptjs");
const { body, validationResult } = require("express-validator");


class AuthController {
    // Authentication middleware function
    /**
     * @returns {Business}
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
            const business = await Auth.authenticateTokenAccess(tokenData);
            request.business = business;
            next();
        } catch (error) {
            return response.status(401).json({
                status: "error",
                success: false,
                message: error.message
            })
        }
    };


    static async login(request, response){

        // Do input validation
        const validationRules = [
            body('email').isEmail().withMessage('Email address is missing'),
            body('password').isLength({ min: 8 }).withMessage('Incorrect email or password'),
        ];
        await Promise.all(validationRules.map(validation => validation.run(request)));

        // Get validation results
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({
                status: "error",
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()[0]
            });
        }

        var loginData = request.body

        var uap = uaParser(request.headers['user-agent']);
        loginData.device_signature = await hash(uap.ua, 2);
        loginData.device_name = `${uap.os.name}-${uap.os.version}`;
        loginData.browser = `${uap.browser.name}`;
        
        
        try {
            const businessid = await Auth.authenticateBusiness(loginData.email, loginData.password);
            const business = await Business.findById(businessid);
            
            // if(business.status !== 'active'){
            //     throw new Error("Account is not active. Verify email or Please contact support.")
            // }

            //get token for this login
            const loginToken = await Auth.authorizeBusiness(businessid, loginData);

            return response.status(200).json({
                status:true,
                success:true,
                data: {token: loginToken},
                message: "Login successful"
            });

        } catch (error) {
            console.error(error);
            return response.status(500).json({
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
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            await Auth.unAuthorizeBusiness(business.reference, token);
            return response.status(200).json({
                status:true,
                success:true,
                message: 'logout is successful'
            });
        } catch(error) {
            return response.status(500).json({
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
}


module.exports = {AuthController};