const { Client } = require("../models/client.model");
const { body, validationResult, param } = require('express-validator');
const { renameSync } = require("fs");
const uuid = require("uuid");
const { Business } = require("../models/business.model");
const { BusinessClientManager } = require("../models/businessclientmanager.model");


class ClientController{

    static async newClient(request, response){
        
        // Do input validation
        const validationRules = [
            body('name').isLength({ min: 3, max: 50 }).withMessage('Client name must be between 3 to 50 characters'),
            body('email').isEmail().withMessage('Invalid email address'),
            body('phonenumber').isMobilePhone().withMessage("Invalid phone number"),
            body('address').isLength({min: 10, max: 100}).withMessage("Client address must be between 10 to 100 characters"),
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

        // destructure client input
        const { name, email, phonenumber, address } = request.body;

        try {
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to login");

            // cascade client
            const clientId = uuid.v4().replace("-","").slice(0, 8).toUpperCase();
            const client = new Client(business.reference, clientId, name, email, phonenumber);
            client.address = address;
            await client.save();

            //return response
	        return response.status(200).json({
	            status:true,
	            success:true,
	            message: "Client profile setup successful."
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

    static async clientDetails(request, response){
        
        // Do input validation
        const validationRules = [
            param('clientid').trim().isLength({min: 5, max: 15}).withMessage('Invalid client id')
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
        const { clientid } = request.params;

        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get client
            const client = await Client.findById(clientid);

            // confirm client for this business
            if(business.reference !== client.businessid){
                throw new Error(`Client with id ${clientid} not found`)
            }
            const clientData = {
                email: client.email,
                name: client.name,
                id: client.id,
                phone: client.phone,
                address: client.address,
                avatar: client.avatar
            }
            return response.status(200).json({
                status:true,
                success:true,
                data: clientData
            });
        } catch (error) {
            return response.status(200).json({
                status:true,
                success:false,
                message: error.message
            });
        }
    }

    static async deleteClient(request, response){
        
        // Do input validation
        const validationRules = [
            param('clientid').trim().isLength({min: 5, max: 15}).withMessage('Invalid client id')
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
        const { clientid } = request.params;

        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get client
            const client = await Client.findById(clientid);

            // confirm client for this business
            if(business.reference !== client.businessid){
                throw new Error(`Client with id ${clientid} not found`)
            }

            await client.delete();

            return response.status(200).json({
                status:true,
                success:true,
                message: `Client '${client.name}' removed successfully.`
            });
        } catch (error) {
            return response.status(200).json({
                status:true,
                success:false,
                message: error.message
            });
        }
    }

    static async restoreClient(request, response){
        
        // Do input validation
        const validationRules = [
            param('clientid').trim().isLength({min: 5, max: 15}).withMessage('Invalid client id')
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
        const { clientid } = request.params;

        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get client
            const client = await Client.findById(clientid);

            // confirm client for this business
            if(business.reference !== client.businessid){
                throw new Error(`Client with id ${clientid} not found`)
            }

            await client.restore();

            return response.status(200).json({
                status:true,
                success:true,
                message: `Client '${client.name}' restored successfully.`
            });
        } catch (error) {
            return response.status(200).json({
                status:true,
                success:false,
                message: error.message
            });
        }
    }

    static async getClients(request, response){
        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get client
            const clients = await BusinessClientManager.getBusinessClients(business.reference)
            
            return response.status(200).json({
                status:true,
                success:true,
                data: clients
            });
        } catch (error) {
            console.error(error);
            return response.status(200).json({
                status:true,
                success:false,
                message: error.message
            });
        }
    }

    static async updateClient(request, response){
        var businessData = request.body;
        if(!businessData.firstname || businessData.firstname.length < 3){
            return response.status(200).json({status:"error", success:false, message:"Firstname is missing or too short"});
        } else if(!businessData.lastname || businessData.lastname.length < 3){
            return response.status(200).json({status:"error", success:false, message:"Lastname is missing or too short"});
        } else if(!businessData.phone || businessData.phone.length < 11){
            return response.status(200).json({status:"error", success:false, message:"Phone number is missing or too short"});
        } else if(!businessData.country || !['nigeria'].includes(businessData.country.toLowerCase())){
            return response.status(200).json({status:"error", success:false, message:"unsupported country"});
        // } else if(!businessData.state || businessData.state.length > 20){
        //     return response.status(200).json({status:"error", success:false, message:"invalid state submitted"});
        // } else if(!businessData.city || businessData.city.length > 20){
        //     return response.status(200).json({status:"error", success:false, message:"invalid city submitted"});
        } else if(!businessData.address || businessData.address.length > 50){
            return response.status(200).json({status:"error", success:false, message:"Address is missing or too long. Enter your house and street/area address"});
        } else if(!businessData.dob || validator.isDate(businessData.dob, {delimiters: ['-']})){
            return response.status(200).json({status:"error", success:false, message:"Invalid date submitted for date of birth"});
        }
        
        const firstName = businessData.firstname;
        const lastName = businessData.lastname;
        const phone = businessData.phone;
        const country = businessData.country;
        const state = businessData.state;
        const city = businessData.city;
        const address = businessData.address;
        const dob = businessData.dob;

        try{
            //confirm login
            /**
             * @type {Client}
             */
            const client = request.client;
            if(!client) throw new Error("You need to log in.");

            // update client
            client.firstName = firstName;
            client.lastName = lastName;
            client.phone = phone;
            client.dob = dob;
            client.country = country;
            client.address = address;
            
            client.profileVisibility = profilevisibilty;
            client.emailNotification = emailnotification;
            client.finGoal = finGoal;
            client.city = city;
            client.state = state;
            
            await client.save();

            return response.status(200).json({
                status:true,
                success:true,
                message: "Profile updated successfully"
            });
        } catch (error) {
            console.error(error);
            return response.status(200).json({
                status:true,
                success:false,
                message: error.message
            });
        }
    }

    static async updateAvatar(request, response){

        try{
            //confirm login
            /**
             * @type {Client}
             */
            const client = request.client;
            if(!client) throw new Error("You need to log in.");

            // handle uploaded avatar
            if(!request.file){
                throw new Error("No file uploaded");
            }
            if(!request.file.mimetype.split('/')[0] === 'image'){
                throw new Error("Please upload an image file");
            }
            const avatar = request.file;
            const newDest = `${process.env.cdnDir}profileimages/`; // please use absolute path reference here
            const newFilename = `${avatar.filename}.png`;
            renameSync(avatar.path, `${newDest}${newFilename}`);

            // update client
            client.avatar = newFilename;
            await client.save();

            return response.status(200).json({
                status:true,
                success:true,
                message: "Profile image updated successfully"
            });
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

module.exports = {
    ClientController
};