const { knex } = require("./db.model");
const { Transaction } = require("./transaction.Model");

class BusinessTransactionManager {
	
	static async getBusinessTransactions(businessid) {
		const transactions = await knex('transactions').where({ business_reference: businessid }).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		
		return transactions.map((tranx)=>{
			return new Transaction(tranx.reference, tranx.business_reference, tranx.invoice_reference, tranx.client_reference, tranx.amount, tranx.currency, tranx.channel, tranx.status, tranx.created_at);
		});
	}

    static async searchBusinessTransactions(businessid, searchTerm, perPage=50){

		const transactions = await knex("transactions")
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

		return transactions.map((tranx)=>{
			return new Transaction(tranx.reference, tranx.business_reference, tranx.invoice_reference, tranx.client_reference, tranx.amount, tranx.currency, tranx.channel, tranx.status, tranx.created_at);
		});
	}
}

module.exports = {BusinessTransactionManager}