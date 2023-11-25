const { knex } = require('./db.model');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const { User } = require('./client.model');
const { Business } = require('./business.model');

class Auth {
	static async authenticateBusiness(email, password) {
		const business = await knex('businesses').where({ email }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!business) {
			throw new Error(`Business with email ${email} not found`);
		}
		const passwordMatch = await bcrypt.compare(password, business.password);
		if (!passwordMatch) {
			throw new Error(`Incorrect password`);
		}
		return business.reference;
	}

	static async authorizeBusiness(businessid, loginData) {
		const business = await knex('businesses').where({ reference: businessid }).first().catch(
			(error)=>{throw new Error(`internal error ${error}`);}
		);
		if (!business) {
			throw new Error(`Business with ID ${businessid} not found`);
		}

		let token = uuid.v4().replace("-","");
		await knex('auth_tokens').insert({
			business_reference: businessid,
			business_email:loginData.email,
			token,
            device_signature: loginData.device_signature,
            browser: loginData.browser,
            device_name: loginData.device_name,
			created_at: new Date(),
			status: "active"
		}).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
		return token;
		// TODO grant business role access
	}

	static async unAuthorizeBusiness(businessid, token) {
		await knex('auth_tokens').where({ business_reference: businessid, token }).delete().catch(
			(error)=>{throw new Error("internal error");}
		);
		return true;
	}

	static async getBusinessbyToken(token) {
		const authToken = await knex('auth_tokens').where({ token:token }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!authToken) {
			throw new Error(`Session token '${token}' not found`);
		}
		
		const business = Business.findById(authToken.business_reference);
		return business;
	}

	static async authenticateTokenAccess(loginData) {
        const authToken = await knex('auth_tokens').where({token:loginData.token, browser: loginData.browser, device_name: loginData.device_name, status: 'active'}).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!authToken) {
			throw new Error(`Session token '${loginData.token}' not found`);
		}
		
		const business = Business.findById(authToken.business_reference);
		return business;
	}
}


module.exports = {Auth};