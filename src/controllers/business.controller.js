const { Business } = require("../models/business.model");
const { User } = require("../models/client.model");
const uuid = require("uuid");
const {countrycurrency, nigeriaStates} = require("../helper");
const Flutter = require("../services/flw/Flutter");
const { ServiceTransaction } = require("../models/servicetransaction.model");
const { renameSync } = require("fs");
const {default: validator} = require("validator");
const { AutoSave } = require("../models/autosave.model");
const { Queue } = require("../models/queue.model");
const { body, validationResult, param } = require("express-validator");
const { EmailController } = require("./email.controller");


class BusinessController{
    static async createBusiness(request, response){
        
        // Do input validation
        const validationRules = [
            body('businessname').trim().isLength({ min: 3, max: 50 }).withMessage('Business must be between 3 to 50 characters'),
            body('email').trim().isEmail().withMessage('Invalid email address'),
            body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
            body('phonenumber').trim().isMobilePhone().withMessage("Invalid phone number"),
            body('identificationnumber').trim().isAlphanumeric().optional().withMessage("Invalid identification"),
            body('accountnumber').trim().isNumeric().isLength({max:10, min:10}).withMessage("Invalid account number"),
            body("bankcode").trim().isNumeric().isLength({ max: 10 })
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

        try {
            // destructure user input
            const { businessname, email, password, phonenumber, identificationnumber, accountnumber, bankcode } = request.body;

            // check if user with email already existence
            try {
                const existingBusiness = await Business.findByEmail(email);
                if(existingBusiness) throw new Error("Business with email already exists");
            } catch (error) {
                if(error.message === `Business with email already exists`){
                    return response.status(200).json({
                        status:false,
                        success:false,
                        message: `Business with email already exists`
                    });
                }
            }
            

            // cascade business
            const businessId = uuid.v4().replace("-","").slice(0, 8).toUpperCase();
            const business = new Business(businessId, businessname, email, phonenumber, "", identificationnumber, "", "", "");
            business.setPassword(password);

            // const flutter = new Flutter(process.env.FLW_SECRET_KEY);
            const flutter = new Flutter('FLWSECK-979683b3b075659a1119f821d1a562d8-X');
            
            // get banks
            const banks = await flutter.getBanks();
            const bank = banks.find((bnk)=> bnk.code === bankcode);

            // resolve account number
            const acctResolve = await flutter.resolveAccount(accountnumber, bankcode);
            
            //save business details
            await business.save();
            // save bank details
            await business.saveBusinessBankAccount(bank.name, bank.code, acctResolve.account_name, acctResolve.account_number);
	        
	        //send otp email to user
	        EmailController.sendSignupEmail(email, businessname).catch((error)=>{});

            //return response
	        return response.status(200).json({
	            status:true,
	            success:true,
	            message: "Signup successful. We have sent you a confirmation email."
	        });
        } catch (error) {
            return response.status(500).json({
                status:true,
                success:false,
                message:error.message
            });
        }
                    
    }

    static async getBusiness(request, response){

        
        // Do input validation
        const validationRules = [
            param('businessid').trim().isEmpty.withMessage('Invalid business id')
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


        try {
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to login");

            // destructure request params
            const { businessid } = request.params;

            const businessy = business.toJSON();
            
            return response.status(200).json({
                status:true,
                success:true,
                data: businessy
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

    static async deleteBusiness(request, response){
        
        // Do input validation
        const validationRules = [
            param('businessid').trim().isEmpty.withMessage('Invalid business id')
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

        // destructure request params
        const { businessid } = request.params;

        try {
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to login");

            await business.delete();
            
            return response.status(200).json({
                status:true,
                success:true,
                message: 'Business deleted successfully. It may take some days to completely remove all data.'
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

    static async reportBusiness(request, response){
        try {
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to login");

            // destructure request params
            const { businessid } = request.params;
        
        } catch (error) {
            console.error(error);
            return response.status(200).json({
                status:true,
                success:false,
                message: error.message
            });
        }
    }
}
module.exports = { BusinessController };