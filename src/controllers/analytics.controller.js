const { Client } = require("../models/client.model");
const { body, validationResult, param } = require('express-validator');
const uuid = require("uuid");
const { Business } = require("../models/business.model");
const { BusinessTransactionManager } = require("../models/businesstransactionmanager.model");
const { Analytics } = require("../models/analytics.model");


class AnalyticsController{

    static async getTotalRevenue(request, response){
        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get revenue
            const totalRevenue = await Analytics.getTotalRevenue(business.id, firstDayOfMonth, lastDayOfMonth)
            
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
    static async getAnalytics(request, response){
        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get range
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            firstDayOfMonth.setHours(0, 0, 0, 0);
            
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            lastDayOfMonth.setHours(23, 59, 59, 999);

            // get analytics
            const data = {
                totalrevenue: await Analytics.getTotalRevenue(business.reference, firstDayOfMonth, lastDayOfMonth),
                newclients: await Analytics.getNewClients(business.reference, firstDayOfMonth, lastDayOfMonth),
                debtors: await Analytics.getDebtors(business.reference, firstDayOfMonth, lastDayOfMonth),
                numOfInvoices: await Analytics.getNumOfInvoices(business.reference, firstDayOfMonth, lastDayOfMonth),
                topClients: await Analytics.getTopClients(business.reference, firstDayOfMonth, lastDayOfMonth),
            }
                    
            
            return response.status(200).json({
                status:true,
                success:true,
                data: data
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
    AnalyticsController
};