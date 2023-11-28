const { Client } = require("../models/client.model");
const { body, validationResult, param } = require('express-validator');
const uuid = require("uuid");
const { Business } = require("../models/business.model");
const { BusinessTransactionManager } = require("../models/businesstransactionmanager.model");


class TransactionController{

    static async getTransactions(request, response){
        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get client
            const transactions = await BusinessTransactionManager.getBusinessTransactions(business.reference);const transactionsArr = [];
            await Promise.all(
                transactions.map(async (tranx)=>{
                    tranx = tranx.toJSON();
                    tranx.client = await Client.findById(tranx.clientid);
                    transactionsArr.push(tranx);
                })
            );
            
            return response.status(200).json({
                status:true,
                success:true,
                data: transactionsArr
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
    TransactionController
};