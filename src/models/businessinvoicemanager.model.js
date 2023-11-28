const { knex } = require("./db.model");
const { Client } = require("./client.model");
const { Invoice } = require("./invoice.model");

class BusinessInvoiceManager {
	
	static async getBusinessInvoices(businessid) {
		const invoices = await knex('invoices').where({ business_reference: businessid }).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		return invoices.map((invoice)=>{
			const thisInvoice = new Invoice(invoice.reference, invoice.business_reference, invoice.client_reference, invoice.currency, invoice.due_date, invoice.amount, invoice.amount_paid, invoice.status, invoice.created_at, invoice.updated_at);
			return thisInvoice;
		});
	}

    static async searchBusinessInvoices(businessid, searchTerm, perPage=50){

		const invoices = await knex("invoices")
        .where({business_reference: businessid})
        .andWhere((qq)=>{
            qq = qq.whereILike('reference', `%${searchTerm}%`)
            .orWhereILike('created_at', `%${searchTerm}%`)
        })
        .limit(perPage)
        .orderBy("created_at", "desc")
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

		
		return invoices.map((invoice)=>{
			const thisInvoice = new Invoice(invoice.reference, invoice.business_reference, invoice.client_reference, invoice.currency, invoice.due_date, invoice.amount, invoice.amount_paid, invoice.status, invoice.created_at, invoice.updated_at);
			return thisInvoice;
		});
	}
}

module.exports = {BusinessInvoiceManager}