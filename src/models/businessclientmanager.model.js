const { knex } = require("./db.model");
const { Client } = require("./client.model");

class BusinessClientManager {
	
	static async getBusinessClients(businessid) {
		const clients = await knex('clients').where({ business_reference: businessid }).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		return clients.map((client)=>{
			const thisClient = new Client(client.business_reference, client.reference, client.name, client.email, client.phone, client.created_at, client.updated_at);
			
			thisClient.status = client.status;
			thisClient.address = client.address;
			thisClient.avatar = client.avatar;
			return thisClient;
		});
	}

    static async searchBusinessClients(businessid, searchTerm, perPage=50){

		const clients = await knex("clients")
        .where({business_reference: businessid})
        .andWhere((qq)=>{
            qq = qq.whereILike('reference', `%${searchTerm}%`)
            .orWhereILike('name', `%${searchTerm}%`)
            .orWhereILike('address', `%${searchTerm}%`)
            .orWhereILike('phone', `%${searchTerm}%`)
            .orWhereILike('email', `%${searchTerm}%`);
        })
        .limit(perPage)
        .orderBy("created_at", "desc")
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

		
		return clients.map((client)=>{
			const thisClient = new Client(client.business_reference, client.reference, client.name, client.email, client.phone, client.created_at, client.updated_at);
			
			thisClient.status = client.status;
			thisClient.address = client.address;
			thisClient.avatar = client.avatar;
			return thisClient;
		});
	}
}

module.exports = {BusinessClientManager}