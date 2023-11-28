const { knex } = require("./db.model");
const { Invoice } = require("./invoice.model");
const { Transaction } = require("./transaction.Model");

class InvoiceTransactionManager {
	
	static async getInvoiceTransactions(invoiceid) {
		const transactions = await knex('transactions').where({ invoice_reference: invoiceid }).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		return transactions.map((tranx)=>{
			return new Transaction(tranx.reference, tranx.business_reference, tranx.invoice_reference, tranx.client_reference, tranx.amount, tranx.currency, tranx.channel, tranx.status, tranx.created_at);
		});
	}

}

module.exports = {InvoiceTransactionManager}