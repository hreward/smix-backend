const {knex} = require('./db.model');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

class User {
	_id 
	_firstName;
	_lastName;
	_email;
	_phone;
	_sex;
	_dob;
	_country;
	_address;
	_password;
	_avatar;
	_createdAt;
	_updatedAt;
	_status;
	

	constructor(id, firstName, lastName, email, password, createdAt = new Date(), updatedAt = new Date()) {
		this._id = id;
		this._firstName = firstName;
		this._lastName = lastName;
		this._email = email;
		this._password = password;
		this._createdAt = createdAt;
    	this._updatedAt = updatedAt;
	}

	// Getters and setters
	get id() {
		return this._id;
	}

	get firstName() {
		return this._firstName;
	}

	set firstName(firstName) {
		this._firstName = firstName;
	}

	get lastName() {
		return this._lastName;
	}

	set lastName(lastName) {
		this._lastName = lastName;
	}

	get email() {
		return this._email;
	}

	set email(email) {
		this._email = email;
	}

	get phone() {
		return this._phone;
	}
	set phone(value) {
		this._phone = value;
	}

	get sex() {
		return this._sex;
	}
	set sex(value) {
		this._sex = value;
	}

	get dob() {
		return this._dob;
	}
	set dob(value) {
		this._dob = value;
	}

	get country() {
		return this._country;
	}
	set country(value) {
		this._country = value;
	}

	get address() {
		return this._address;
	}
	set address(value) {
		this._address = value;
	}

	get status() {
		return this._status;
	}
	set status(value) {
		this._status = value;
	}

	get avatar() {
        const parentLink = `${process.env.cdnLink}profileimages/`;
        if(this._avatar && this._avatar.length > 2){
		    return `${parentLink}${this._avatar}`;
        } else {
    		return `${parentLink}defaultavatar.png`;
        }
	}
	set avatar(value) {
		this._avatar = value;
	}

	
	async verifyPassword(password) {
		const passwordMatch = await bcrypt.compare(password, this._password);
		if (passwordMatch) {
			return true;
		} else {
			return false;
		}
	}

	async setPassword(password) {
		this._password = bcrypt.hashSync(password, 10);
	}

	get createdAt() {
		return this._createdAt;
	}

	get updatedAt() {
		return this._updatedAt;
	}

	
	static async findById(id) {
		const user = await knex('users').where({ uuid:id }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!user) {
			throw new Error(`User with id ${id} not found`);
		}
		const thisUser = new User(user.uuid, user.firstname, user.lastname, user.email, user.password, user.created_at, user.updated_at);
		
		thisUser.phone = user.phone;
		thisUser.status = user.status;
		thisUser.sex = user.sex;
		thisUser.country = user.country;
		thisUser.address = user.address;
		thisUser.dob = user.dob;
		thisUser.avatar = user.avatar;
		return thisUser;
	}

	static async findByEmail(email) {
		const user = await knex('users').where({ email }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!user) {
			throw new Error(`User with email ${email} not found`);
		}
		const thisUser = new User(user.uuid, user.firstname, user.lastname, user.email, user.password, user.created_at, user.updated_at);
		thisUser.phone = user.phone;
		thisUser.status = user.status;
		thisUser.sex = user.sex;
		thisUser.country = user.country;
		thisUser.address = user.address;
		thisUser.dob = user.dob;
		thisUser.avatar = user.avatar;
		return thisUser;
	}

	async save() {
		const existingUser = await knex('users').where({ email: this.email }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingUser && existingUser.uuid !== this.id) {
			throw new Error(`User with email ${this.email} already exists`);
		}
		if (existingUser && existingUser.uuid === this.id) {
			await knex('users').where({ uuid: this.id }).update({
				firstname: this.firstName,
				lastname: this.lastName,
				email: this.email,
				password: this._password,
				phone: this.phone,
				sex: this.sex,
				dob: this.dob,
				country: this.country,
				address: this.address,
				avatar: this._avatar,
				status: this.status,
				updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		} else {
			await knex('users').insert({
				uuid: this.id,
				firstname: this.firstName,
				lastname: this.lastName,
				email: this.email,
				password: this._password,
				phone: this.phone,
				sex: this.sex,
				dob: this.dob,
				country: this.country,
				address: this.address,
				avatar: this._avatar,
				status: this.status,
				created_at: new Date(),
				updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		}
	}

	async getUserBankAccount(){
		const bank = await knex("bank_accounts").where({user_id: this.id}).first()
		.catch((error)=>{throw new Error("internal error"+error);});
		
		if(bank){
			return [
				{
					bankname: bank.bank_name,
					bankcode: bank.bank_code,
					accountname: bank.account_name,
					accountnumber: bank.account_number,
				}
			]
		} else {
			return null;
		}
	}

	async saveUserBankAccount(bankname, bankcode, accountname, accountnumber){
		const existingAcct = await knex('bank_accounts').where({ user_id: this.id }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingAcct) {
			await knex('bank_account').where({ uuid: this.id }).update({
				bank_name: bankname,
				bank_code: bankcode,
				account_name: accountname,
				account_number: accountnumber,
				status: this.status
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		} else {
			const bankRef = uuid.v4().replace(/-/g, "");
			await knex('bank_accounts').insert({
				reference: bankRef,
				user_id: this.id,
				bank_name: bankname,
				bank_code: bankcode,
				account_name: accountname,
				account_number: accountnumber,
				status: this.status,
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		}
	}

	async delete() {
		await knex('users').where({uuid: this.id}).update({status: 'deleted'}).then(
			async (value)=>{
				await knex('wallets').where({userId: this.id}).update({status: 'deleted'})
					.catch((error)=>{throw new Error("internal error"+error);});
				await knex("auth_tokens").where({userId: this.id}).delete();
			}
		).catch((error)=>{throw new Error("internal error"+error);})
	}
	
	async permanentDelete() {
		await knex('users').where({ uuid: this.id }).delete().then(
			async (value)=>{
				await knex('wallets').where({userId: this.id}).delete();
				await knex("auth_tokens").where({userId: this.id}).delete();
			}
		).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
	}
}

module.exports = {User};