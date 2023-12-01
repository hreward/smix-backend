const uuid = require('uuid');
const { knex } = require('./db.model');

class Transaction {
	_reference;
	_businessid;
	_invoiceid;
	_clientid;
	_amount;
	_currency;
	_channel;
	_createdAt;
	_status;

	constructor(reference, businessid, invoiceid, clientid, amount, currency, channel, status, createdAt) {
		this._reference = reference;
		this._businessid = businessid;
		this._invoiceid = invoiceid;
		this._clientid = clientid;
		this._amount = amount;
		this._currency = currency;
		this._channel = channel;
		this._status = status;
		this._createdAt = createdAt;
	}

	// Getters and setters
	get reference() {
		return this._reference;
	}

	get businessid() {
		return this._businessid;
	}
	set businessid(value) {
		this._businessid = value;
	}

	get invoiceid() {
		return this._invoiceid;
	}
	set invoiceid(value) {
		this._invoiceid = value;
	}

	get clientid() {
		return this._clientid;
	}
	set clientid(value) {
		this._clientid = value;
	}

	get amount() {
		return this._amount;
	}

	set amount(amount) {
		this._amount = amount;
	}
	
	get currency() {
		return this._currency;
	}
	set currency(value) {
		this._currency = value;
	}

	get channel() {
		return this._channel;
	}
	set channel(value) {
		this._channel = value;
	}

	get status() {
		return this._status;
	}
	set status(value) {
		this._status = value;
	}

	get createdAt() {
		return this._createdAt;
	}

	
	static async create(businessid, invoiceid, clientid, amount, currency, channel, status) {
		const reference = uuid.v4().replace("-", "").slice(0, 12);
		await knex('transactions').insert({
			reference,
			business_reference: businessid,
			invoice_reference: invoiceid,
			client_reference: clientid,
			amount,
			currency,
			channel,
			created_at: new Date(),
			status
		}).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		return new Transaction(reference, businessid, invoiceid, clientid, amount, channel, status, new Date());
	}

	toJSON(){
		return {
			reference: this.reference,
			businessid: this.businessid,
			invoiceid: this.invoiceid,
			clientid: this.clientid,
			amount: this.amount,
			currency: this.currency,
			channel: this.channel,
			status: this.status,
			createdat: this.createdAt
		}
	}
}

module.exports = {Transaction};
