const uuid = require('uuid');
const { knex } = require('./db.model');

class Transaction {
	// _reference
	// _senderWallet
	// _recipientWallet
	// _amount
	// _narration;
	// _createdAt;
	// _status;

	constructor(reference, type, senderWallet, recipientWallet, amount, narration, createdAt, status) {
		this._reference = reference;
		this._type = type;
		this._senderWallet = senderWallet;
		this._recipientWallet = recipientWallet;
		this._amount = amount;
		this._narration = narration;
		this._createdAt = createdAt;
		this._status = status;
	}

	// Getters and setters
	get reference() {
		return this._reference;
	}

	get senderWallet() {
		return this._senderWallet;
	}

	set senderWallet(senderWallet) {
		this._senderWallet = senderWallet;
	}

	get type() {
		return this._type;
	}

	set type(type) {
		this._type = type;
	}

	get recipientWallet() {
		return this._recipientWallet;
	}

	set recipientWallet(recipientWallet) {
		this._recipientWallet = recipientWallet;
	}

	get amount() {
		return this._amount;
	}

	set amount(amount) {
		this._amount = amount;
	}

	get createdAt() {
		return this._createdAt;
	}

	get narration() {
		return this._narration;
	}
	set narration(value) {
		this._narration = value;
	}

	get status() {
		return this._status;
	}
	set status(value) {
		this._status = value;
	}

	
	static async create(type, senderWallet, recipientWallet, amount, narration, channel, status) {
		
		const reference = uuid.v4().replace("-", "");
		const result = await knex('transactions').insert({
			reference,
			type,
			amount,
			channel,
			sender_wallet: senderWallet,
			recipient_wallet: recipientWallet,
			narration,
			created_at: new Date(),
			status
		}).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		return new Transaction(reference, type, senderWallet, recipientWallet, amount, narration, new Date(), channel, status);
	}
	
	static async findAllByWallet(walletId) {
		const transactions = await knex('transactions').where({senderWallet: walletId}).orWhere({recipientWallet: walletId}).orderBy('created_at', 'desc').catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		return transactions.map((transaction) => {
			return new Transaction(transaction.reference, transaction.type, transaction.sender_wallet, transaction.recipient_wallet, transaction.amount, transaction.narration, transaction.created_at, transaction.channel, transaction.status);
		});
		
	}
	
	static async findTransactionByWallet(tranxId, walletId) {
		const transaction = await knex('transactions').where('reference', tranxId).where('senderWallet', walletId).orWhere('recipientWallet', walletId).andWhere('reference', tranxId).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if(!transaction){
			throw new Error("Transaction not found");
		}
		return new Transaction(transaction.reference, transaction.type, transaction.sender_wallet, transaction.recipient_wallet, transaction.amount, transaction.narration, transaction.created_at, transaction.channel, transaction.status);
	}

	toJSON(){
		const ddd = {
			reference: this.reference,
			type: this.type,
			senderWallet: this.senderWallet,
			recipientWallet: this.recipientWallet,
			amount: this.amount,
			narration: this.narration,
			status: this.status,
			createdAt: this.createdAt
		}
		return ddd;
	}
}

module.exports = {Transaction};
