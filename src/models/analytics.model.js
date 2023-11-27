const { Client } = require("./client.model");
const { knex } = require("./db.model");

class Analytics {
	
	static async getTotalRevenue(businessid, startDate, endDate) {
		const revenue = await knex('invoices')
        .sum('amount_paid as total')
        .where({ business_reference: businessid })
        .whereBetween('created_at', [startDate, endDate])
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		return revenue[0].total;
	}
	
	static async getNewClients(businessid, startDate, endDate) {
		const clients = await knex('clients')
        .count('id as total')
        .where({ business_reference: businessid })
        .whereBetween('created_at', [startDate, endDate])
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		return clients[0].total
	}
	
	static async getDebtors(businessid, startDate, endDate) {
		const debtors = await knex('clients')
        .count('id as total')
        .where({ business_reference: businessid })
        .whereNot({status: 'paid'})
        .whereBetween('created_at', [startDate, endDate])
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		return debtors[0].total
	}
	
	static async getNumOfInvoices(businessid, startDate, endDate) {
		const clients = await knex('invoices')
        .count('id as total')
        .where({ business_reference: businessid })
        .whereBetween('created_at', [startDate, endDate])
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		return clients[0].total
	}
	
	static async getTopClients(businessid, startDate, endDate) {
		const invoices = await knex('invoices')
        .select('client_reference')
        .sum('amount_paid as total_amount')
        .groupBy('client_reference')
        .where({ business_reference: businessid })
        .orderBy('amount_paid', 'desc')
        .whereBetween('created_at', [startDate, endDate])
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		return Promise.all(
            invoices.map(async (invoice)=>{
                const client = (await Client.findById(invoice.client_reference)).toJSON();
                console.log(client)
                client.totalamount = invoice.total_amount;
                return client;
            })
        );
        return invoices;
	}

}

module.exports = {Analytics}