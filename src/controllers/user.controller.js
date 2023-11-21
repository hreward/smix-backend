const { User } = require("../models/user.model");
const authcodesModel = require("../models/authcodes.model");
const uaParser = require("ua-parser-js");
const { Auth } = require("../models/auth.model");
const { AuthController } = require("./auth.controller");
const {  default: validator } = require("validator");
const { Card } = require("../models/card.model");
const { Coop } = require("../models/business.model");
const { renameSync } = require("fs");


class UserController{
    static async userDetails(request, response){
        try{
            //confirm login
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to log in.");

            // get user cards
            const userCards = await Card.getUserCards(user.id);

            // get user bank accounts
            const bankaccounts = await user.getUserBankAccount();
            
            //find user coops.
            const coops = await Coop.findByUser(user.id);
            
            //strip some data from coop
            coops.forEach(coop => {
                delete coop.approvedBy;
                delete coop.createdBy;
                delete coop.coreMission;
            });

            const userData = {
                email: user.email,
                firstname: user.firstName,
                lastname: user.lastName,
                id: user.id,
                phone: user.phone,
                country: user.country,
                address: user.address,
                dob: user.dob,
                avatar: user.avatar,
                financialgoal: user.finGoal,
                profilevisibility: user.profileVisibility,
                emailnotification: user.emailNotification,
                cards: userCards,
                bankaccounts: bankaccounts,
                coops: coops
            }
            return response.status(200).json({
                status:true,
                success:true,
                data: userData
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

    static async updateUser(request, response){
        var userData = request.body;
        if(!userData.firstname || userData.firstname.length < 3){
            return response.status(200).json({status:"error", success:false, message:"Firstname is missing or too short"});
        } else if(!userData.lastname || userData.lastname.length < 3){
            return response.status(200).json({status:"error", success:false, message:"Lastname is missing or too short"});
        } else if(!userData.phone || userData.phone.length < 11){
            return response.status(200).json({status:"error", success:false, message:"Phone number is missing or too short"});
        } else if(!userData.country || !['nigeria'].includes(userData.country.toLowerCase())){
            return response.status(200).json({status:"error", success:false, message:"unsupported country"});
        // } else if(!userData.state || userData.state.length > 20){
        //     return response.status(200).json({status:"error", success:false, message:"invalid state submitted"});
        // } else if(!userData.city || userData.city.length > 20){
        //     return response.status(200).json({status:"error", success:false, message:"invalid city submitted"});
        } else if(!userData.address || userData.address.length > 50){
            return response.status(200).json({status:"error", success:false, message:"Address is missing or too long. Enter your house and street/area address"});
        } else if(!userData.dob || validator.isDate(userData.dob, {delimiters: ['-']})){
            return response.status(200).json({status:"error", success:false, message:"Invalid date submitted for date of birth"});
        }
        
        const firstName = userData.firstname;
        const lastName = userData.lastname;
        const phone = userData.phone;
        const country = userData.country;
        const state = userData.state;
        const city = userData.city;
        const address = userData.address;
        const dob = userData.dob;

        if(userData.financialgoal){
            var finGoal = userData.financialgoal;
        } else {
            var finGoal = "";
        }
        
        if(userData.emailnotification === true){
            var emailnotification = true;
        } else {
            var emailnotification = false;
        }
        
        if(userData.visibility === true){
            var profilevisibilty = true;
        } else {
            var profilevisibilty = false;
        }

        try{
            //confirm login
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to log in.");

            // update user
            user.firstName = firstName;
            user.lastName = lastName;
            user.phone = phone;
            user.dob = dob;
            user.country = country;
            user.address = address;
            
            user.profileVisibility = profilevisibilty;
            user.emailNotification = emailnotification;
            user.finGoal = finGoal;
            user.city = city;
            user.state = state;
            
            await user.save();

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
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to log in.");

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

            // update user
            user.avatar = newFilename;
            await user.save();

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
    UserController
};