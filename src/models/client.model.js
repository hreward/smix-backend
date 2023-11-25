const {knex} = require('./db.model');

class Client {
	_businessid;
	_id;
	_name;
	_email;
	_phone;
	_address;
	_avatar;
	_createdAt;
	_updatedAt;
	_status;
	

	constructor(businessid, id, name, email, phone, createdAt = new Date(), updatedAt = new Date()) {
		this._businessid = businessid;
		this._id = id;
		this._name = name;
		this._email = email;
		this._phone = phone;
		this._createdAt = createdAt;
    	this._updatedAt = updatedAt;
	}

	// Getters and setters
	get businessid() {
		return this._businessid;
	}
	set businessid(value) {
		this._businessid = value;
	}

	get id() {
		return this._id;
	}

	get name() {
		return this._name;
	}

	set name(name) {
		this._name = name;
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
        const parentLink = `${process.env.cdnLink}clientimages/`;
        if(this._avatar && this._avatar.length > 2){
		    return `${parentLink}${this._avatar}`;
        } else {
    		return `${parentLink}defaultavatar.png`;
        }
	}
	set avatar(value) {
		this._avatar = value;
	}

	get createdAt() {
		return this._createdAt;
	}

	get updatedAt() {
		return this._updatedAt;
	}

	
	static async findById(id) {
		const client = await knex('clients').where({ reference:id }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!client) {
			throw new Error(`Client with id ${id} not found`);
		}
		const thisClient = new Client(client.business_reference, client.reference, client.name, client.email, client.phone, client.created_at, client.updated_at);
		
		thisClient.status = client.status;
		thisClient.address = client.address;
		thisClient.avatar = client.avatar;
		return thisClient;
	}

	static async findByEmail(email) {
		const client = await knex('clients').where({ email }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!client) {
			throw new Error(`Client with email ${email} not found`);
		}
		const thisClient = new Client(client.business_reference, client.reference, client.name, client.email, client.phone, client.created_at, client.updated_at);
		
		thisClient.status = client.status;
		thisClient.address = client.address;
		thisClient.avatar = client.avatar;
		return thisClient;
	}

	async save() {
		const existingClient = await knex('clients').where({ business_reference: this.businessid, email: this.email }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingClient && existingClient.reference !== this.id) {
			throw new Error(`Client with email ${this.email} already exists`);
		}
		if (existingClient && existingClient.reference === this.id) {
			await knex('clients').where({ reference: this.id }).update({
				name: this.name,
				email: this.email,
				phone: this.phone,
				address: this.address,
				avatar: this._avatar,
				status: this.status,
				updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		} else {
			await knex('clients').insert({
				business_reference: this.businessid,
				reference: this.id,
				name: this.name,
				email: this.email,
				phone: this.phone,
				address: this.address,
				avatar: this._avatar,
				status: 'active',
				created_at: new Date(),
				updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		}
	}

	async delete() {
		await knex('clients').where({business_reference:this.businessid, reference: this.id}).update({status: 'deleted'})
		.catch((error)=>{throw new Error("internal error"+error);})
	}
	
	async permanentDelete() {
		await knex('clients').where({ business_reference:this.businessid, reference: this.id }).delete()
		.catch((error)=>{throw new Error("internal error"+error);});
		
	}

	async restore() {
		await knex('clients').where({business_reference:this.businessid, reference: this.id}).update({status: 'active'})
		.catch((error)=>{throw new Error("internal error"+error);})
	}

	toJSON(){
		return {
			business_reference: this.businessid,
			email: this.email,
			name: this.name,
			id: this.id,
			phone: this.phone,
			address: this.address,
			avatar: this.avatar,
			status: this.status,
			createdat: this.createdAt,
			updatedat: this.updatedAt
		}
	}
}

module.exports = {Client};