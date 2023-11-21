const { knex } = require('./db.model');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const { User } = require('./user.model');

class Auth {
	static async authenticateUser(email, password) {
		const user = await knex('users').where({ email }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!user) {
			throw new Error(`User with email ${email} not found`);
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			throw new Error(`Incorrect password`);
		}
		return user.uuid;
	}

	static async authorizeUser(userId, loginData) {
		const user = await knex('users').where({ uuid: userId }).first().catch(
			(error)=>{throw new Error(`internal error ${error}`);}
		);
		if (!user) {
			throw new Error(`User with ID ${userId} not found`);
		}

		let token = uuid.v4().replace("-","");
		await knex('auth_tokens').insert({
			user_id: userId,
			user_email:loginData.email,
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
		// TODO grant user role access
	}

	static async unAuthorizeUser(userId, token) {
		await knex('auth_tokens').where({ user_id: userId, token }).delete().catch(
			(error)=>{throw new Error("internal error");}
		);
		return true;
	}

	static async getUserbyToken(token) {
		const auth_token = await knex('auth_tokens').where({ token:token }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!auth_token) {
			throw new Error(`Session token '${token}' not found`);
		}
		
		const user = User.findById(auth_token.userId);
		return user;
	}

	static async authenticateTokenAccess(loginData) {
        const auth_token = await knex('auth_tokens').where({token:loginData.token, browser: loginData.browser, device_name: loginData.device_name, status: 'active'}).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!auth_token) {
			throw new Error(`Session token '${loginData.token}' not found`);
		}
		
		const user = User.findById(auth_token.user_id);
		return user;
	}
}


module.exports = {Auth};