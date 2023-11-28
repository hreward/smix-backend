const {knex} = require('./db.model');
const bcrypt = require('bcryptjs');

class Card {

	_reference;
	_userId;
	_token;
	_type;
	_issuer;
	_country;
	_firstDigits;
	_lastDigits;
	_expiryDate;
	_createdAt;
	_updatedAt;
	_status;

	get reference() {
		return this._reference;
	}
	set reference(value) {
		this._reference = value;
	}

	get userId() {
		return this._userId;
	}
	set userId(value) {
		this._userId = value;
	}

	get token() {
		return this._token;
	}
	set token(value) {
		this._token = value;
	}

	get type() {
		return this._type;
	}
	set type(value) {
		this._type = value;
	}

	get issuer() {
		return this._issuer;
	}
	set issuer(value) {
		this._issuer = value;
	}

	get country() {
		return this._country;
	}
	set country(value) {
		this._country = value;
	}

	get firstDigits() {
		return this._firstDigits;
	}
	set firstDigits(value) {
		this._firstDigits = value;
	}

	get lastDigits() {
		return this._lastDigits;
	}
	set lastDigits(value) {
		this._lastDigits = value;
	}

	get expiryDate() {
		return this._expiryDate;
	}
	set expiryDate(value) {
		this._expiryDate = value;
	}
	
	get createdAt() {
		return this._createdAt;
	}
	set createdAt(value) {
		this._createdAt = value;
	}

	get updatedAt() {
		return this._updatedAt;
	}
	set updatedAt(value) {
		this._updatedAt = value;
	}

	get status() {
		return this._status;
	}
	set status(value) {
		this._status = value;
	}
	
	constructor(reference, userId, token,  type, issuer, country, firstDigits, lastDigits, expiryDate, status, createdAt = new Date(), updatedAt = new Date()) {
		this.reference = reference,
		this.userId = userId,
		this.token = token,
		this.type = type,
		this.issuer = issuer,
		this.country = country,
		this.firstDigits = firstDigits,
		this.lastDigits = lastDigits,
		this.expiryDate = expiryDate,
		this.createdAt = createdAt,
		this.updatedAt = updatedAt,
		this.status = status
	}


	static async findByFirstLastDigits(firstDigits, lastDigits) {
		const card = await knex('cards').where({ first_digits: firstDigits, last_digits: lastDigits }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!card) {
			return null;
		}
        
		return new Card(card.reference, card.user_id, card.token, card.type, card.issuer, card.country, card.first_digits, card.last_digits, card.expiry_date, card.status, card.created_at, card.updated_at);
	}

	static async findByRef(reference) {
		const card = await knex('cards').where({ reference:reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!card) {
			throw new Error(`Card with ref ${reference} not found`);
		}
        
		return new Card(card.reference, card.user_id, card.token, card.type, card.issuer, card.country, card.first_digits, card.last_digits, card.expiry_date, card.status, card.created_at, card.updated_at);
	}

	static async getUserCards(userId){
		const cards = await knex("cards").where({user_id:userId}).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		return cards.map((card)=>{
			return new Card(card.reference, card.user_id, card.token, card.type, card.issuer, card.country, card.first_digits, card.last_digits, card.expiry_date, card.status, card.created_at, card.updated_at);
		});
	}

	async save() {
		const existingCard = await knex('cards').where({ first_digits: this.firstDigits, last_digits: this.lastDigits }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingCard && existingCard.user_id === this.userId) {
			throw new Error(`Card with no. ${this.firstDigits} **** **** ${this.lastDigits} already exists`);
		}
		// if (existingUser && existingUser.uuid === this.id) {
		// 	await knex('cards').where({ uuid: this.id }).update({
		// 		type: this.type,
		// 		issuer: this.issuer,
		// 		country: this.country,
		// 		first_digits: this.firstDigits,
		// 		last_digits: this.lastDigits,
		// 		expiry_date: this.expiryDate,
		// 		status: this.status,
		// 		updated_at: new Date(),
		// 	}).catch(
		// 		(error)=>{throw new Error("internal error"+error);}
		// 	);
		// } else {}

		await knex('cards').insert({
			reference: this.reference,
			user_id: this.userId,
			token: this.token,
			type: this.type,
			issuer: this.issuer,
			country: this.country,
			first_digits: this.firstDigits,
			last_digits: this.lastDigits,
			expiry_date: this.expiryDate,
			status: this.status,
			created_at: new Date(),
			updated_at: new Date(),
		}).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
	}

	async delete() {
		await knex('cards').where({ reference: this.reference }).delete()
		.catch(
			(error)=>{throw new Error("internal error"+error);}
		);
	}

	toJSON(){
		return {
			reference: this.reference, type: this.type, issuer: this.issuer, country: this.country,	first_digits: this.firstDigits, last_digits: this.lastDigits,	expiry_date: this.expiryDate, created_at: this.createdAt,	updated_at: this.updatedAt, status: this.status
		}
	}
}

module.exports = {Card};