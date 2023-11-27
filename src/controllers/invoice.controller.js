const { Client } = require("../models/client.model");
const { body, validationResult, param } = require('express-validator');
const uuid = require("uuid");
const { Business } = require("../models/business.model");
const { Invoice } = require("../models/invoice.model");
const { InvoiceItem } = require("../models/invoiceitem.model");
const { BusinessInvoiceManager } = require("../models/businessinvoicemanager.model");
const { Transaction } = require("../models/transaction.Model");
const { InvoiceTransactionManager } = require("../models/invoicetransactionmanager.model");


class InvoiceController{

    static async newInvoice(request, response){
        
        // Do input validation
        const validationRules = [
            body('clientid').isLength({ min: 3, max: 50 }).withMessage('Invalid client id'),
            body('duedate').isDate({format: "mm-dd-yyyy", strictMode: false}).withMessage('Invalid due date'),
            body('currency').notEmpty().withMessage("Invalid currency selected"),
            body('items').notEmpty().isArray().withMessage("No item on the invoice"),
            body('items.*.description').isLength({ min: 3, max:50 }).withMessage('One or more item description missing.'),
            body('items.*.quantity').notEmpty().withMessage('One or more item quantity missing.'),
            body('items.*.quantity').toInt().isInt().withMessage('One or more item quantity is invalid.'),
            body('items.*.rate').notEmpty().withMessage('One or more item rate missing.'),
            body('items.*.rate').toFloat().isFloat().withMessage('One or more item rate is invalid.'),
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
        const { clientid, duedate, currency, item_description, item_quantity, item_rate, items } = request.body;

        try {
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to login");

            const client = await Client.findById(clientid);

            // cascade invoice
            const invoiceId = uuid.v4().replace("-","").slice(0, 8).toUpperCase();
            const invoice = new Invoice(invoiceId, business.reference, client.id, currency, duedate, 0, 0, 'unpaid');

            // cascade items
            var serialNumber = 0;
            var totalAmount = 0;
            await Promise.all(
                items.map(async (item) => {
                    serialNumber++;
                    const itemId = uuid.v4();
                    const amount = item.quantity * item.rate;
                    const thisItem = new InvoiceItem(itemId, business.reference, invoiceId, serialNumber, item.description, item.quantity, item.rate, amount );
                    await thisItem.save();

                    // add item amount to invoice amount
                    totalAmount += amount;
                }),
            );

            // save invoice
            invoice.amount = totalAmount;
            await invoice.save();

            //return response
	        return response.status(200).json({
	            status:true,
	            success:true,
	            message: "Invoice created successfully"
	        });
        } catch (error) {
            return response.status(500).json({
                status:true,
                success:false,
                message:error.message
            });
        }
                    
    }

    static async invoiceDetails(request, response){
        
        // Do input validation
        const validationRules = [
            param('invoiceid').trim().isLength({min: 5, max: 15}).withMessage('Invalid invoice id')
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
        const { invoiceid } = request.params;

        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get invoice
            const invoice = await Invoice.findById(invoiceid);

            // confirm client for this business
            if(business.reference !== invoice.businessid){
                throw new Error(`Invoice with id ${invoiceid} not found`)
            }
            
            // get invoice items
            const invoicejson = invoice.toJSON();
            invoicejson.items = await InvoiceItem.findByInvoice(invoice.reference);

            // get invoice transactions
            const transactions = await InvoiceTransactionManager.getInvoiceTransactions(invoice.reference);
            const transactionsArr = [];
            await Promise.all(
                transactions.map(async (tranx)=>{
                    tranx = tranx.toJSON();
                    tranx.client = await Client.findById(tranx.clientid);
                    transactionsArr.push(tranx);
                })
            );
            invoicejson.transactions = transactionsArr;

            // return response
            return response.status(200).json({
                status:true,
                success:true,
                data: invoicejson
            });
        } catch (error) {
            console.error(error)
            return response.status(200).json({
                status:true,
                success:false,
                message: error.message
            });
        }
    }

    static async getInvoices(request, response){
        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get client
            const invoices = await BusinessInvoiceManager.getBusinessInvoices(business.reference);
            
            return response.status(200).json({
                status:true,
                success:true,
                data: invoices
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

    static async deleteInvoice(request, response){
        
        // Do input validation
        const validationRules = [
            param('invoiceid').trim().isLength({min: 5, max: 15}).withMessage('Invalid invoice id')
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
        const { invoiceid } = request.params;

        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get client
            const invoice = await Invoice.findById(invoiceid);

            // confirm client for this business
            if(business.reference !== invoice.businessid){
                throw new Error(`Invoice with id ${invoiceid} not found`)
            }

            // confirm invoice has not been paid
            if(invoice.status !== 'unpaid'){
                throw new Error(`Payment has been made for invoice and cannot be deleted`)
            }

            await invoice.permanentDelete();

            return response.status(200).json({
                status:true,
                success:true,
                message: `Client '${invoice.name}' removed successfully.`
            });
        } catch (error) {
            return response.status(200).json({
                status:true,
                success:false,
                message: error.message
            });
        }
    }

    static async makePayment(request, response){
        
        // Do input validation
        const validationRules = [
            param('invoiceid').trim().isLength({min: 5, max: 15}).withMessage('Invalid invoice id'),
            body('amount').trim().toFloat().isFloat().withMessage('Invalid payment amount submitted')
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
        const { invoiceid } = request.params;
        const { amount } = request.body;

        try{
            //confirm login
            /**
             * @type {Business}
             */
            const business = request.business;
            if(!business) throw new Error("You need to log in.");

            // get client
            const invoice = await Invoice.findById(invoiceid);

            // confirm client for this business
            if(business.reference !== invoice.businessid){
                throw new Error(`Invoice with id ${invoiceid} not found`)
            }

            // confirm invoice has not been paid
            if(invoice.status === 'paid'){
                throw new Error(`Invoice has been paid already`)
            }
            
            const balance = invoice.amount - invoice.amountPaid;

            // check if payment will result in over payment
            if(amount > balance){
                throw new Error(`You can't overpay an invoice. Pay a maximum of ${balance} for this invoice`)
            }

            if(balance > 0){
                // create a transaction
                await Transaction.create(business.reference, invoice.reference, invoice.clientid, amount, invoice.currency, 'cash', 'successful');
                invoice.amountPaid += amount;
            }

            // check if invoice is fully paid
            const newBalance = invoice.amount - invoice.amountPaid;
            if(newBalance === 0){
                invoice.status = 'paid';
            } else {
                invoice.status = 'partly paid';
            }

            await invoice.save();

            return response.status(200).json({
                status:true,
                success:true,
                message: `Amount of ${invoice.currency} ${amount} paid successfully.`
            });
        } catch (error) {
            return response.status(200).json({
                status:true,
                success:false,
                message: error.message
            });
        }
    }
}

module.exports = {
    InvoiceController
};