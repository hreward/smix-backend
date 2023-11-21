const { Coop } = require("../models/business.model");
const { User } = require("../models/user.model");
const { Loan } = require("../models/loan.model");
const uuid = require("uuid");
const uaParser = require("ua-parser-js");
const {countrycurrency, nigeriaStates} = require("../helper");
const Flutter = require("../services/flw/Flutter");
const { ServiceTransaction } = require("../models/servicetransaction.model");
const { Wallet } = require("../models/wallet.model");
const { renameSync } = require("fs");
const { Card } = require("../models/card.model");
const {default: validator} = require("validator");
const { AutoSave } = require("../models/autosave.model");
const { Queue } = require("../models/queue.model");


class CoopController{
    static async createCoop(request, response){//doner
        const coopData = request.body;
        if(coopData == undefined){
            return response.status(200).json({status:"error", success:false, message:"Error"});
        }
        if(!coopData.name || coopData.name.length < 3){
            return response.status(200).json({status:"error", success:false, message:"Coop name is empty"});
        }
        if(!coopData.coremission || coopData.coremission.length < 5) {
            return response.status(200).json({status:"error", success:false, message:"Coop core mission is missing"});
        }
        if(!coopData.country || !countrycurrency.supportedCountries.includes(coopData.country.toLowerCase())){
            return response.status(200).json({status:"error", success:false, message:"Coop counrty is not supported yet"});
        }
        if(!coopData.state || !nigeriaStates.includes(coopData.state)) {
            return response.status(200).json({status:"error", success:false, message:"The state where coop is operating from is missing or not a valid Nigeria state"});
        }
        if(!coopData.city || coopData.city.length < 3) {
            return response.status(200).json({status:"error", success:false, message:"The city where coop is operating from is missing"});
        }
        if(!coopData.address || coopData.address.length < 3) {
            return response.status(200).json({status:"error", success:false, message:"Coop address line is missing"});
        }
        if(!coopData.regApproval || isNaN(coopData.regApproval)) {
            return response.status(200).json({status:"error", success:false, message:"Select the number of executives to approve new members registration"});
        }
        if(!coopData.withdrawalApproval || isNaN(coopData.withdrawalApproval)) {
            return response.status(200).json({status:"error", success:false, message:"Select the number of executives to approve members' withdrawal of funds"});
        }
        if(!coopData.exitApproval || isNaN(coopData.exitApproval)) {
            return response.status(200).json({status:"error", success:false, message:"Select the number of executives to approve members' exit from the coop"});
        }

        //setting defaults
        if(!coopData.regId) {
            coopData.regId = "";
        }
        if(coopData.visibility) {
            coopData.visibility = true;
        } else {
            coopData.visibility = false;
        }
        
        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            // console.log(request.files.cac[0]);

            // handle files uploaded
            if(request.files.logo && request.files.logo[0]){
                var logoFile = request.files.logo[0];
                const newDest = `${process.env.cdnDir}logos/`; // please use absolute path reference here
                const newFilename = `${logoFile.filename}.png`;
                renameSync(logoFile.path, `${newDest}${newFilename}`);
                var logo = newFilename;
            } else {
                var logo = ""
            }
            if(request.files.cac && request.files.cac[0]){
                var cacFile = request.files.cac[0];
                const newDest = `${process.env.cdnDir}docs/`; // please use absolute path reference here
                const newFilename = `${cacFile.filename}.png`;
                renameSync(cacFile.path, `${newDest}${newFilename}`);
                var cacCert = newFilename;
            } else {
                var cacCert = ""
            }
            if(request.files.otherdoc && request.files.otherdoc[0]){
                var otherdocFile = request.files.otherdoc[0];
                const newDest = `${process.env.cdnDir}docs/`; // please use absolute path reference here
                const newFilename = `${otherdocFile.filename}.png`;
                renameSync(otherdocFile.path, `${newDest}${newFilename}`);
                var otherDoc = ""
            } else {
                var otherDoc = ""
            }

            const reference = uuid.v4().replace("-","").slice(0, 12).toUpperCase();
            const coop = new Coop(reference, coopData.name, logo, coopData.regId, coopData.country, coopData.state, user.id);
            coop.coreMission = coopData.coremission;
            coop.city = coopData.city;
            coop.address = coopData.address;
            coop.regApproval = coopData.regApproval;
            coop.withdrawalApproval = coopData.withdrawalApproval;
            coop.exitApproval = coopData.exitApproval;
            coop.visibility = coopData.visibility;

            await coop.save();

            //create coop wallet
            const walletRef = uuid.v4().replace("-","").slice(0, 15).toUpperCase();
            const coopWallet = new Wallet(walletRef, coop.reference, 0, "NGN", "active");
            await coopWallet.save();
	        
            // throw new Error("stop here");

            return response.status(200).json({
                status:true,
                success:true,
                data: {coop_id: coop.reference},
                message: "Coop details saved successfully. Proceed to invite other executives."
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

    static async getUserCoops(request, response){//doner
        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            //find user coops.
            const coops = await Coop.findByUser(user.id);

            //strip some data from coop
            coops.forEach(coop => {
                delete coop.approvedBy;
                delete coop.createdBy;
                delete coop.coreMission;
            });
            
            return response.status(200).json({
                status:true,
                success:true,
                data: coops,
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

    static async getCoop(request, response){//doner

        if(!request.params.coopid || request.params.coopid.length < 5){
            return response.status(200).json({status:"error", success:false, message:"invalid coop id"});
        }
        var coopid = request.params.coopid;

        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");
    
            //get user coop ids from user model
            const coop = await Coop.findById(coopid);
            const isUserMember = await coop.isUserMember(user.id);
            const userRole = await coop.getUserRole(user.id);

            var contributions = null;
            var membership_request = null;
            if(isUserMember){
                //add contributions
                contributions = await coop.getUserContribution(user.id);

                //sum up all user contributions
                var totalCont = 0.00;
                contributions.forEach((value)=>{
                    totalCont += value.amount;
                    delete value.user_id;
                    delete value.coop_id;
                });
            } else {
                //check for pending membership request
                membership_request = await coop.isMemberRequestPending(user.id);
            }


            const coopy = coop.toJSON();
            //strip some data from coop
            delete coopy.approvedBy;
            delete coopy.createdBy;
            coopy.role = userRole;
            coopy.ismember = isUserMember;
            coopy.usercontribution = totalCont;
            coopy.contributions = contributions;
            coopy.membershiprequest = membership_request;
            coopy.autosave = await AutoSave.findByCoopAndUser(coop.reference, user.id);
            coopy.loanterms = await coop.getLoanTerms();
            coopy.liquidity = 0.00;
            coopy.sharecapital = 25000;
            coopy.executives = {
                chairman : {
                    name: "Obaro A.",
                    avatar: `${process.env.cdnLink}defaultavatar.png`
                },
                secretary : {
                    name: "Christina G.",
                    avatar: `${process.env.cdnLink}defaultavatar.png`
                }
            };
            
            return response.status(200).json({
                status:true,
                success:true,
                data: coopy
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

    static async deleteCoop(request, response){
        if(!request.params.coopid || request.params.coopid.length < 5){
            return response.status(200).json({status:"error", success:false, message:"invalid coop id"});
        }
        const coopid = request.params.coopid;

        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            //find coop.
            const coop = await Coop.findById(coopid);
            
            return response.status(200).json({
                status:true,
                success:true,
                data: coop,
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

    static async joinCoop(request, response){
        if(!request.params.coopid || request.params.coopid.length < 5){
            return response.status(200).json({status:"error", success:false, message:"invalid coop id"});
        }
        if(!request.body.password || request.body.password.length < 5){
            return response.status(401).json({status:"error", success:false, message:"incorrect password"});
        }
        const coopid = request.params.coopid;
        const password = request.body.password;

        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            // check password
            if(! await user.verifyPassword(password)){
                throw new Error("incorrect password");
            }

            // check KYC
            if(11 === 22){
                throw new Error(`You need to complete your verification before joining a co-operative`);
            }

            // limit user coops to 5
            const userCoops = await Coop.findByUser(user.id);
            if(userCoops.length >= 5){
                throw new Error("You can't belong to more than 5 co-operatives at a time.");
            }

            //find coop.
            const coop = await Coop.findById(coopid);
            if(await coop.isUserMember(user.id)){
                throw new Error("You are already a member of this co-operative.");
            }

            // check if approval if needed 
            var message = "";
            if(coop.regApproval > 0){
                await coop.addMemberRequest(user.id);
                message = `Your request have been sent to the executives for approval`;
            } else {
                await coop.addMember(user.id);
                message = `You've successfully joined this co-operative`;
            }

            return response.status(200).json({
                status:true,
                success:true,
                message: message,
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

    static async leaveCoop(request, response){
        if(!request.params.coopid || request.params.coopid.length < 5){
            return response.status(200).json({status:"error", success:false, message:"invalid coop id"});
        }
        if(!request.body.password || request.body.password.length < 5){
            return response.status(401).json({status:"error", success:false, message:"incorrect password"});
        }

        const coopid = request.params.coopid;
        const password = request.body.password;

        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            // check password
            if(! await user.verifyPassword(password)){
                throw new Error("incorrect password");
            }

            //find coop.
            const coop = await Coop.findById(coopid);


            // check if user created coop
            if(user.id === coop.createdBy){
                throw new Error("This co-operative was created by you. You may need to contact support to leave this co-operative");
            }

            /**
             * @type {Loan}
             */
            // check if there is unpaid loan from this coop
            const loan = await Loan.findByUserIdAndCoopId(user.id, coop.reference);
            if(loan > 0 && loan.status === 'active'){
                throw new Error("You have a loan in this co-operative that has not been paid. Loan has to be repaid before you can leave co-operative.")
            }

            // check if approval if needed 
            var message = "";
            if(coop.exitApproval > 0){
                await coop.removeMemberRequest(user.id);
                message = `Your request have been sent to the executives for approval`;
            } else {
                await coop.removeMember(user.id);
                message = `You've successfully left this co-operative`;
            }

            return response.status(200).json({
                status:true,
                success:true,
                message: message,
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

    static async cancelMembershipRequest(request, response){
        if(!request.params.coopid || request.params.coopid.length < 5){
            return response.status(200).json({status:"error", success:false, message:"invalid coop id"});
        }
        if(!request.body.password || request.body.password.length < 5){
        }
        
        const coopid = request.params.coopid;
        const password = request.body.password;

        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            // check password
            if(! await user.verifyPassword(password)){
                throw new Error("incorrect password");
            }

            //find coop.
            const coop = await Coop.findById(coopid);
            // remove request
            await coop.removeMemberRequest(user.id);

            return response.status(200).json({
                status:true,
                success:true,
                message: "Request withdrawn successfully",
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

    static async reportCoop(request, response){
        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            //find user coops.
            const coops = await Coop.findByUser(user.id);

            //strip some data from coop
            coops.forEach(coop => {
                delete coop.approvedBy;
                delete coop.createdBy;
                delete coop.coreMission;
            });
            
            return response.status(200).json({
                status:true,
                success:true,
                data: null,
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


    static async makeContribution(request, response){
        if(!request.params.coopid || request.params.coopid.length < 5){
            return response.status(200).json({status:"error", success:false, message:"Wrong co-operative id"});
        }
        if(!request.body.amount || isNaN(request.body.amount) || request.body.amount < 1){
            return response.status(200).json({status:"error", success:false, message:"Invalid amount."});
        }
        if(!request.body.source || request.body.source.length < 5){
            return response.status(401).json({status:"error", success:false, message:"Wrong card id"});
        }

        const coopid = request.params.coopid;
        const amount = parseFloat(request.body.amount);
        const source = request.body.source;

        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            //find coop.
            const coop = await Coop.findById(coopid);
            const coopWallet = await Wallet.findByUserId(coop.reference);

            if(await coop.isUserMember(user.id) !== true){
                throw new Error("Sorry, you're not a member of the co-operative");
            }

            const contributionTranx = {reference: null, amount: null};
            if(source === "wallet"){
                //pay from wallet
                const userWallet = await Wallet.findByUserId(user.id);
                const contTranx = await userWallet.transfer(amount, coopWallet.reference, `Contribution to ${coop.name}`);
                contributionTranx.reference = contTranx.reference;
                contributionTranx.amount = contTranx.amount;
            } else {
                //charge card 
                const flutter = new Flutter(process.env.FLW_SECRET_KEY);
                const flwCharge = await flutter.tokenCharge(source, user, `Contribution to ${coop.name}`, amount);
                
                // check if charge was successful
                if(flwCharge.status !== "success" || !flwCharge.data){
                    throw new Error(flwCharge.message);
                }

                const flwTranx = flwCharge.data;
                if(flwTranx.status !== "successful"){
                    throw new Error("Transaction was not successful.");
                }
                if(flwTranx.currency !== "NGN"){
                    throw new Error("Transaction currency not supported. Please contact customer care.");
                }

                //check meta for verification data
                if(flwTranx.customer.email !== user.email){
                    throw new Error("Inconsistent transaction data");
                }
                

                //check if value has been given already
                const serviceTranx = await ServiceTransaction.findTransactionById(flwTranx.id);
                if(serviceTranx !== null){
                    throw new Error("Value already given");
                } else {
                    // save tranx if its new
                    const newTranx = new ServiceTransaction(flwTranx.tx_ref, flwTranx.flw_ref, flwTranx.id, "funding", flwTranx.amount, flwTranx.device_fingerprint, flwTranx.narration, flwTranx.status, flwTranx.payment_type, flwTranx.created_at, user.email, user.id, flwTranx.currency, flwTranx.ip, flwTranx.amount_settled);
                    await newTranx.save();
                }
                
                const contTranx = await coopWallet.addFunds(flwTranx.amount, `Contribution from ${user.firstName} ${user.lastName}`);
                contributionTranx.reference = contTranx.reference;
                contributionTranx.amount = flwTranx.amount;
            }

            //make contribution
            await coop.makeContribution(contributionTranx.reference, user.id, contributionTranx.amount);

            return response.status(200).json({
                status:true,
                success:true,
                message: `${amount} paid successfully into ${coop.name}.`,
                data: {tx_ref: contributionTranx.reference}
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


    static async setAutosave(request, response){
        if(!request.params.coopid || request.params.coopid.length < 5){
            return response.status(200).json({status:"error", success:false, message:"Wrong co-operative id"});
        }
        if(!request.body.autoSaveInfo){
            return response.status(200).json({status:"error", success:false, message:"Wrong card id"});
        }

        const autoSaveInfo = request.body.autoSaveInfo;
        if(!autoSaveInfo.amount || isNaN(autoSaveInfo.amount) || autoSaveInfo.amount < 1){
            return response.status(200).json({status:"error", success:false, message:"Invalid amount."});
        }
        if(!autoSaveInfo.source || autoSaveInfo.source.length < 5){
            return response.status(200).json({status:"error", success:false, message:"Wrong card id"});
        }
        if(!autoSaveInfo.frequency || autoSaveInfo.frequency.length < 5){
            return response.status(200).json({status:"error", success:false, message:"Invalid frequency selected"});
        }
        if(!autoSaveInfo.time || autoSaveInfo.time.length < 5 || !validator.isTime(autoSaveInfo.time)){
            return response.status(200).json({status:"error", success:false, message:"Invalid time selected"});
        }

        const coopid = request.params.coopid;
        const amount = parseFloat(autoSaveInfo.amount);
        const frequency = autoSaveInfo.frequency;
        const time = autoSaveInfo.time;
        const source = autoSaveInfo.source;

        
        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            //find coop.
            const coop = await Coop.findById(coopid);

            if(await coop.isUserMember(user.id) !== true){
                throw new Error("Sorry, you're not a member of the co-operative");
            }
            if(source !== "wallet"){
                // confirm card reference
                const card = await Card.findByRef(source);
            }
            var weekday = "";
            var monthday = "";
            var month = "";
            if(frequency === 'daily'){
                //
            } else if(frequency === 'weekly'){
                weekday = autoSaveInfo.weekday;
            } else if(frequency === 'monthly'){
                monthday = autoSaveInfo.monthday;
            } else if(frequency === 'yearly'){
                month = autoSaveInfo.month;
            } else {
                throw new Error("Invalid contribution frequency selected");
            }

            const autoSaveRef = uuid.v4().replace(/-/g, '');
            const newAutoCont = new AutoSave(autoSaveRef, coop.reference, user.id, amount, source, {frequency: frequency, month: month, monthday: monthday, weekday: weekday, time: time}, 'active', new Date());
            await newAutoCont.save();

            return response.status(200).json({
                status:true,
                success:true,
                message: `Auto contribute for ${coop.name} updated successfully.`
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


    static async makeAutoContribution(coopid, userId, amount, source){

        try {
            /**
             * @type {User}
             */
            const user = await User.findById(userId);

            //find coop.
            const coop = await Coop.findById(coopid);
            const coopWallet = await Wallet.findByUserId(coop.reference);

            if(await coop.isUserMember(user.id) !== true){
                throw new Error("Sorry, you're not a member of the co-operative");
            }

            const contributionTranx = {reference: null, amount: null};
            if(source === "wallet"){
                //pay from wallet
                const userWallet = await Wallet.findByUserId(user.id);
                const contTranx = await userWallet.transfer(amount, coopWallet.reference, `Contribution to ${coop.name}`);
                contributionTranx.reference = contTranx.reference;
                contributionTranx.amount = contTranx.amount;
            } else {
                //charge card 
                const flutter = new Flutter(process.env.FLW_SECRET_KEY);
                const flwCharge = await flutter.tokenCharge(source, user, `Contribution to ${coop.name}`, amount);
                
                // check if charge was successful
                if(flwCharge.status !== "success" || !flwCharge.data){
                    throw new Error(flwCharge.message);
                }

                const flwTranx = flwCharge.data;
                if(flwTranx.status !== "successful"){
                    throw new Error("Transaction was not successful.");
                }
                if(flwTranx.currency !== "NGN"){
                    throw new Error("Transaction currency not supported. Please contact customer care.");
                }

                //check meta for verification data
                if(flwTranx.customer.email !== user.email){
                    throw new Error("Inconsistent transaction data");
                }
                

                //check if value has been given already
                const serviceTranx = await ServiceTransaction.findTransactionById(flwTranx.id);
                if(serviceTranx !== null){
                    throw new Error("Value already given");
                } else {
                    // save tranx if its new
                    const newTranx = new ServiceTransaction(flwTranx.tx_ref, flwTranx.flw_ref, flwTranx.id, "funding", flwTranx.amount, flwTranx.device_fingerprint, flwTranx.narration, flwTranx.status, flwTranx.payment_type, flwTranx.created_at, user.email, user.id, flwTranx.currency, flwTranx.ip, flwTranx.amount_settled);
                    await newTranx.save();
                }
                
                const contTranx = await coopWallet.addFunds(flwTranx.amount, `Contribution from ${user.firstName} ${user.lastName}`);
                contributionTranx.reference = contTranx.reference;
                contributionTranx.amount = flwTranx.amount;
            }

            //make contribution
            await coop.makeContribution(contributionTranx.reference, user.id, contributionTranx.amount);
        
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
module.exports = { CoopController };